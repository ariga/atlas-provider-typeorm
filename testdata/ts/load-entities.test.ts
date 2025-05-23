#!/usr/bin/env ts-node-script

import * as assert from "assert";
import { loadEntities } from "../../src/load";
import { User } from "./entities/User";
import { Blog } from "./entities/Blog";

const dialect = "mysql";

async function runTest() {
    const sql = await loadEntities(dialect, [User, Blog]);
    // Check that expected SQL is included
    assert(sql.includes("CREATE TABLE `user`"), "User table creation is missing");
    assert(sql.includes("CREATE TABLE `blog`"), "Blog table creation is missing");
    // Check atlas:pos comments
    assert(sql.includes("-- atlas:pos user[type=table] testdata/ts/entities/User.ts:21:13-44:2"), "atlas:pos for user is missing or incorrect");
    assert(sql.includes("-- atlas:pos blog[type=table] testdata/ts/entities/Blog.ts:5:13-14:2"), "atlas:pos for blog is missing or incorrect");
}

runTest().catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
});