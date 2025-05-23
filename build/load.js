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
const path = require("path");
const ts_morph_1 = require("ts-morph");
const typeorm_1 = require("typeorm");
const ConnectionMetadataBuilder_1 = require("typeorm/connection/ConnectionMetadataBuilder");
const EntityMetadataValidator_1 = require("typeorm/metadata-builder/EntityMetadataValidator");
const View_1 = require("typeorm/schema-builder/view/View");
// Load typeorm entities and return SQL statements describing the schema of the entities.
function loadEntities(dialect, 
// eslint-disable-next-line @typescript-eslint/ban-types
entities) {
    return __awaiter(this, void 0, void 0, function* () {
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
        // Get line:column range of a class in a file using ts-morph
        function getEntityPositionWithRange(filePath, className) {
            try {
                const project = new ts_morph_1.Project({
                    compilerOptions: { allowJs: true },
                    skipAddingFilesFromTsConfig: true,
                });
                const sourceFile = project.addSourceFileAtPath(filePath);
                if (!sourceFile)
                    return undefined;
                const cls = sourceFile.getClass(className);
                if (!cls)
                    return undefined;
                const nameNode = cls.getNameNode();
                if (!nameNode)
                    return undefined;
                const startPos = nameNode.getPos();
                const endPos = cls.getEnd();
                const start = sourceFile.getLineAndColumnAtPos(startPos);
                const end = sourceFile.getLineAndColumnAtPos(endPos);
                return `${filePath}:${start.line}:${start.column}-${end.line}:${end.column}`;
            }
            catch (_a) {
                return undefined;
            }
        }
        // Build atlas:pos directives
        const directives = [];
        for (const metadata of entityMetadatas) {
            const type = metadata.tableType === "view" ? "view" : "table";
            const name = metadata.tableName;
            const target = metadata.target;
            const filePath = Object.keys(require.cache).find((p) => {
                const exports = require.cache[p].exports;
                return Object.values(exports).includes(target);
            });
            if (!filePath)
                continue;
            const relative = path.relative(process.cwd(), filePath);
            let pos = relative;
            if (typeof target === "function") {
                const className = target.name;
                const fullPos = getEntityPositionWithRange(filePath, className);
                if (fullPos) {
                    pos = fullPos.replace(filePath, relative);
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