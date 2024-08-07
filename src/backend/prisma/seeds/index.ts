/**
 * Seeds the database using Prisma Client and
 * Prisma's integrated seeding functionality.
 *
 * Extended functionality includes the ability
 * to dynamically call all seeder files
 * from the current working directory.
 *
 * @see https://www.prisma.io/docs/guides/database/seed-database
 * @module
 */
import fs from 'fs';
import path from 'path';
import log from 'electron-log';
import { PrismaClient } from '@prisma/client';
import { program } from 'commander';

/**
 * Initialize the local prisma client.
 *
 * @function
 */
const prisma = new PrismaClient();

/**
 * Configure known args for seeders.
 *
 * @constant
 */
const args = program.option('-t --token <token>', 'Pandascore Access Token').parse().opts();

/**
 * Runs all of the known seeder functions
 * sorted by creation date.
 *
 * @function
 */
async function main() {
  // collect seed files
  const seeders = fs
    .readdirSync(__dirname)
    .filter(
      (seeder) =>
        seeder !== path.basename(__filename) && fs.statSync(path.join(__dirname, seeder)).isFile(),
    )
    .map((seeder) => ({
      name: seeder,
      func: require('./' + seeder),
    }));

  // sequentially run seeders since some may
  // rely on data existing before running
  for (const seeder of seeders) {
    const name = seeder.name.replace(/(?:\d+)-(.+)\.ts/, '$1');
    log.info('Running Seeder: %s', name);
    await seeder.func.default(prisma, args);
  }

  // finish up
  return Promise.resolve();
}

/**
 * Self-invoking bootstrapping logic.
 *
 * @function anonymous
 */
(async () => {
  try {
    await main();
    await prisma.$disconnect();
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
