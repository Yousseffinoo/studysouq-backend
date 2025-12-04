import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import fg from "fast-glob";
import { transformSync } from "@babel/core";

const rootDir = path.resolve("src");
const files = await fg(["**/*.jsx", "**/*.js"], {
  cwd: rootDir,
  absolute: true,
});

for (const file of files) {
  const source = readFileSync(file, "utf8");

  const result = transformSync(source, {
    filename: file,
    plugins: [
      [
        "@babel/plugin-transform-typescript",
        {
          isTSX: file.endsWith(".jsx"),
          allowDeclareFields: true,
          allExtensions: true,
        },
      ],
    ],
    parserOpts: {
      plugins: ["jsx", "typescript"],
    },
    generatorOpts: {
      decoratorsBeforeExport: true,
    },
  });

  if (result?.code) {
    writeFileSync(file, result.code, "utf8");
  }
}

console.log(`Converted ${files.length} files to plain JSX/JS.`);

