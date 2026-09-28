// openapi-typescript (used by `pnpm codegen` in packages/sdk) requires the
// TypeScript 6 compiler API, which was removed from the `typescript` package
// in v7. Give it its own TypeScript 6 copy instead of the workspace's v7.
function readPackage(pkg) {
  if (pkg.name === "openapi-typescript") {
    pkg.dependencies = { ...pkg.dependencies, typescript: "6.0.3" };
    if (pkg.peerDependencies) {
      delete pkg.peerDependencies.typescript;
    }
    if (pkg.peerDependenciesMeta) {
      delete pkg.peerDependenciesMeta.typescript;
    }
  }
  return pkg;
}

export const hooks = { readPackage };
