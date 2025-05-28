#! /usr/bin/env node

const loadEntities = require("../../build/load").loadEntities;

// parse the second argument as the dialect
const dialect = process.argv[2]

const post = require("./entities/post/Post");
const category = require("./entities/Category");
const { Blog: blog, Author: author} = require("./entities/Blog");

loadEntities(dialect, [post, category, blog, author]).then((sql) => {
  console.log(sql);
});
