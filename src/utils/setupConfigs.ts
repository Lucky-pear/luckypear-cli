import fs from "fs-extra";
import path from "path";

interface SetupOptions {
  withReanimated: boolean;
  withSkia: boolean;
}

export async function setupConfigs(projectPath: string, options: SetupOptions) {
  const configs: Record<string, string> = {
    ".eslintrc.js": `
module.exports = {
  root: true,
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    node: true,
  },
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
    'plugin:react/recommended',
    'prettier',
  ],
  plugins: ['prettier', 'import'],
  rules: {
    'new-cap': 'error',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-new-object': 'error',
    'no-duplicate-imports': 'error',
    'react/react-in-jsx-scope': 'off',
    'import/order': [
      'warn',
      {
        'newlines-between': 'always',
        groups: [
          'index',
          'sibling',
          'parent',
          'internal',
          'external',
          'builtin',
          'object',
          'type',
        ],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
        ],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
  ignorePatterns: ['dist', 'scripts'],
}`,
    ".prettierrc": `{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}`,
    "tsconfig.json": `{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}`,
    "babel.config.js": `
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [${
      options.withReanimated ? '"react-native-reanimated/plugin"' : ""
    }],
  };
};
`,
  };

  if (options.withSkia) {
    configs["metro.config.js"] = `
const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname, { 
  isCSSEnabled: true,
});

config.resolver.assetExts.push("wasm");
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
`;
    configs["path-fs-canvaskit-postinstall.js"] = `
const fs = require("fs");
const path = require("path");

const packageJsonPath = path.join(
  __dirname,
  "node_modules",
  "canvaskit-wasm",
  "package.json"
);
const packageJson = require(packageJsonPath);

packageJson.browser = {
  fs: false,
  path: false,
  os: false,
};

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
`;
  }

  for (const [file, content] of Object.entries(configs)) {
    await fs.writeFile(path.join(projectPath, file), content.trim() + "\n");
  }

  // Create gitignore
  const gitignore = `
node_modules/
.expo/
dist/
npm-debug.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/
.env
.DS_Store
`;

  await fs.writeFile(
    path.join(projectPath, ".gitignore"),
    gitignore.trim() + "\n"
  );
}
