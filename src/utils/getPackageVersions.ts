import axios from "axios";

export async function getLatestVersions() {
  const packages = [
    "expo",
    "react",
    "react-native",
    "typescript",
    "valtio",
    "react-native-unistyles",
  ];

  const versions: Record<string, string> = {};

  for (const pkg of packages) {
    try {
      const response = await axios.get(
        `https://registry.npmjs.org/${pkg}/latest`
      );
      versions[pkg] = response.data.version;
    } catch (error) {
      console.warn(
        `Could not fetch latest version for ${pkg}, using 'latest' tag`
      );
      versions[pkg] = "latest";
    }
  }

  return versions;
}
