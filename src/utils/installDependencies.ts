import { exec } from "child_process";
import fs from "fs-extra";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

interface InstallOptions {
  withReanimated: boolean;
  withSkia: boolean;
}

export async function installDependencies(
  projectPath: string,
  versions: Record<string, string>,
  options: InstallOptions
) {
  let packageJson: Record<string, any> = {
    name: path.basename(projectPath),
    version: "1.0.0",
    main: "expo-router/entry",
    scripts: {
      start: "expo start",
      android: "expo run:android",
      ios: "expo run:ios",
      web: "expo start --web",
      test: "jest",
      lint: "eslint .",
      "lint:fix": "eslint . --fix",
      typecheck: "tsc --noEmit",
    },
    dependencies: {},
    devDependencies: {},
  };

  if (options.withSkia) {
    packageJson.scripts.postinstall =
      "npx setup-skia-web public && node path-fs-canvaskit-postinstall.js";
  }

  await fs.writeJSON(path.join(projectPath, "package.json"), packageJson, {
    spaces: 2,
  });

  const dependencies = [
    `expo@${versions.expo}`,
    `react@${versions.react}`,
    `react-native@${versions["react-native"]}`,
    "react-native-web",
    "@expo/webpack-config",
    "@expo/metro-runtime",
    "expo-router",
    "expo-linking",
    "expo-constants",
    "expo-status-bar",
    `typescript@${versions.typescript}`,
    `valtio@${versions.valtio}`,
    `react-native-unistyles@${versions["react-native-unistyles"]}`,
    "react-native-safe-area-context",
    "react-native-screens",
    "expo-system-ui",
    "react-native-gesture-handler",
  ];

  if (options.withReanimated) {
    dependencies.push("react-native-reanimated@latest");
  }

  if (options.withSkia) {
    dependencies.push("@shopify/react-native-skia@latest");
  }

  await execAsync(`cd ${projectPath} && bun install ${dependencies.join(" ")}`);

  const devDependencies = [
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/parser",
    "@types/react",
    "@types/react-native",
    "eslint",
    "eslint-config-prettier",
    "eslint-plugin-prettier",
    "eslint-plugin-react",
    "eslint-plugin-react-hooks",
    "prettier",
    "jest",
    "@testing-library/react-native",
    "typescript",
    "babel-preset-expo",
  ];

  await execAsync(
    `cd ${projectPath} && bun install -d ${devDependencies.join(" ")}`
  );
}
