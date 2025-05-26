import * as path from "path";
import { Project } from "ts-morph";
import { DataSource, EntitySchema, Table, TableForeignKey } from "typeorm";
import { ConnectionMetadataBuilder } from "typeorm/connection/ConnectionMetadataBuilder";
import { EntityMetadataValidator } from "typeorm/metadata-builder/EntityMetadataValidator";
import { View } from "typeorm/schema-builder/view/View";
import { PostgresQueryRunner } from "typeorm/driver/postgres/PostgresQueryRunner";

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

  // Get line:column range of a class in a file using ts-morph
  function getEntityPositionWithRange(
    filePath: string,
    className: string,
  ): string | undefined {
    try {
      const project = new Project({
        compilerOptions: { allowJs: true },
        skipAddingFilesFromTsConfig: true,
      });
      const sourceFile = project.addSourceFileAtPath(filePath);
      if (!sourceFile) return undefined;
      const cls = sourceFile.getClass(className);
      if (!cls) return undefined;
      const nameNode = cls.getNameNode();
      if (!nameNode) return undefined;
      const startPos = nameNode.getPos();
      const endPos = cls.getEnd();
      const start = sourceFile.getLineAndColumnAtPos(startPos);
      const end = sourceFile.getLineAndColumnAtPos(endPos);
      return `${filePath}:${start.line}:${start.column}-${end.line}:${end.column}`;
    } catch {
      return undefined;
    }
  }

  // Build atlas:pos directives
  const directives: string[] = [];
  for (const metadata of entityMetadatas) {
    const type = metadata.tableType === "view" ? "view" : "table";
    const name = metadata.tableName;
    const target = metadata.target;
    const filePath = Object.keys(require.cache).find((p) => {
      const cached = require.cache[p];
      if (!cached || typeof cached.exports !== "object" || !cached.exports)
        return false;
      return Object.values(cached.exports).includes(target);
    });
    if (!filePath) continue;
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
}
