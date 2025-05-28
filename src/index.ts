#!/usr/bin/env -S ts-node --swc

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Dialect, loadEntities } from "./load";
import * as fs from "fs";

const y = yargs(hideBin(process.argv))
  .usage(
    "npx @ariga/ts-atlas-provider-typeorm load --path ./models --dialect mysql",
  )
  .alias("h", "help");
y.command(
  "load",
  "load sql state of typeorm entities",
  {
    path: {
      type: "array",
      string: true,
      demandOption: true,
      describe:
        "Paths (or glob patterns) to folders containing model files, e.g. ./models or ./src/**/entities",
    },
    dialect: {
      type: "string",
      choices: ["mysql", "postgres", "sqlite", "mariadb", "mssql"],
      demandOption: true,
      describe: "Dialect of database",
    },
  },
  async function (argv) {
    try {
      const paths = argv.path;
      for (const path of paths) {
        const base = path.split("*")[0]; // extract static part
        if (!fs.existsSync(base)) {
          throw new Error(`path ${base} does not exist`);
        }
      }
      const patterns = paths.map((dir) => `${dir}/*.{ts,js}`);
      const sql = await loadEntities(argv.dialect as Dialect, patterns);
      console.log(sql);
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      } else {
        console.error(e);
      }
    }
  },
).parse();
