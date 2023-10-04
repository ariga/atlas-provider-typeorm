#!/usr/bin/env ts-node-script

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
      type: "string",
      demandOption: true,
      describe: "Path to models folder",
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
      const path = argv.path;
      if (!fs.existsSync(path)) {
        throw new Error(`path ${path} does not exist`);
      }
      const sql = await loadEntities(argv.dialect as Dialect, [path + "/*.ts"]);
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
