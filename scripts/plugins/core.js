import fs from 'node:fs';
import path from 'path';
import { getEnabledPlugins } from './shared.js';
import { globSync, writeFile } from '../shared/fileHelpers.js';
import { sanitizePath } from '../shared/path.js';
/**
 *
 * @param {*} pluginName
 * @return {{ client: Array<string>, server: Array<string>, shared: Array<string> }}
 */
function copyPluginFiles(pluginName) {
    const pluginFolder = sanitizePath(path.join(process.cwd(), 'src/core/plugins', pluginName));
    const files = globSync(path.join(pluginFolder, '@(client|server)/index.ts'));

    const hasClientFiles = !!files.find((file) => file.includes('client/index.ts'));
    const hasServerFiles = !!files.find((file) => file.includes('server/index.ts'));
    const hasSharedFiles = fs.existsSync(sanitizePath(path.join(pluginFolder, 'shared')));

    return {
        client: hasClientFiles,
        server: hasServerFiles,
        shared: hasSharedFiles,
    };
}

function writeServerImports(plugins) {
    if (!plugins.length) return;

    const importsHeader = `// THIS FILE IS AUTOMATICALLY GENERATED. DO NOT MODIFY CONTENTS\n\n`;

    let content = importsHeader + "import * as plugins from '../../../server/systems/plugins';\n\n";

    content =
        content +
        plugins
            .map((pluginName) => {
                return `import '../../${pluginName}/server';`;
            })
            .join('\n');

    content = content + `\n\nplugins.init();\n`;

    const importPath = sanitizePath(path.join(process.cwd(), 'resources/core/plugins/athena/server/imports.js'));
    writeFile(importPath, content);
}

function writeClientImports(plugins) {
    if (!plugins.length) return;

    const importsHeader = `// THIS FILE IS AUTOMATICALLY GENERATED. DO NOT MODIFY CONTENTS\n\n`;

    const content =
        importsHeader +
        plugins
            .map((pluginName) => {
                return `import '../../${pluginName}/client';`;
            })
            .join('\n');

    const importPath = sanitizePath(path.join(process.cwd(), 'resources/core/plugins/athena/client/imports.js'));
    writeFile(importPath, content + '\n');
}

export function runPluginsCompiler() {
    const enabledPlugins = getEnabledPlugins();

    const clientImports = [];
    const serverImports = [];

    for (const pluginName of enabledPlugins) {
        const result = copyPluginFiles(pluginName);

        if (result.client) {
            clientImports.push(pluginName);
        }

        if (result.server) {
            serverImports.push(pluginName);
        }
    }

    writeServerImports(serverImports);
    writeClientImports(clientImports);
}
