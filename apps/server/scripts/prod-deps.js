// oxlint-disable no-require-imports
const path = require("node:path");
const fs = require("node:fs").promises;

(async () => {
  try {
    const packagePath = path.resolve(__dirname, "../package.json");
    const pj = require(packagePath);

    if (!pj || !pj.dependencies || !pj.dependencies.prisma) {
      throw new Error("Invalid package.json or missing prisma dependency");
    }

    const clean = {
      ...pj,
      dependencies: {
        prisma: pj.dependencies.prisma,
      },
      devDependencies: {},
    };

    const backupPath = `${packagePath}.backup`;
    await fs.copyFile(packagePath, backupPath);

    await fs.writeFile(packagePath, JSON.stringify(clean, null, 2));
  } catch (err) {
    console.error("Error updating package.json:", err);
    process.exit(1);
  }
})();
