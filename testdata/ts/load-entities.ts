#!/usr/bin/env ts-node-script

import { Dialect, loadEntities } from "../../src/load";
import { User } from "./entities/User";
import { Blog } from "./entities/Blog";
import { User as SqliteUser } from "./entities/sqlite/User";
import { Blog as SqliteBlog } from "./entities/sqlite/Blog";

// parse the second argument as the dialect
const dialect = process.argv[2] as Dialect;

// sqlite does not support enum, so we need to load different entities
if (dialect === "sqlite") {
  loadEntities("sqlite", [SqliteUser, SqliteBlog]).then((sql) => {
    console.log(sql);
  });
} else {
  // print sql after promise is resolver
  loadEntities(dialect, [User, Blog]).then((sql) => {
    console.log(sql);
  });
}
