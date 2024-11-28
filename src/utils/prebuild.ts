import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const prebuild = async (projectPath: string) => {
  await execAsync(`cd ${projectPath} && npx expo prebuild --clean`);
};
