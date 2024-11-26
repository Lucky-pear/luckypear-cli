export function validateProjectName(name: string): boolean | string {
  if (!name) {
    return "Project name is required";
  }

  const regex = /^[a-zA-Z0-9-_]+$/;
  if (!regex.test(name)) {
    return "Project name can only contain letters, numbers, hyphens and underscores";
  }

  return true;
}
