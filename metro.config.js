const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Get the zustand package directory
const zustandDir = path.dirname(require.resolve('zustand/package.json'));

// Force CommonJS resolution for zustand to avoid import.meta issues on web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    // Intercept all zustand-related imports and force CommonJS versions
    if (moduleName === 'zustand' || moduleName.startsWith('zustand/')) {
      // Build the CommonJS path using direct file path
      let cjsFile;
      if (moduleName === 'zustand') {
        cjsFile = 'index.js';
      } else {
        // For zustand/xxx, use xxx.js
        const subpath = moduleName.replace('zustand/', '');
        cjsFile = `${subpath}.js`;
      }

      const cjsPath = path.join(zustandDir, cjsFile);

      // Check if file exists
      try {
        require('fs').accessSync(cjsPath);
        return {
          filePath: cjsPath,
          type: 'sourceFile',
        };
      } catch (e) {
        // If file doesn't exist, fall back to default resolution
        return context.resolveRequest(context, moduleName, platform);
      }
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
