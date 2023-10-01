variable "dialect" {
  type = string
}

locals {
  dev_url = {
    mysql = "docker://mysql/8/dev"
    postgres = "docker://postgres/15"
    sqlite = "sqlite://file::memory:?cache=shared"
  }[var.dialect]
}

data "external_schema" "typeorm" {
  program = [
    "npx",
    "ts-node",
    "load-models.ts",
     var.dialect,
  ]
}

env "typeorm" {
  src = data.external_schema.sequelize.url
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