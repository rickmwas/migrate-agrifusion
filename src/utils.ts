export function createPageUrl(page: string): string {
  // Convert camelCase to kebab-case
  const kebabCase = page.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  return `/${kebabCase}`;
}

