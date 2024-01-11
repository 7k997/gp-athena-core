const pluginFolders = ['sounds', 'images', 'icons', 'videos'];

/**
 * Path Resolver Copy from src-webviews/src/utility/pathResolver.ts
 * @param currentPath
 * @param pluginName
 * @returns
 */
export default function resolvePath(currentPath: string, pluginName = ''): string {
    if (!currentPath) {
        return '';
    }

    // Handles @plugins pathing
    if (currentPath.includes('@plugins') || currentPath.includes('@AthenaPlugins')) {
        for (const pluginFolder of pluginFolders) {
            if (!currentPath.includes(pluginFolder)) {
                continue;
            }

            if (currentPath.includes('@AthenaPlugins')) {
                currentPath = currentPath.replace(new RegExp('.*@AthenaPlugins', 'gm'), './plugins/');
            } else {
                currentPath = currentPath.replace(new RegExp('.*@plugins', 'gm'), './plugins/');
            }
        }
        return currentPath;
    }

    // Handles Older Path Values - Previous Item Types
    if (!currentPath.includes('../') && !currentPath.includes('assets/')) {
        return `./assets/icons/${currentPath}`;
    }

    while (currentPath.includes('../')) {
        currentPath = currentPath.replace('../', '');
    }

    if (currentPath.includes('/assets/')) {
        currentPath = currentPath.replace('/assets/', './assets/');
    } else if (currentPath.includes('assets/')) {
        currentPath = currentPath.replace('assets/', './assets/');
    }

    return currentPath;
}
