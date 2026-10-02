# Grupos sem regras inline: regras separadas evitam ciclos e conflitos de gestão.
# O provider AWS remove a saída ALLOW ALL ao criar cada grupo novo.
resource "aws_security_group" "ec2" {
  name_prefix = "${var.name}-ec2-"
  description = "API EC2: restricted SSH and application access"
  vpc_id      = var.vpc_id
  tags        = merge(var.tags, { Name = "${var.name}-ec2" })
}

resource "aws_security_group" "rds" {
  name_prefix = "${var.name}-rds-"
  description = "Private PostgreSQL: only from the API EC2 security group"
  vpc_id      = var.vpc_id
  tags        = merge(var.tags, { Name = "${var.name}-rds" })
}

resource "aws_vpc_security_group_ingress_rule" "ssh" {
  security_group_id = aws_security_group.ec2.id
  description       = "SSH from the approved student IPv4 host"
  cidr_ipv4         = var.ssh_cidr
  ip_protocol       = "tcp"
  from_port         = 22
  to_port           = 22
  tags              = merge(var.tags, { Name = "${var.name}-ssh" })
}

resource "aws_vpc_security_group_ingress_rule" "api" {
  for_each          = var.api_allowed_cidrs
  security_group_id = aws_security_group.ec2.id
  description       = "API from an approved IPv4 host"
  cidr_ipv4         = each.value
  ip_protocol       = "tcp"
  from_port         = 3000
  to_port           = 3000
  tags              = merge(var.tags, { Name = "${var.name}-api-${replace(each.value, "/", "-")}" })
}

resource "aws_vpc_security_group_ingress_rule" "postgres" {
  security_group_id            = aws_security_group.rds.id
  referenced_security_group_id = aws_security_group.ec2.id
  description                  = "PostgreSQL only from the API EC2 security group"
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
  tags                         = merge(var.tags, { Name = "${var.name}-rds-postgres" })
}

resource "aws_vpc_security_group_egress_rule" "web" {
  for_each          = toset(["80", "443"])
  security_group_id = aws_security_group.ec2.id
  description       = "HTTP or HTTPS for installation and artifacts"
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
  from_port         = tonumber(each.value)
  to_port           = tonumber(each.value)
  tags              = merge(var.tags, { Name = "${var.name}-web-${each.value}" })
}

resource "aws_vpc_security_group_egress_rule" "postgres" {
  security_group_id            = aws_security_group.ec2.id
  referenced_security_group_id = aws_security_group.rds.id
  description                  = "PostgreSQL only to the private RDS security group"
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
  tags                         = merge(var.tags, { Name = "${var.name}-ec2-postgres" })
}

# DNS AmazonProvidedDNS/Route 53 Resolver não é filtrado por SG; sem regra 53.
# RDS sem saída iniciada: respostas às conexões permitidas são stateful.
