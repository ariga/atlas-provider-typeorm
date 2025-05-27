import * as fs from "fs";
import * as pathModule from "path";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { DataSource, EntitySchema, Table, TableForeignKey } from "typeorm";
import { ConnectionMetadataBuilder } from "typeorm/connection/ConnectionMetadataBuilder";
import { EntityMetadataValidator } from "typeorm/metadata-builder/EntityMetadataValidator";
import { View } from "typeorm/schema-builder/view/View";
import { PostgresQueryRunner } from "typeorm/driver/postgres/PostgresQueryRunner";
import { EntitySchemaOptions } from "typeorm/entity-schema/EntitySchemaOptions";
import { snakeCase } from "typeorm/util/StringUtils";

export type Dialect = "mysql" | "postgres" | "mariadb" | "sqlite" | "mssql";

// Load typeorm entities and return SQL statements describing the schema of the entities.
export async function loadEntities(
  dialect: Dialect,
  // eslint-disable-next-line @typescript-eslint/ban-types
  entities: (Function | EntitySchema | string)[],
) {
  const mockDB = new DataSource({
    type: dialect,
    database: ":memory:",
  });
  const driver = mockDB.driver;
  const metadataBuilder = new ConnectionMetadataBuilder(mockDB);
  const entityMetadataValidator = new EntityMetadataValidator();
  const queryRunner = mockDB.createQueryRunner();
  queryRunner.enableSqlMemory();

  const entityMetadatas = await metadataBuilder.buildEntityMetadatas(entities);
  // validate all created entity metadatas to make sure user created entities are valid and correct
  entityMetadataValidator.validateMany(
    entityMetadatas.filter((metadata) => metadata.tableType !== "view"),
    driver,
  );

  // mockPostgresQueryRunner used to mock result of queries instead of executing them against the database.
  const mockPostgresQueryRunner = (schema?: string) => {
    const postgresQueryRunner = queryRunner as PostgresQueryRunner;
    const enumQueries = new Set<string>();
    postgresQueryRunner.query = async (query: string) => {
      if (query.includes("SELECT * FROM current_schema()")) {
        return [{ current_schema: schema }];
      }
      if (
        query.includes('SELECT "n"."nspname", "t"."typname" FROM "pg_type" "t"')
      ) {
        if (enumQueries.has(query)) {
          // mock result for enum that already exists
          return [{}];
        }
        enumQueries.add(query);
        // mock result for enum that does not exist
        return [];
      }
    };
  };

  // create tables statements
  for (const metadata of entityMetadatas) {
    if (metadata.tableType === "view") {
      continue;
    }
    if (dialect === "postgres") {
      mockPostgresQueryRunner(metadata.schema);
    }
    const table = Table.create(metadata, driver);
    await queryRunner.createTable(table);
  }

  // Creating foreign keys statements are executed after all tables created since foreign keys can reference tables that were created afterwards.
  for (const metadata of entityMetadatas) {
    if (metadata.tableType === "view") {
      continue;
    }
    const table = Table.create(metadata, driver);
    const foreignKeys = metadata.foreignKeys.map((foreignKeyMetadata) =>
      TableForeignKey.create(foreignKeyMetadata, driver),
    );
    await queryRunner.createForeignKeys(table, foreignKeys);
  }

  // create views
  for (const metadata of entityMetadatas) {
    if (metadata.tableType !== "view") {
      continue;
    }
    const view = View.create(metadata, driver);
    await queryRunner.createView(view, false);
  }

  // Find the file path of the entity class or EntitySchema options
  const findObjectFilePath = (obj): string | undefined => {
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
  function extractEntityOptionsFromEntryFile(
    tableType: string,
    tableName: string,
  ): EntitySchemaOptions<unknown> | undefined {
    try {
      const entryFile = require.main?.filename;
      if (!entryFile) return undefined;
      const code = fs.readFileSync(entryFile, "utf-8");
      const ast = parse(code, { sourceType: "module" });
      let options: undefined;

      traverse(ast, {
        NewExpression(path) {
          const node = path.node;

          if (
            node.callee.type === "Identifier" &&
            node.callee.name === "EntitySchema" &&
            node.arguments.length === 1
          ) {
            const arg = node.arguments[0];

            // Inline object
            if (arg.type === "ObjectExpression") {
              const props = arg.properties;
              const hasName = () => {
                let nameValue: string | undefined;
                let tableNameValue: string | undefined;

                for (const prop of props) {
                  if (
                    prop.type === "ObjectProperty" &&
                    prop.key.type === "Identifier" &&
                    prop.value.type === "StringLiteral"
                  ) {
                    if (prop.key.name === "tableName") {
                      tableNameValue = prop.value.value;
                    } else if (prop.key.name === "name") {
                      nameValue = prop.value.value;
                    }
                  }
                }

                return tableNameValue
                  ? tableNameValue === tableName
                  : nameValue === tableName;
              };
              if (hasName) {
                options = eval(`(${code.slice(arg.start!, arg.end!)})`);
                path.stop();
              }
            }

            // Require expression
            if (
              arg.type === "CallExpression" &&
              arg.callee.type === "Identifier" &&
              arg.callee.name === "require" &&
              arg.arguments.length === 1 &&
              arg.arguments[0].type === "StringLiteral"
            ) {
              const importPath = arg.arguments[0].value;
              const absPath = pathModule.resolve(
                pathModule.dirname(entryFile),
                importPath,
              );
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              const resolved = require(absPath);
              if (
                (resolved.type || "regular") === tableType && resolved.tableName
                  ? resolved.tableName === tableName
                  : snakeCase(resolved.name) === tableName
              ) {
                options = resolved;
                path.stop();
              }
            }
          }
        },
      });

      return options;
    } catch {
      return undefined;
    }
  }

  // Find the position of the entity class in the file
  const findEntityClassPos = (
    filePath: string,
    className: string,
  ): string | undefined => {
    try {
      const code = fs.readFileSync(filePath, "utf-8");
      const ast = parse(code, {
        sourceType: "module",
        plugins: ["typescript", "decorators-legacy"],
      });

      let pos: string | undefined;

      traverse(ast, {
        ClassDeclaration(path) {
          const node = path.node;
          if (node.id?.name === className && node.loc) {
            pos = `${filePath}:${node.loc.start.line}:${
              node.loc.start.column + 1
            }-${node.loc.end.line}:${node.loc.end.column + 1}`;
            path.stop();
          }
        },
      });

      return pos;
    } catch {
      return undefined;
    }
  };

  // Find the position of the EntitySchema options in the file
  const findEntityOptionsPos = (
    filePath: string,
    entityOptions: EntitySchemaOptions<unknown>,
  ): string | undefined => {
    try {
      const code = fs.readFileSync(filePath, "utf-8");
      const ast = parse(code, { sourceType: "module" });
      let pos: string | undefined;

      traverse(ast, {
        ObjectExpression(path) {
          const node = path.node;

          if (
            node.properties.some(
              (prop) =>
                prop.type === "ObjectProperty" &&
                prop.key.type === "Identifier" &&
                (prop.key.name === "name" ||
                  prop.key.name === "tableName" ||
                  prop.key.name === "type") &&
                prop.value.type === "StringLiteral",
            )
          ) {
            let nameValue: string | undefined;
            let tableNameValue: string | undefined;
            let typeValue: string | undefined;

            for (const prop of node.properties) {
              if (
                prop.type === "ObjectProperty" &&
                prop.key.type === "Identifier" &&
                prop.value.type === "StringLiteral"
              ) {
                if (prop.key.name === "name") nameValue = prop.value.value;
                if (prop.key.name === "tableName")
                  tableNameValue = prop.value.value;
                if (prop.key.name === "type") typeValue = prop.value.value;
              }
            }

            if (
              typeValue === entityOptions.type &&
              tableNameValue === entityOptions.tableName &&
              nameValue === entityOptions.name &&
              node.loc
            ) {
              pos = `${filePath}:${node.loc.start.line}:${
                node.loc.start.column + 1
              }-${node.loc.end.line}:${node.loc.end.column + 1}`;
              path.stop();
            }
          }
        },
      });

      return pos;
    } catch {
      return undefined;
    }
  };

  // Build atlas:pos directives
  const directives: string[] = [];
  for (const metadata of entityMetadatas) {
    if (metadata.tableType !== "regular" && metadata.tableType !== "view") {
      continue;
    }
    const type = metadata.tableType == "regular" ? "table" : "view";
    const name = metadata.tableName;
    const target = metadata.target;
    let filePath = require.main?.filename;
    let entityOptions: EntitySchemaOptions<unknown> | undefined;
    if (typeof target === "function") {
      filePath = findObjectFilePath(target);
    } else {
      // Find the file path of the EntitySchema by checking require.cache and looking for the EntitySchema options.
      for (const p of Object.keys(require.cache)) {
        const cached = require.cache[p];
        if (!cached || typeof cached.exports !== "object" || !cached.exports)
          continue;
        const exported = cached.exports;
        if (
          exported?.constructor?.name === "EntitySchema" &&
          exported?.options?.name === target
        ) {
          filePath = p;
          entityOptions = exported.options;
          break;
        }
        for (const v of Object.values(exported)) {
          if (
            v?.constructor?.name === "EntitySchema" &&
            (v as EntitySchema)?.options?.name === target
          ) {
            filePath = p;
            entityOptions = (v as EntitySchema).options;
            break;
          }
        }
        if (entityOptions) {
          break;
        }
      }

      // If not found in require.cache, try to extract from the entry file
      if (!entityOptions) {
        entityOptions = extractEntityOptionsFromEntryFile(
          metadata.tableType,
          metadata.tableName,
        );
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
    const relative = pathModule.relative(process.cwd(), filePath);
    let pos = relative;
    if (typeof target === "function") {
      const classPos = findEntityClassPos(filePath, target.name);
      if (classPos) {
        pos = classPos.replace(filePath, relative);
      }
    } else {
      if (entityOptions) {
        const optionsPos = findEntityOptionsPos(filePath, entityOptions);
        if (optionsPos) {
          pos = optionsPos.replace(filePath, relative);
        }
      }
    }
    directives.push(`-- atlas:pos ${name}[type=${type}] ${pos}`);
  }

  const memorySql = queryRunner.getMemorySql();
  const queries = memorySql.upQueries.map((query) => query.query);
  queryRunner.clearSqlMemory();
  return `${directives.sort().join("\n")}\n\n${queries.join(";\n")}`;
}
