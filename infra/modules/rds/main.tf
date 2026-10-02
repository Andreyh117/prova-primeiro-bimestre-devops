resource "aws_db_subnet_group" "private" {
  name        = "${var.identifier}-private"
  description = "Private subnets in two availability zones for the exam RDS"
  subnet_ids  = var.private_subnet_ids
  tags        = merge(var.tags, { Name = "${var.identifier}-private" })
}

resource "aws_db_instance" "this" {
  identifier             = var.identifier
  engine                 = "postgres"
  engine_version         = var.engine_version
  instance_class         = var.instance_class
  db_name                = var.db_name
  username               = var.username
  password               = var.password
  port                   = 5432
  db_subnet_group_name   = aws_db_subnet_group.private.name
  vpc_security_group_ids = [var.rds_sg_id]
  publicly_accessible    = false
  storage_encrypted      = true
  storage_type           = "gp3"
  allocated_storage      = 20
  max_allocated_storage  = 0
  multi_az               = false

  # Lab temporário: proposta sem backups retidos/serviços adicionais.
  # Não executar destroy sem revisão de descarte/retenção em T27/T28.
  backup_retention_period   = 0
  delete_automated_backups  = true
  deletion_protection       = false
  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = var.final_snapshot_identifier
  copy_tags_to_snapshot     = true

  auto_minor_version_upgrade          = false
  allow_major_version_upgrade         = false
  engine_lifecycle_support            = "open-source-rds-extended-support-disabled"
  monitoring_interval                 = 0
  performance_insights_enabled        = false
  iam_database_authentication_enabled = false

  tags = merge(var.tags, { Name = var.identifier })
}
