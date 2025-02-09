import swc from '@swc/core';
import path from 'path';
import fs from 'node:fs';
import { copySync, getAllPluginFolders, getPluginFolder, globSync, writeFile } from '../shared/fileHelpers.js';
import { sanitizePath } from '../shared/path.js';

const viablePluginDisablers = ['disable.plugin', 'disabled.plugin', 'disable'];

let filesFailedToCompile = [];

function getEnabledPlugins() {
    const pluginFolder = getPluginFolder();
    const pluginFolders = getAllPluginFolders();

    return pluginFolders.filter((pluginName) => {
        const pluginPath = sanitizePath(path.join(pluginFolder, pluginName));

        for (const fileName of viablePluginDisablers) {
            const disabledPath = sanitizePath(path.join(pluginPath, fileName));

            if (fs.existsSync(disabledPath)) {
                return false;
            }
        }

        return true;
    });
}

function getFilesForTranspilation(enabledPlugins) {
    const rootPath = sanitizePath(path.join(process.cwd(), 'src/**/*.ts').replace(/\\/g, '/'));
    const files = globSync(rootPath, {
        nodir: true,
        ignore: [
            '**/node_modules/**',
            '**/core/plugins/**', // ignore plugins - will be handled seperatly
        ],
    });

    for (const pluginName of enabledPlugins) {
        const pluginPath = sanitizePath(path.join(process.cwd(), 'src/core/plugins', pluginName).replace(/\\/g, '/'));
        const pluginFiles = globSync(path.join(pluginPath, '**/*.ts').replace(/\\/g, '/'), {
            nodir: true,
            ignore: ['**/imports.ts', '**/webview/**'],
        });

        for (const file of pluginFiles) {
            files.push(file);
        }
    }

    return files;
}

function getFilesToCopy(enabledPlugins) {
    const filePath = sanitizePath(path.join(process.cwd(), 'src', '**/*.!(ts|vue)').replace(/\\/g, '/'));
    return globSync(filePath, {
        nodir: true,
        ignore: ['**/tsconfig.json', '**/dependencies.json', `**/core/plugins/!(${enabledPlugins.join('|')})/**`],
    });
}

/**
 * Resolves paths in files since SWC can't handle Athena's structure.
 * @param {string} file
 * @param {string} rawCode
 * @return {string}
 */
function resolvePaths(file, rawCode) {
    const cleanedPath = file.replace(sanitizePath(process.cwd()), '');
    const pathSplit = cleanedPath.split('/');
    pathSplit.pop(); // Remove current file
    let depth = 0;

    //Corechange: Renaming core to gp-core to avoid conflicts with openai
    while (pathSplit[pathSplit.length - 1] !== 'core' && pathSplit[pathSplit.length - 1] !== 'gp-core') {
        pathSplit.pop();
        depth += 1;
    }

    rawCode = rawCode.replaceAll(`@AthenaServer`, `../`.repeat(depth) + `server`);
    rawCode = rawCode.replaceAll(`@AthenaClient`, `../`.repeat(depth) + `client`);
    rawCode = rawCode.replaceAll(`@AthenaShared`, `../`.repeat(depth) + `shared`);
    rawCode = rawCode.replaceAll(`@AthenaPlugins`, `../`.repeat(depth) + `plugins`);
    return rawCode;
}

/**
 * Transpile / compile a typescript file
 *
 * @param {Promise<void>} file
 */
async function transpileFile(file) {
    const targetPath = file.replace('src/core/', 'resources/gp-core/').replace('.ts', '.js');
    let result;

    try {
        result = await swc.transformFile(file, {
            jsc: {
                parser: {
                    syntax: 'typescript',
                    dynamicImport: true,
                    decorators: true,
                },
                transform: {
                    legacyDecorator: true,
                    decoratorMetadata: true,
                },
                target: 'es2020',
            },
            sourceMaps: false,
        });
    } catch (err) {
        console.log(err);
        filesFailedToCompile.push(file);
    }

    if (!result) {
        console.warn(`Failed to compile: ${targetPath}`);
    }

    if (!result || !result.code) {
        return;
    }

    // The path resolvers are really awful, so writing a custom one here.
    if (result.code.includes('@Athena')) {
        result.code = resolvePaths(file, result.code);
    }

    const finalFile = `// YOU ARE EDITING COMPILED FILES. DO NOT EDIT THESE FILES \r\n` + result.code;
    writeFile(targetPath, finalFile);
}

/**
 * Transpiles all files and plugins
 *
 * @returns {Promise<void>}
 * @export
 */
export async function runCoreCompiler() {
    filesFailedToCompile = [];

    const enabledPlugins = getEnabledPlugins();

    const filesToTranspile = getFilesForTranspilation(enabledPlugins);
    const filesToCopy = getFilesToCopy(enabledPlugins);

    const resourcesFolder = sanitizePath(path.join(process.cwd(), 'resources')).replace(/\\/g, '/');
    if (!fs.existsSync(resourcesFolder)) {
        fs.mkdirSync(resourcesFolder, { recursive: true });
    }
    
    const filesAndDirectories = fs.readdirSync(resourcesFolder);

    for (const fileOrDirectory of filesAndDirectories) {
        const fullPath = sanitizePath(path.join(resourcesFolder, fileOrDirectory)).replace(/\\/g, '/');
        //Corechange prevent deletion of resources/folder like resources/mods if the project or path contains "*core*" or "*webviews*"
        if (
            !fullPath.includes('resources/core') &&
            !fullPath.includes('resources/gp-core') &&
            !fullPath.includes('resources/webviews')
        ) {
            continue;
        }

        if (fs.statSync(fullPath).isDirectory()) {
            fs.rmSync(fullPath, { recursive: true, force: true });
        }
    }

    for (const file of filesToCopy) {
        const targetPath = file.replace('src/core/', 'resources/gp-core/');
        if (file === targetPath) {
            continue;
        }

        copySync(file, targetPath);
    }

    const promises = filesToTranspile.map((file) => transpileFile(file));
    await Promise.all(promises);

    if (filesFailedToCompile.length >= 1) {
        for (let uncompiledFilePath of filesFailedToCompile) {
            console.log(uncompiledFilePath);
        }

        throw new Error(`Failed to transpile ${filesFailedToCompile.length} files`);
    }
}
