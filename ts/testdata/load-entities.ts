#! /usr/bin/env ts-node-script

import { Dialect, loadEntities } from "../src";
import { User } from "./entities/User";
import { Blog } from "./entities/Blog";

// parse the second argument as the dialect
const dialect = process.argv[2] as Dialect;

// print sql after promise is resolver
loadEntities(dialect, [User, Blog]).then((sql) => {
  console.log(sql);
});
