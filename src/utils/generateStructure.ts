import fs from "fs-extra";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

export async function generateProjectStructure(
  projectPath: string,
  projectName: string
) {
  const dirs = [
    "app",
    "src/core",
    "src/screens/home",
    "src/widgets",
    "src/features",
    "src/entities/session/model",
    "src/shared/api",
    "src/shared/config",
    "src/shared/lib",
    "src/shared/ui",
  ];

  for (const dir of dirs) {
    await fs.mkdirp(path.join(projectPath, dir));
  }

  const appName = toPascalCase(projectName);
  const appSlug = projectName.toLowerCase();

  const baseFiles = {
    "app/_layout.tsx": `
import { Stack } from 'expo-router';

export default function Layout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
`,
    "app/index.tsx": `
import { Home } from '@/screens/home';
export default Home;
`,
    "src/screens/home/index.tsx": `
import { View, Text } from 'react-native';

export function Home() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to ${appName}!</Text>
    </View>
  );
}
`,
    "src/entities/session/model/types.ts": `
export interface Session {
  isAuthenticated: boolean;
  accessToken?: string;
}
`,
    "src/entities/session/model/store.ts": `
import { proxy } from 'valtio';
import { Session } from './types.js';

export const sessionStore = proxy<Session>({
  isAuthenticated: false,
  accessToken: undefined,
});

export const sessionActions = {
  login: (token: string) => {
    sessionStore.isAuthenticated = true;
    sessionStore.accessToken = token;
  },
  logout: () => {
    sessionStore.isAuthenticated = false;
    sessionStore.accessToken = undefined;
  }
};
`,
    "src/entities/session/index.ts": `
export * from './model/store.js';
export * from './model/types.js';
`,
    "app.json": `
{
  "expo": {
    "name": "${appName}",
    "slug": "${appSlug}",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "io.luckypear.${appSlug}"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "io.luckypear.${appSlug}"
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/favicon.png"
    },
    "newArchEnabled": true
  }
}`,
  };

  for (const [filePath, content] of Object.entries(baseFiles)) {
    await fs.writeFile(
      path.join(projectPath, filePath),
      content.trim() + "\n",
      { encoding: "utf-8" }
    );
  }

  await fs.mkdirp(path.join(projectPath, "assets"));

  await fs.copy(
    path.join(__dirname, "../../templates/assets"),
    path.join(projectPath, "assets")
  );
}
