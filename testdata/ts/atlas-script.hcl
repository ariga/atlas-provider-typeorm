variable "dialect" {
  type = string
}

locals {
  dev_url = {
    mysql = "docker://mysql/8/dev"
    postgres = "docker://postgres/15"
    mssql = "docker://sqlserver/2022-latest"
    sqlite = "sqlite://file::memory:"
  }[var.dialect]
}

data "external_schema" "typeorm" {
  program = [
    "npx",
    "ts-node",
    "load-entities.ts",
     var.dialect,
  ]
}

env "typeorm" {
  src = data.external_schema.typeorm.url
  dev = local.dev_url
  migration {
    dir = "file://migrations/${var.dialect}"
  }
  format {
    migrate {
      diff = "{{ sql . \"  \" }}"
    }
  }
}