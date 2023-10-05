# atlas-provider-typeorm

![CI](https://github.com/ariga/atlas-provider-typeorm/actions/workflows/ci.yaml/badge.svg)

Load [Typeorm](https://typeorm.io/) entities into an [Atlas](https://atlasgo.io) project.

## Use-cases
1. **Declarative migrations** - use a Terraform-like `atlas schema apply --env typeorm` to apply your Typeorm entities to the database.
2. **Automatic migration planning** - use `atlas migrate diff --env typeorm` to automatically plan a migration from the current database version to the Typeorm schema.

## Installation

Install Atlas from macOS or Linux by running:
```bash
curl -sSf https://atlasgo.sh | sh
```
See [atlasgo.io](https://atlasgo.io/getting-started#installation) for more installation options.

Install the provider by running:
```bash
npm i @ariga/atlas-provider-typeorm
```

Make sure all your Node dependencies are installed by running:
```bash
npm i
```

### Standalone 

If all of your Typeorm entities exist in a single Node module, 
you can use the provider directly to load your Typeorm schema into Atlas.

In your project directory, create a new file named `atlas.hcl` with the following contents:

```hcl
data "external_schema" "typeorm" {
  program = [
    "npx",
    "@ariga/atlas-provider-typeorm",
    "load",
    "--path", "./path/to/entities",
    "--dialect", "mysql", // mariadb | postgres | sqlite | mssql
  ]
}

env "typeorm" {
  src = data.external_schema.typeorm.url
  dev = "docker://mysql/8/dev"
  migration {
    dir = "file://migrations"
  }
  format {
    migrate {
      diff = "{{ sql . \"  \" }}"
    }
  }
}
```

### As a library

#### In TS Script 

If you want to use the provider as TS program, you can use the provider as follows:

Create a new file named `load.ts` with the following contents:

```ts
#!/usr/bin/env ts-node-script

import { loadEntities } from "@ariga/atlas-provider-typeorm/build/load";

// import typeorm entities you want to load
import { User } from "./entities/User";
import { Blog } from "./entities/Blog";

loadEntities("mysql", [User, Blog]).then((sql) => {
  console.log(sql);
});
```


#### In JS Script 

If you want to use the provider as JS program, you can use the provider as follows:

Create a new file named `load.js` with the following contents:

```js
#!/usr/bin/env node

const loadEntities = require("@ariga/atlas-provider-typeorm/build/load").loadEntities;
const EntitySchema = require("typeorm").EntitySchema;

// require typeorm entities you want to load
const post = new EntitySchema(require("./entities/Post"));
const category = new EntitySchema(require("./entities/Category"));

loadEntities("mysql", [post, category]).then((sql) => {
  console.log(sql);
});
```

Next, in your project directory, create a new file named `atlas.hcl` with the following contents:

```hcl
data "external_schema" "typeorm" {
    program = [
        "ts-node",
        "load.ts", // for javascript: "node", "load.js"
    ]
}

env "typeorm" {
    src = data.external_schema.typeorm.url
    dev = "docker://mysql/8/dev"
    migration {
        dir = "file://migrations"
    }
    format {
        migrate {
            diff = "{{ sql . \"  \" }}"
        }
    }
}
```

## Usage

Once you have the provider installed, you can use it to apply your Typeorm schema to the database:


### Apply

You can use the `atlas schema apply` command to plan and apply a migration of your current Typeorm schema
to your database. This works by inspecting the target database and comparing it to the
Typeorm schema and creating a migration plan. Atlas will prompt you to confirm the migration plan
before applying it to the database.

```bash
atlas schema apply --env typeorm -u "mysql://root:password@localhost:3306/mydb"
```
Where the `-u` flag accepts the [URL](https://atlasgo.io/concepts/url) to the
target database.

### Diff

Atlas supports a [version migration](https://atlasgo.io/concepts/declarative-vs-versioned#versioned-migrations) 
workflow, where each change to the database is versioned and recorded in a migration file. You can use the
`atlas migrate diff` command to automatically generate a migration file that will migrate the database
from its latest revision to the current Typeorm schema.

```bash
atlas migrate diff --env typeorm 
````

## Supported Databases

The provider supports the following databases:
* MySQL
* MariaDB
* PostgreSQL
* SQLite
* Microsoft SQL Server

## Issues

Please report any issues or feature requests in the [ariga/atlas](https://github.com/ariga/atlas/issues) repository.

## License

This project is licensed under the [Apache License 2.0](LICENSE).
