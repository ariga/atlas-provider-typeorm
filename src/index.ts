#!/usr/bin/env ts-node-script

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Dialect, loadEntities } from "./load";
import * as fs from "fs";
import { EntitySchema } from "typeorm";

const loadJSEntities = async (dialect: Dialect, path: string) => {
  const files = fs.readdirSync(path);
  const entities: EntitySchema[] = [];
  for (const file of files) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const entity = new EntitySchema(require(`${path}/${file}`));
    entities.push(entity);
  }
  return await loadEntities(dialect as Dialect, entities);
};

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
      const files = fs.readdirSync(path);
      if (files.length === 0) {
        throw new Error(`path ${path} does not contain any files`);
      }
      const extension = files[0].split(".").pop();
      let sql = "";
      switch (extension) {
        case "ts":
          sql = await loadEntities(argv.dialect as Dialect, [path + "/*.ts"]);
          break;
        case "js":
          sql = await loadJSEntities(argv.dialect as Dialect, path);
          break;
        default:
          throw new Error(`unknown file extension ${extension}`);
      }
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
