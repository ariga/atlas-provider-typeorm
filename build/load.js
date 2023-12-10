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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.loadEntities = void 0;
var typeorm_1 = require("typeorm");
var ConnectionMetadataBuilder_1 = require("typeorm/connection/ConnectionMetadataBuilder");
var EntityMetadataValidator_1 = require("typeorm/metadata-builder/EntityMetadataValidator");
var View_1 = require("typeorm/schema-builder/view/View");
// Load typeorm entities and return SQL statements describing the schema of the entities.
function loadEntities(dialect, 
// eslint-disable-next-line @typescript-eslint/ban-types
entities) {
    return __awaiter(this, void 0, void 0, function () {
        var mockDB, driver, metadataBuilder, entityMetadataValidator, queryRunner, entityMetadatas, mockPostgresQueryRunner, _i, entityMetadatas_1, metadata, table, _a, entityMetadatas_2, metadata, table, foreignKeys, _b, entityMetadatas_3, metadata, view, memorySql, queries;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    mockDB = new typeorm_1.DataSource({
                        type: dialect,
                        database: ":memory:"
                    });
                    driver = mockDB.driver;
                    metadataBuilder = new ConnectionMetadataBuilder_1.ConnectionMetadataBuilder(mockDB);
                    entityMetadataValidator = new EntityMetadataValidator_1.EntityMetadataValidator();
                    queryRunner = mockDB.createQueryRunner();
                    queryRunner.enableSqlMemory();
                    return [4 /*yield*/, metadataBuilder.buildEntityMetadatas(entities)];
                case 1:
                    entityMetadatas = _c.sent();
                    // validate all created entity metadatas to make sure user created entities are valid and correct
                    entityMetadataValidator.validateMany(entityMetadatas.filter(function (metadata) { return metadata.tableType !== "view"; }), driver);
                    mockPostgresQueryRunner = function (schema) {
                        var postgresQueryRunner = queryRunner;
                        var enumQueries = new Set();
                        postgresQueryRunner.query = function (query) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (query.includes("SELECT * FROM current_schema()")) {
                                    return [2 /*return*/, [{ current_schema: schema }]];
                                }
                                if (query.includes('SELECT "n"."nspname", "t"."typname" FROM "pg_type" "t"')) {
                                    if (enumQueries.has(query)) {
                                        // mock result for enum that already exists
                                        return [2 /*return*/, [{}]];
                                    }
                                    enumQueries.add(query);
                                    // mock result for enum that does not exist
                                    return [2 /*return*/, []];
                                }
                                return [2 /*return*/];
                            });
                        }); };
                    };
                    _i = 0, entityMetadatas_1 = entityMetadatas;
                    _c.label = 2;
                case 2:
                    if (!(_i < entityMetadatas_1.length)) return [3 /*break*/, 5];
                    metadata = entityMetadatas_1[_i];
                    if (metadata.tableType === "view") {
                        return [3 /*break*/, 4];
                    }
                    if (dialect === "postgres") {
                        mockPostgresQueryRunner(metadata.schema);
                    }
                    table = typeorm_1.Table.create(metadata, driver);
                    return [4 /*yield*/, queryRunner.createTable(table)];
                case 3:
                    _c.sent();
                    _c.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    _a = 0, entityMetadatas_2 = entityMetadatas;
                    _c.label = 6;
                case 6:
                    if (!(_a < entityMetadatas_2.length)) return [3 /*break*/, 9];
                    metadata = entityMetadatas_2[_a];
                    if (metadata.tableType === "view") {
                        return [3 /*break*/, 8];
                    }
                    table = typeorm_1.Table.create(metadata, driver);
                    foreignKeys = metadata.foreignKeys.map(function (foreignKeyMetadata) {
                        return typeorm_1.TableForeignKey.create(foreignKeyMetadata, driver);
                    });
                    return [4 /*yield*/, queryRunner.createForeignKeys(table, foreignKeys)];
                case 7:
                    _c.sent();
                    _c.label = 8;
                case 8:
                    _a++;
                    return [3 /*break*/, 6];
                case 9:
                    _b = 0, entityMetadatas_3 = entityMetadatas;
                    _c.label = 10;
                case 10:
                    if (!(_b < entityMetadatas_3.length)) return [3 /*break*/, 13];
                    metadata = entityMetadatas_3[_b];
                    if (metadata.tableType !== "view") {
                        return [3 /*break*/, 12];
                    }
                    view = View_1.View.create(metadata, driver);
                    return [4 /*yield*/, queryRunner.createView(view, false)];
                case 11:
                    _c.sent();
                    _c.label = 12;
                case 12:
                    _b++;
                    return [3 /*break*/, 10];
                case 13:
                    memorySql = queryRunner.getMemorySql();
                    queries = memorySql.upQueries.map(function (query) { return query.query; });
                    queryRunner.clearSqlMemory();
                    return [2 /*return*/, queries.join(";\n")];
            }
        });
    });
}
exports.loadEntities = loadEntities;
