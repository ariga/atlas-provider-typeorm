#! /usr/bin/env node

const loadEntities = require("../../build/load").loadEntities;
const EntitySchema = require("typeorm").EntitySchema;
const assert = require("assert");

const dialect = "mysql"

const post = new EntitySchema(require("./entities/Post"));
const category = new EntitySchema(require("./entities/Category"));

async function runTest() {
    const sql = await loadEntities(dialect, [post, category]);
    // Check that expected SQL is included
    assert(sql.includes("CREATE TABLE `post`"), "Post table creation is missing");
    assert(sql.includes("CREATE TABLE `category`"), "Category table creation is missing");
    // Check atlas:pos comments
    assert(sql.includes("-- atlas:pos post[type=table] testdata/js/entities/Post.js"), "atlas:pos for post is missing or incorrect");
    assert(sql.includes("-- atlas:pos category[type=table] testdata/js/entities/Category.js"), "atlas:pos for category is missing or incorrect");
}

runTest().catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
});
