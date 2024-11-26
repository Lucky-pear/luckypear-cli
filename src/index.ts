#!/usr/bin/env node
import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import path from "path";
import { generateProjectStructure } from "./utils/generateStructure.js";
import { getLatestVersions } from "./utils/getPackageVersions.js";
import { installDependencies } from "./utils/installDependencies.js";
import { validateProjectName } from "./utils/validateProjectName.js";

interface ProjectOptions {
  name: string;
  withReanimated: boolean;
  withSkia: boolean;
}

async function createProject(options: ProjectOptions) {
  const spinner = ora("Starting project creation...").start();

  try {
    const projectPath = path.join(process.cwd(), options.name);

    spinner.text = "Fetching latest package versions...";
    const versions = await getLatestVersions();

    spinner.text = "Creating project structure...";
    await generateProjectStructure(projectPath, options.name);

    spinner.text = "Installing dependencies...";
    await installDependencies(projectPath, versions, options);

    spinner.succeed(chalk.green("Project created successfully! 🎉"));

    console.log("\n" + chalk.bold("Next steps:"));
    console.log(chalk.cyan(`  1. cd ${options.name}`));
    console.log(chalk.cyan("  2. bun run dev\n"));
  } catch (error) {
    spinner.fail(chalk.red("Failed to create project"));
    console.error(error);
    process.exit(1);
  }
}

async function init() {
  console.log(chalk.bold("👋 Welcome to LuckyPear CLI!\n"));

  try {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Enter project name (no spaces or special characters):",
        validate: validateProjectName,
      },
      {
        type: "checkbox",
        name: "packages",
        message: "Select additional packages:",
        choices: [
          {
            name: "React Native Reanimated - Advanced animations",
            value: "reanimated",
          },
          {
            name: "React Native Skia - High-performance 2D graphics",
            value: "skia",
          },
        ],
      },
    ]);

    const options: ProjectOptions = {
      name: answers.name,
      withReanimated: answers.packages.includes("reanimated"),
      withSkia: answers.packages.includes("skia"),
    };

    await createProject(options);
  } catch (error) {
    console.error(chalk.red("An error occurred:"), error);
    process.exit(1);
  }
}

init();
