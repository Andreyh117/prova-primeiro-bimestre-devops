# Validação LOCAL: provider mock + command=plan em todos os runs, sem AWS.
# IDs fictícios e credenciais de fixture públicas, nunca usar em recursos reais.
mock_provider "aws" {}
variables {
  identifier          = "prova-6325231-rds"
  private_subnet_ids  = ["subnet-0123456789abcdef0", "subnet-0123456789abcdef1"]
  rds_sg_id           = "sg-0123456789abcdef0"
  username            = "fixture_user"
  password            = "FixtureOnly123!"
  skip_final_snapshot = true
  tags = {
    Project     = "prova-primeiro-bimestre-devops"
    Environment = "learner-lab"
    Owner       = "6325231"
  }
}
run "private_rds_contract" {
  command = plan
  assert {
    condition = (
      toset(aws_db_subnet_group.private.subnet_ids) == toset(var.private_subnet_ids) &&
      aws_db_subnet_group.private.name == "${var.identifier}-private" &&
      toset(aws_db_instance.this.vpc_security_group_ids) == toset([var.rds_sg_id]) &&
      !aws_db_instance.this.publicly_accessible && aws_db_instance.this.storage_encrypted &&
      !aws_db_instance.this.multi_az
    )
    error_message = "RDS deve usar exatamente as privadas e um único SG explícito, encriptado e sem acesso público."
  }
  assert {
    condition = (
      aws_db_instance.this.engine == "postgres" && aws_db_instance.this.engine_version == "16.15" &&
      aws_db_instance.this.instance_class == "db.t3.micro" && aws_db_instance.this.db_name == "reservas" &&
      aws_db_instance.this.port == 5432 && aws_db_instance.this.storage_type == "gp3" &&
      aws_db_instance.this.allocated_storage == 20 && aws_db_instance.this.max_allocated_storage == 0 &&
      !aws_db_instance.this.auto_minor_version_upgrade && !aws_db_instance.this.allow_major_version_upgrade &&
      aws_db_instance.this.engine_lifecycle_support == "open-source-rds-extended-support-disabled"
    )
    error_message = "Contrato PostgreSQL/classe/gp3/20GiB/versão fixa deve ser preservado."
  }
  assert {
    condition = (
      aws_db_instance.this.username == var.username && aws_db_instance.this.password == var.password &&
      !aws_db_instance.this.iam_database_authentication_enabled &&
      aws_db_instance.this.monitoring_interval == 0 && !aws_db_instance.this.performance_insights_enabled
    )
    error_message = "Credenciais sensíveis devem ser conectadas sem criar serviços de segredos/IAM/monitoramento extra."
  }
  assert {
    condition = (
      aws_db_instance.this.backup_retention_period == 0 && aws_db_instance.this.delete_automated_backups &&
      !aws_db_instance.this.deletion_protection && aws_db_instance.this.skip_final_snapshot &&
      aws_db_instance.this.final_snapshot_identifier == null && aws_db_instance.this.copy_tags_to_snapshot
    )
    error_message = "Política explícita do fixture Lab propõe limpeza sem retenção; não autoriza destroy."
  }
  assert {
    condition = alltrue([
      for resource in [aws_db_subnet_group.private, aws_db_instance.this] :
      alltrue([for key in ["Project", "Environment", "Owner"] : resource.tags[key] == var.tags[key]]) && length(resource.tags.Name) > 0
    ]) && output.identifier == var.identifier && output.port == 5432
    error_message = "Instância/subnet group devem preservar tags e outputs sem credenciais."
  }
}
run "explicit_retention_and_inputs" {
  command = plan
  variables {
    identifier                = "prova-alternativa"
    db_name                   = "reservas_alternativas"
    engine_version            = "16.14"
    skip_final_snapshot       = false
    final_snapshot_identifier = "prova-alternativa-final"
    private_subnet_ids        = ["subnet-0123abcd", "subnet-0123abce"]
    rds_sg_id                 = "sg-0123abcd"
  }
  assert {
    condition = (
      aws_db_instance.this.identifier == var.identifier && aws_db_instance.this.db_name == var.db_name &&
      aws_db_instance.this.engine_version == var.engine_version && !aws_db_instance.this.skip_final_snapshot &&
      aws_db_instance.this.final_snapshot_identifier == var.final_snapshot_identifier &&
      toset(aws_db_subnet_group.private.subnet_ids) == toset(var.private_subnet_ids) &&
      toset(aws_db_instance.this.vpc_security_group_ids) == toset([var.rds_sg_id])
    )
    error_message = "Inputs e retenção explícita devem ser respeitados; versão/IDs de fixture não provam disponibilidade AWS."
  }
}

run "reject_one_subnet" {
  command = plan
  variables {
    private_subnet_ids = ["subnet-0123abcd"]
  }
  expect_failures = [var.private_subnet_ids]
}

run "reject_repeated_subnets" {
  command = plan
  variables {
    private_subnet_ids = ["subnet-0123abcd", "subnet-0123abcd"]
  }
  expect_failures = [var.private_subnet_ids]
}

run "reject_bad_subnet" {
  command = plan
  variables {
    private_subnet_ids = ["subnet-invalid", "subnet-0123abcd"]
  }
  expect_failures = [var.private_subnet_ids]
}

run "reject_bad_sg" {
  command = plan
  variables {
    rds_sg_id = "sg-invalid"
  }
  expect_failures = [var.rds_sg_id]
}

run "reject_wrong_class" {
  command = plan
  variables {
    instance_class = "db.t3.large"
  }
  expect_failures = [var.instance_class]
}

run "reject_other_major" {
  command = plan
  variables {
    engine_version = "15.17"
  }
  expect_failures = [var.engine_version]
}

run "reject_bad_identifier" {
  command = plan
  variables {
    identifier = "bad--name"
  }
  expect_failures = [var.identifier]
}

run "reject_bad_dbname" {
  command = plan
  variables {
    db_name = "invalid-db"
  }
  expect_failures = [var.db_name]
}

run "reject_bad_username" {
  command = plan
  variables {
    username = "1invalid"
  }
  expect_failures = [var.username]
}

run "reject_short_password" {
  command = plan
  variables {
    password = "short"
  }
  expect_failures = [var.password]
}

run "reject_slash_password" {
  command = plan
  variables {
    password = "Fixture/123!"
  }
  expect_failures = [var.password]
}

run "reject_space_password" {
  command = plan
  variables {
    password = "Fixture 123!"
  }
  expect_failures = [var.password]
}

run "reject_missing_owner" {
  command = plan
  variables {
    tags = { Project = "prova-primeiro-bimestre-devops", Environment = "learner-lab" }
  }
  expect_failures = [var.tags]
}

run "reject_unneeded_snapshot" {
  command = plan
  variables {
    final_snapshot_identifier = "unneeded-final"
  }
  expect_failures = [var.final_snapshot_identifier]
}

run "reject_missing_final_snapshot" {
  command = plan
  variables {
    skip_final_snapshot = false
  }
  expect_failures = [var.final_snapshot_identifier]
}
