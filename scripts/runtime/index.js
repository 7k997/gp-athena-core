import { ChildProcess, spawn } from 'child_process';
import fkill from 'fkill';
import fs from 'fs';
import crypto from 'crypto';
import { copySync, globSync, areKeyResourcesReady } from '../shared/fileHelpers.js';
import { buildResources } from '../buildresource/index.js';
import { runCoreCompiler } from '../compiler/core.js';
import { runPluginsCompiler } from '../plugins/core.js';
import { copyPluginFiles } from '../plugins/files.js';
import { compileWebviewPlugins } from '../plugins/webview.js';
import { updatePluginDependencies } from '../plugins/update-dependencies.js';
import express from 'express';
import path from 'path';
import toml from '@iarna/toml';

const cdnApp = express();
const cdnPort = 80;

const NO_SPECIAL_CHARACTERS = new RegExp(/^[ A-Za-z0-9_-]*$/gm);

const ports = [7788, 'altv-server', 'altv-server.exe', 3399, 3001];
const node = 'node';

const isLinux = process.platform === 'win32' ? false : true;

const npx = !isLinux ? 'npx.cmd' : 'npx';
const npm = !isLinux ? 'npm.cmd' : 'npm';
const serverBinary = !isLinux ? 'altv-server.exe' : './altv-server';

const passedArguments = process.argv.slice(2).map((arg) => arg.replace('--', ''));
const fileNameHashes = {};

let configName = 'prod';

if (NO_SPECIAL_CHARACTERS.test(process.cwd())) {
    console.warn(`Hey! A folder in your Athena path has special characters in it.`);
    console.warn(`Please rename your folder, or folders to a name that doesn't have special characters in it.`);
    console.warn(`Special Characters: ()[]{}|:;'<>?,!@#$%^&*+=`);
    process.exit(1);
}

/**
 * This is the alt:V Server Process
 * @type {ChildProcess} */
let lastServerProcess;

/**
 * This is the WebView Dev Server Process
 * Runs on localhost:3000;
 * @type {ChildProcess} */
let lastViteServer;

/**
 * Previous files used in runtime.
 * @type {Array<string>}
 * */
let previousGlobFiles = [];

let fileWatchTimeout = Date.now() + 1000;

function createExecTime(name) {
    const startTime = Date.now();
    return {
        stop: () => {
            console.log(`${name} - ${Date.now() - startTime}ms`);
        },
    };
}

async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

/**
 * This function waits for a process to be fully killed first.
 * @param {ChildProcess} process
 */
async function killChildProcess(process) {
    if (!process) {
        return;
    }

    while (process.killed === false) {
        process.kill();

        await new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });
    }
}

async function runFile(processName, ...args) {
    const spawnedProcess = spawn(processName, [...args], { stdio: 'inherit' });
    return new Promise((resolve) => {
        spawnedProcess.once('exit', () => {
            resolve();
        });

        spawnedProcess.on('error', (err) => {
            console.error(err);
            process.exit(1);
        });
    });
}

function handleConfiguration() {
    copySync(`./configs/${configName}.toml`, `server.toml`);
    buildResources();
}

async function handleViteDevServer() {
    if (lastViteServer && !lastViteServer.killed) {
        lastViteServer.kill();
    }

    await runFile(node, './scripts/plugins/webview.js');
    lastViteServer = spawn(
        npx,
        ['vite', './src-webviews', '--clearScreen', '--debug=true', '--host=localhost', '--port=3000'],
        { stdio: 'pipe' },
    );

    lastViteServer.stdout.on('data', (dat) => {
        console.log(dat.toString());
    });

    lastViteServer.once('close', (code) => {
        console.log(`Vite process exited with code ${code}`);
    });

    lastViteServer.on('spawn', () => {
        console.log(`>>> Vue Pages Server: https://localhost:3000`);
    });

    return await new Promise((resolve) => {
        setTimeout(resolve, 2000);
    });
}

async function handleServerProcess(shouldAutoRestart = false) {
    const file = fs.readFileSync('server.toml').toString();
    const serverConfig = toml.parse(file);

    if (lastServerProcess && !lastServerProcess.killed) {
        lastServerProcess.kill();
    }

    let shouldCreateServerLogBackup = true; //Corechange, make it configurable
    if (shouldCreateServerLogBackup) {
        fs.exists('server.log', async (exists) => {
            if (!exists) return;
            await fs.rename('server.log', 'server.log-' + new Date().getTime() + '.bak', (err) => {
                if (err) throw err;
                console.log('Server Log Backup created!');
            });
        });
    }

    if (process.platform !== 'win32') {
        await runFile('chmod', '+x', `./altv-server`);
    }

    await areKeyResourcesReady();

    if (passedArguments.includes('cdn')) {
        console.log(
            'Dirty hack (IPV6/4 Issues) - temporarily replace toml host with cdnHostHint, to pack files for a CDN.',
        );
        serverConfig.host = serverConfig.cdnHostHint;
        fs.writeFileSync('server.toml', toml.stringify(serverConfig));
        console.log(
            `Packing files for a CDN: ${serverBinary} --justpack --host ${serverConfig.cdnHostHint} --port ${serverConfig.port}`,
        );
        lastServerProcess = spawn(
            serverBinary,
            ['--justpack', `--host ${serverConfig.cdnHostHint}`, `--port ${serverConfig.port}`],
            { stdio: 'inherit' },
        );

        lastServerProcess.once('exit', () => {
            const finalDestination = `${process.cwd()}/cdn_upload`.replace(/\\/g, '/');
            console.log(`Files were packed for a CDN. ${finalDestination}`);
            process.exit(0);
        });
    } else {
        lastServerProcess = spawn(serverBinary, { stdio: 'inherit' });
    }

    lastServerProcess.once('close', async (code) => {
        console.log(`Server process exited with code ${code}`);
        if (shouldAutoRestart) {
            await handleServerProcess(shouldAutoRestart);
        }
    });
}

async function refreshFileWatching() {
    // unwatch all old files
    for (const filePath in previousGlobFiles) {
        fs.unwatchFile(filePath);
    }

    // grab all new files
    const files = globSync('./src/**/*.ts');

    // ignore `/athena/server` && `/athena/client` directories
    previousGlobFiles = files.filter((fileName) => {
        if (fileName.includes('/athena/server/')) {
            return false;
        }

        if (fileName.includes('/athena/client/')) {
            return false;
        }

        return true;
    });

    for (const filePath of previousGlobFiles) {
        fileNameHashes[filePath] = crypto.createHash('md5').update(fs.readFileSync(filePath)).digest('hex');
        fs.watch(filePath, (event) => {
            if (event === 'rename' || event === 'change') {
                if (Date.now() < fileWatchTimeout) {
                    return;
                }

                fileWatchTimeout = Date.now() + 2500;

                const current = crypto.createHash('md5').update(fs.readFileSync(filePath)).digest('hex');
                if (fileNameHashes[filePath] === current) {
                    return;
                }

                devMode(false);
                console.log(`${filePath} has changed, restarting server`);
            }
        });
    }
}

/**
 *
 * @returns {boolean}
 */
async function coreBuildProcess() {
    const timer = createExecTime('>>> Core Build Time');

    const promises = [runCoreCompiler(), runPluginsCompiler(), compileWebviewPlugins(), copyPluginFiles()];

    await Promise.all(promises);
    timer.stop();
    return true;
}

async function compileWebViewPages() {
    if (passedArguments.includes('dev')) {
        configName = 'dev';
    } else if (passedArguments.includes('devtest')) {
        configName = 'devtest';
    }

    if (!passedArguments.includes('dev')) {
        await runFile(npx, 'vite', 'build', './src-webviews');
    }
}

async function devMode(firstRun = false) {
    if (firstRun) {
        await refreshFileWatching();
        return;
    }

    await killChildProcess(lastServerProcess);

    const didCoreBuild = await coreBuildProcess();
    if (!didCoreBuild) {
        return;
    }

    await compileWebViewPages();
    handleConfiguration();

    await handleServerProcess(false);
}

async function runServer() {
    const isDev = passedArguments.includes('dev');

    // Await updating all the dependencies
    const dependencieTimer = createExecTime(`>>> Update Plugin Dependencies`);
    await updatePluginDependencies();
    dependencieTimer.stop();

    if (isDev) {
        handleViteDevServer();
    }

    // Has to build first before building the rest.
    await coreBuildProcess();
    await compileWebViewPages();
    handleConfiguration();

    if (passedArguments.includes('dev')) {
        await sleep(50);
        await devMode(true);
        await handleServerProcess(false);
        return;
    }

    await sleep(50);
    await handleServerProcess(true);
}

if (passedArguments.includes('start')) {
    for (const port of ports) {
        try {
            fkill(port, { force: true, ignoreCase: true, silent: true });
        } catch (err) {
            console.log(err);
        }
    }

    runServer();
}

if (passedArguments.includes('localCDN')) {
    try {
        // HTTPS-Optionen: Zertifikat und privater Schlüssel
        // const options = {
        //     key: fs.readFileSync('pfad/zum/privaten-schluessel.pem'),
        //     cert: fs.readFileSync('pfad/zum/zertifikat.pem')
        // };

        // Define source and destination directories
        const sourceDir = process.cwd() + '/cdn_upload';
        const destDir = process.cwd() + '/webserver';

        // Cleanup webserver directory
        // Read the contents of the directory
        // Read the contents of the destination directory
        const files = fs.readdirSync(destDir);

        // Iterate over each file in the directory and delete if it matches the condition
        for (const file of files) {
            const filePath = path.join(destDir, file);

            // Check if the file has one of the desired extensions
            if (file.endsWith('.resource') || file.endsWith('.json')) {
                // Delete the file
                fs.unlinkSync(filePath);
                console.log(`File ${filePath} successfully deleted.`);
            }
        }

        // Copy files from source to destination directory
        const sourceFiles = fs.readdirSync(sourceDir);
        for (const file of sourceFiles) {
            const sourceFile = path.join(sourceDir, file);
            const destFile = path.join(destDir, file);

            // Copy the file to the destination directory
            fs.copyFileSync(sourceFile, destFile);
            console.log(`Copied ${sourceFile} to ${destFile}`);
        }

        console.log(process.cwd() + '/webserver');
        cdnApp.use(express.static(process.cwd() + '/webserver'));
        cdnApp.listen(cdnPort, () => {
            console.log(`CDN Locale Server running on http://localhost:${cdnPort}, path: ${process.cwd()}\webserver`);
            console.log(`Remark: For testing purposes only! For production use a real CDN!`);
        });

        // // Express-Server mit HTTPS starten
        // https.createServer(options, app).listen(port, () => {
        // console.log(`Server läuft auf https://localhost:${port}`);
        // });
    } catch (err) {
        console.error('Error:', err);
    }
}
