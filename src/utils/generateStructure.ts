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
  projectName: string,
  options: FlagOptions
) {
  const dirs = [
    "app",
    "src/common",
    "src/entities/session/model",
    "src/features",
    "src/organisms",
    "src/screens/home",
    "src/worlds",
  ];

  for (const dir of dirs) {
    await fs.mkdirp(path.join(projectPath, dir));
  }

  const appName = toPascalCase(projectName);
  const appSlug = projectName.toLowerCase();

  let baseFiles = {
    "app/_layout.tsx": `
import Root from '@/worlds/Root';
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Root>
      <Stack screenOptions={{ headerShown: false }} />
    </Root>
  );
}
`,
    "app/index.tsx": `
import { Home } from '@/screens/home';
export default Home;
`,
    "src/worlds/Root.tsx": `
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import { SplashScreen } from 'expo-router';
import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

SplashScreen.preventAutoHideAsync();

const Root: React.FC<PropsWithChildren> = (props) => {
  const { styles } = useStyles(stylesheet);

  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      if (Platform.OS === 'web') {
        try {
          ${
            options?.withSkia
              ? "await LoadSkiaWeb({ locateFile: () => '/canvaskit.wasm' });"
              : "// Load something here"
          }
        } catch (e) {
          console.warn(e);
        } finally {
          setAppIsReady(true);
        }
      } else {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (appIsReady) {
      SplashScreen.hide();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container} onLayout={onLayoutRootView}>
      {props.children}
    </GestureHandlerRootView>
  );
};

const stylesheet = createStyleSheet(() => ({
  container: {
    flex: 1,
  },
}));

export default Root;
`,
    "src/screens/home/index.tsx": `
import { Text, View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

export function Home() {
  const { styles } = useStyles(stylesheet);

  return (
    <View style={styles.container}>
      <Text>Welcome to Entree!</Text>
    </View>
  );
}

const stylesheet = createStyleSheet({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
`,
    "src/entities/session/model/store.ts": `
import { proxy } from 'valtio';

export type Session = {
  isAuthenticated: boolean;
  accessToken?: string;
};

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
export * from './model';
`,
    "src/entities/session/model/index.ts": `
import { Session, sessionActions, sessionStore } from './store.ts';
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
      "bundleIdentifier": "io.luckypear.${appName}"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "io.luckypear.${appName}"
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
