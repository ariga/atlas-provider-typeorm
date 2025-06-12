"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEntities = loadEntities;
const fs = require("fs");
const pathModule = require("path");
const parser_1 = require("@babel/parser");
const traverse_1 = require("@babel/traverse");
const typeorm_1 = require("typeorm");
const ConnectionMetadataBuilder_1 = require("typeorm/connection/ConnectionMetadataBuilder");
const EntityMetadataValidator_1 = require("typeorm/metadata-builder/EntityMetadataValidator");
const View_1 = require("typeorm/schema-builder/view/View");
const StringUtils_1 = require("typeorm/util/StringUtils");
// Load typeorm entities and return SQL statements describing the schema of the entities.
function loadEntities(dialect, 
// eslint-disable-next-line @typescript-eslint/ban-types
entities) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        const mockDB = new typeorm_1.DataSource({
            type: dialect,
            database: ":memory:",
        });
        const driver = mockDB.driver;
        const metadataBuilder = new ConnectionMetadataBuilder_1.ConnectionMetadataBuilder(mockDB);
        const entityMetadataValidator = new EntityMetadataValidator_1.EntityMetadataValidator();
        const queryRunner = mockDB.createQueryRunner();
        queryRunner.enableSqlMemory();
        const entityMetadatas = yield metadataBuilder.buildEntityMetadatas(entities);
        // validate all created entity metadatas to make sure user created entities are valid and correct
        entityMetadataValidator.validateMany(entityMetadatas.filter((metadata) => metadata.tableType !== "view"), driver);
        // mockPostgresQueryRunner used to mock result of queries instead of executing them against the database.
        const mockPostgresQueryRunner = (schema) => {
            const postgresQueryRunner = queryRunner;
            const enumQueries = new Set();
            postgresQueryRunner.query = (query) => __awaiter(this, void 0, void 0, function* () {
                if (query.includes("SELECT * FROM current_schema()")) {
                    return [{ current_schema: schema }];
                }
                if (query.includes('SELECT "n"."nspname", "t"."typname" FROM "pg_type" "t"')) {
                    if (enumQueries.has(query)) {
                        // mock result for enum that already exists
                        return [{}];
                    }
                    enumQueries.add(query);
                    // mock result for enum that does not exist
                    return [];
                }
            });
        };
        // create tables statements
        for (const metadata of entityMetadatas) {
            if (metadata.tableType === "view") {
                continue;
            }
            if (dialect === "postgres") {
                mockPostgresQueryRunner(metadata.schema);
            }
            const table = typeorm_1.Table.create(metadata, driver);
            yield queryRunner.createTable(table);
        }
        // Creating foreign keys statements are executed after all tables created since foreign keys can reference tables that were created afterwards.
        for (const metadata of entityMetadatas) {
            if (metadata.tableType === "view") {
                continue;
            }
            const table = typeorm_1.Table.create(metadata, driver);
            const foreignKeys = metadata.foreignKeys.map((foreignKeyMetadata) => typeorm_1.TableForeignKey.create(foreignKeyMetadata, driver));
            yield queryRunner.createForeignKeys(table, foreignKeys);
        }
        // create views
        for (const metadata of entityMetadatas) {
            if (metadata.tableType !== "view") {
                continue;
            }
            const view = View_1.View.create(metadata, driver);
            yield queryRunner.createView(view, false);
        }
        // Find the file path of the entity class or EntitySchema options
        const findObjectFilePath = (obj) => {
            return Object.keys(require.cache).find((p) => {
                const cached = require.cache[p];
                if (!cached || typeof cached.exports !== "object" || !cached.exports)
                    return false;
                if (cached.exports === obj) {
                    return true;
                }
                return Object.values(cached.exports).some((v) => v === obj);
            });
        };
        // Extract EntitySchema options from the entry file
        function extractEntityOptionsFromEntryFile(tableType, tableName) {
            var _a;
            try {
                const entryFile = (_a = require.main) === null || _a === void 0 ? void 0 : _a.filename;
                if (!entryFile)
                    return undefined;
                const code = fs.readFileSync(entryFile, "utf-8");
                const ast = (0, parser_1.parse)(code, { sourceType: "module" });
                let options;
                (0, traverse_1.default)(ast, {
                    NewExpression(path) {
                        const node = path.node;
                        if (node.callee.type === "Identifier" &&
                            node.callee.name === "EntitySchema" &&
                            node.arguments.length === 1) {
                            const arg = node.arguments[0];
                            // Inline object
                            if (arg.type === "ObjectExpression") {
                                const props = arg.properties;
                                const hasName = () => {
                                    let nameValue;
                                    let tableNameValue;
                                    for (const prop of props) {
                                        if (prop.type === "ObjectProperty" &&
                                            prop.key.type === "Identifier" &&
                                            prop.value.type === "StringLiteral") {
                                            if (prop.key.name === "tableName") {
                                                tableNameValue = prop.value.value;
                                            }
                                            else if (prop.key.name === "name") {
                                                nameValue = prop.value.value;
                                            }
                                        }
                                    }
                                    return tableNameValue
                                        ? tableNameValue === tableName
                                        : nameValue === tableName;
                                };
                                if (hasName) {
                                    options = eval(`(${code.slice(arg.start, arg.end)})`);
                                    path.stop();
                                }
                            }
                            // Require expression
                            if (arg.type === "CallExpression" &&
                                arg.callee.type === "Identifier" &&
                                arg.callee.name === "require" &&
                                arg.arguments.length === 1 &&
                                arg.arguments[0].type === "StringLiteral") {
                                const importPath = arg.arguments[0].value;
                                const absPath = pathModule.resolve(pathModule.dirname(entryFile), importPath);
                                // eslint-disable-next-line @typescript-eslint/no-var-requires
                                const resolved = require(absPath);
                                if ((resolved.type || "regular") === tableType && resolved.tableName
                                    ? resolved.tableName === tableName
                                    : (0, StringUtils_1.snakeCase)(resolved.name) === tableName) {
                                    options = resolved;
                                    path.stop();
                                }
                            }
                        }
                    },
                });
                return options;
            }
            catch (_b) {
                return undefined;
            }
        }
        // Find the position of the entity class in the file
        const findEntityClassPos = (filePath, className) => {
            try {
                const code = fs.readFileSync(filePath, "utf-8");
                const ast = (0, parser_1.parse)(code, {
                    sourceType: "module",
                    plugins: ["typescript", "decorators-legacy"],
                });
                let pos;
                (0, traverse_1.default)(ast, {
                    ClassDeclaration(path) {
                        var _a;
                        const node = path.node;
                        if (((_a = node.id) === null || _a === void 0 ? void 0 : _a.name) === className && node.loc) {
                            pos = `${filePath}:${node.loc.start.line}:${node.loc.start.column + 1}-${node.loc.end.line}:${node.loc.end.column + 1}`;
                            path.stop();
                        }
                    },
                });
                return pos;
            }
            catch (_a) {
                return undefined;
            }
        };
        // Find the position of the EntitySchema options in the file
        const findEntityOptionsPos = (filePath, entityOptions) => {
            try {
                const code = fs.readFileSync(filePath, "utf-8");
                const ast = (0, parser_1.parse)(code, { sourceType: "module" });
                let pos;
                (0, traverse_1.default)(ast, {
                    ObjectExpression(path) {
                        const node = path.node;
                        if (node.properties.some((prop) => prop.type === "ObjectProperty" &&
                            prop.key.type === "Identifier" &&
                            (prop.key.name === "name" ||
                                prop.key.name === "tableName" ||
                                prop.key.name === "type") &&
                            prop.value.type === "StringLiteral")) {
                            let nameValue;
                            let tableNameValue;
                            let typeValue;
                            for (const prop of node.properties) {
                                if (prop.type === "ObjectProperty" &&
                                    prop.key.type === "Identifier" &&
                                    prop.value.type === "StringLiteral") {
                                    if (prop.key.name === "name")
                                        nameValue = prop.value.value;
                                    if (prop.key.name === "tableName")
                                        tableNameValue = prop.value.value;
                                    if (prop.key.name === "type")
                                        typeValue = prop.value.value;
                                }
                            }
                            if (typeValue === entityOptions.type &&
                                tableNameValue === entityOptions.tableName &&
                                nameValue === entityOptions.name &&
                                node.loc) {
                                pos = `${filePath}:${node.loc.start.line}:${node.loc.start.column + 1}-${node.loc.end.line}:${node.loc.end.column + 1}`;
                                path.stop();
                            }
                        }
                    },
                });
                return pos;
            }
            catch (_a) {
                return undefined;
            }
        };
        // Build atlas:pos directives
        const directives = [];
        for (const metadata of entityMetadatas) {
            if (metadata.tableType !== "regular" && metadata.tableType !== "view") {
                continue;
            }
            const type = metadata.tableType == "regular" ? "table" : "view";
            const name = metadata.tableName;
            const target = metadata.target;
            let filePath = (_a = require.main) === null || _a === void 0 ? void 0 : _a.filename;
            let entityOptions;
            if (typeof target === "function") {
                filePath = findObjectFilePath(target);
            }
            else {
                // Find the file path of the EntitySchema by checking require.cache and looking for the EntitySchema options.
                for (const p of Object.keys(require.cache)) {
                    const cached = require.cache[p];
                    if (!cached || typeof cached.exports !== "object" || !cached.exports)
                        continue;
                    const exported = cached.exports;
                    if (((_b = exported === null || exported === void 0 ? void 0 : exported.constructor) === null || _b === void 0 ? void 0 : _b.name) === "EntitySchema" &&
                        ((_c = exported === null || exported === void 0 ? void 0 : exported.options) === null || _c === void 0 ? void 0 : _c.name) === target) {
                        filePath = p;
                        entityOptions = exported.options;
                        break;
                    }
                    for (const v of Object.values(exported)) {
                        if (((_d = v === null || v === void 0 ? void 0 : v.constructor) === null || _d === void 0 ? void 0 : _d.name) === "EntitySchema" &&
                            ((_e = v === null || v === void 0 ? void 0 : v.options) === null || _e === void 0 ? void 0 : _e.name) === target) {
                            filePath = p;
                            entityOptions = v.options;
                            break;
                        }
                    }
                    if (entityOptions) {
                        break;
                    }
                }
                // If not found in require.cache, try to extract from the entry file
                if (!entityOptions) {
                    entityOptions = extractEntityOptionsFromEntryFile(metadata.tableType, metadata.tableName);
                }
                // Find the file path of the EntitySchema options
                if (entityOptions) {
                    const optionsObjectFilePath = findObjectFilePath(entityOptions);
                    if (optionsObjectFilePath) {
                        filePath = optionsObjectFilePath;
                    }
                }
            }
            if (!filePath) {
                continue;
            }
            let pos = filePath;
            if (typeof target === "function") {
                pos = findEntityClassPos(filePath, target.name);
            }
            else {
                if (entityOptions) {
                    pos = findEntityOptionsPos(filePath, entityOptions);
                }
            }
            directives.push(`-- atlas:pos ${name}[type=${type}] ${pos}`);
        }
        const memorySql = queryRunner.getMemorySql();
        const queries = memorySql.upQueries.map((query) => query.query);
        queryRunner.clearSqlMemory();
        return `${directives.sort().join("\n")}\n\n${queries.join(";\n")}`;
    });
}
//# sourceMappingURL=load.js.map