import { DataSource, EntitySchema, Table, TableForeignKey } from "typeorm";
import { ConnectionMetadataBuilder } from "typeorm/connection/ConnectionMetadataBuilder";
import { EntityMetadataValidator } from "typeorm/metadata-builder/EntityMetadataValidator";
import { View } from "typeorm/schema-builder/view/View";

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

  // create tables statements
  for (const metadata of entityMetadatas) {
    if (metadata.tableType === "view") {
      continue;
    }
    const table = Table.create(metadata, driver);
    await queryRunner.createTable(table);
  }

  // creating foreign keys statements are executed after all tables created since foreign keys can reference tables that were created afterwards.
  for (const metadata of entityMetadatas) {
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

  const memorySql = queryRunner.getMemorySql();
  const queries = memorySql.upQueries.map((query) => query.query);
  queryRunner.clearSqlMemory();
  return queries.join(";\n");
}
