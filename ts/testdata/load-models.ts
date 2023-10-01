#! /usr/bin/env ts-node-script

import { Dialect, loadModels } from "../src";
import { User } from "./entities/User";
import { Blog } from "./entities/Blog";

// parse the second argument as the dialect
const dialect = process.argv[2] as Dialect;

// print sql after promise is resolver
loadModels(dialect, [User, Blog]).then((sql) => {
  console.log(sql);
});
