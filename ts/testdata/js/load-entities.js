#! /usr/bin/env node

const loadEntities = require("../../src/load").loadEntities;
const EntitySchema = require("typeorm").EntitySchema;

// parse the second argument as the dialect
const dialect = process.argv[2]

const post = new EntitySchema(require("./entities/Post"));
const category = new EntitySchema(require("./entities/Category"));

// print sql after promise is resolver
loadEntities(dialect, [post, category]).then((sql) => {
  console.log(sql);
});
