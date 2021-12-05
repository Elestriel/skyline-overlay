/**
 * update build metadata
 */

import fs from 'fs';
import path from 'path';
import url from 'url';
import chalk from 'chalk';
import prettier from 'prettier';
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const prettierOptions = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../.prettierrc'), {
    encoding: 'utf-8',
  })
);

console.log(chalk.blue('generating build metadata in `meta.ts`...'));

try {
  const filePath = path.resolve(__dirname, '../src/assets/meta.ts');
  const pkgPath = path.resolve(__dirname, '../package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, { encoding: 'utf-8' }));
  const lines = [];
  lines.push(`// code generated by \`script:genMeta\` - DO NOT EDIT`);

  lines.push(`export const version = 'v${pkg.version}';`);
  lines.push(`export const date = ${Date.now()};`);
  const code = prettier.format(lines.join('\n') + '\n', {
    parser: 'typescript',
    ...prettierOptions,
  });

  fs.writeFileSync(filePath, code, { encoding: 'utf-8' });

  console.log(chalk.green(`build metadata generated`));
} catch (e) {
  console.log(chalk.red('failed to generate build metadata'));
  console.error(e);
  process.exitCode = 1;
}
