import fs from "fs-extra";
import path from "path";

export async function setupConfigs(projectPath: string) {
  const configs = {
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
  };

  for (const [file, content] of Object.entries(configs)) {
    await fs.writeFile(path.join(projectPath, file), content.trim());
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

  await fs.writeFile(path.join(projectPath, ".gitignore"), gitignore.trim());
}
