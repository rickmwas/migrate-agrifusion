// Client-side stub for quality check integration.
// The real implementation is server-only.
// Importing this file in the client will throw and direct developers to call the server API.

export function checkQuality(): never {
  throw new Error(
    "checkQuality was imported in client code. Use the server API endpoint '/api/quality-check' instead."
  );
}
