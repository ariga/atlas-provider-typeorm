import { EntitySchema } from "typeorm";
export type Dialect = "mysql" | "postgres" | "mariadb" | "sqlite" | "mssql";
export declare function loadEntities(dialect: Dialect, entities: (Function | EntitySchema | string)[]): Promise<string>;
