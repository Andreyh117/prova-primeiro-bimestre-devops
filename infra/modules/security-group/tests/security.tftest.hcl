# Contrato LOCAL com provider mock; todos os runs são plan, sem AWS/deploy.
# IPs RFC 5737 e ID fictício; referências entre SGs conferidas no grafo nativo.
mock_provider "aws" {}

variables {
  name              = "prova-6325231"
  vpc_id            = "vpc-0123456789abcdef0"
  ssh_cidr          = "198.51.100.10/32"
  api_allowed_cidrs = ["198.51.100.10/32"]
  tags = {
    Project     = "prova-primeiro-bimestre-devops"
    Environment = "learner-lab"
    Owner       = "6325231"
  }
}

run "security_contract" {
  command = plan
  assert {
    condition = (
      aws_security_group.ec2.vpc_id == var.vpc_id && aws_security_group.rds.vpc_id == var.vpc_id &&
      aws_security_group.ec2.name_prefix == "${var.name}-ec2-" &&
      aws_security_group.rds.name_prefix == "${var.name}-rds-"
    )
    error_message = "Ambos os grupos devem estar na VPC fornecida, com nomes distintos."
  }
  assert {
    condition = (
      aws_vpc_security_group_ingress_rule.ssh.cidr_ipv4 == var.ssh_cidr &&
      aws_vpc_security_group_ingress_rule.ssh.from_port == 22 &&
      aws_vpc_security_group_ingress_rule.ssh.to_port == 22 &&
      aws_vpc_security_group_ingress_rule.ssh.ip_protocol == "tcp" &&
      toset([for rule in aws_vpc_security_group_ingress_rule.api : rule.cidr_ipv4]) == var.api_allowed_cidrs &&
      alltrue([for rule in aws_vpc_security_group_ingress_rule.api : rule.from_port == 3000 && rule.to_port == 3000 && rule.ip_protocol == "tcp"])
    )
    error_message = "Entradas 22/3000 devem preservar portas TCP e somente os IPv4s /32 explícitos."
  }
  assert {
    condition = alltrue([
      for rule in [aws_vpc_security_group_ingress_rule.postgres, aws_vpc_security_group_egress_rule.postgres] :
      rule.from_port == 5432 && rule.to_port == 5432 && rule.ip_protocol == "tcp" &&
      rule.cidr_ipv4 == null && rule.cidr_ipv6 == null && rule.prefix_list_id == null
    ])
    error_message = "PostgreSQL deve usar TCP 5432 e referências de SG, nunca CIDRs/prefix lists."
  }
  assert {
    condition = (
      length(aws_vpc_security_group_egress_rule.web) == 2 &&
      toset([for rule in aws_vpc_security_group_egress_rule.web : rule.from_port]) == toset([80, 443]) &&
      alltrue([for rule in aws_vpc_security_group_egress_rule.web : rule.to_port == rule.from_port && rule.ip_protocol == "tcp" && rule.cidr_ipv4 == "0.0.0.0/0"])
    )
    error_message = "Saídas web devem permitir somente TCP 80/443, sem liberar todos os protocolos/portas."
  }
  assert {
    condition = alltrue([
      for resource in concat(
        [aws_security_group.ec2, aws_security_group.rds, aws_vpc_security_group_ingress_rule.ssh,
        aws_vpc_security_group_ingress_rule.postgres, aws_vpc_security_group_egress_rule.postgres],
        values(aws_vpc_security_group_ingress_rule.api), values(aws_vpc_security_group_egress_rule.web)
      ) : alltrue([for key in ["Project", "Environment", "Owner"] : resource.tags[key] == var.tags[key]]) && length(resource.tags.Name) > 0
    ])
    error_message = "Grupos e todas as regras devem preservar tags comuns e Name."
  }
}

run "multiple_approved_hosts" {
  command = plan
  variables {
    ssh_cidr          = "203.0.113.7/32"
    api_allowed_cidrs = ["198.51.100.10/32", "198.51.100.20/32"]
    vpc_id            = "vpc-0123abcd"
  }
  assert {
    condition = (
      length(aws_vpc_security_group_ingress_rule.api) == 2 &&
      toset([for rule in aws_vpc_security_group_ingress_rule.api : rule.cidr_ipv4]) == var.api_allowed_cidrs &&
      aws_vpc_security_group_ingress_rule.ssh.cidr_ipv4 == var.ssh_cidr && aws_security_group.rds.vpc_id == var.vpc_id
    )
    error_message = "Inputs devem ser respeitados; cada IPv4 aprovado gera uma regra API."
  }
}

run "reject_bad_vpc" {
  command = plan
  variables {
    vpc_id = "vpc-invalid"
  }
  expect_failures = [var.vpc_id]
}

run "reject_ssh_public" {
  command = plan
  variables {
    ssh_cidr = "0.0.0.0/0"
  }
  expect_failures = [var.ssh_cidr]
}

run "reject_ssh_network" {
  command = plan
  variables {
    ssh_cidr = "198.51.100.0/24"
  }
  expect_failures = [var.ssh_cidr]
}

run "reject_ssh_ipv6" {
  command = plan
  variables {
    ssh_cidr = "2001:db8::1/128"
  }
  expect_failures = [var.ssh_cidr]
}

run "reject_ssh_malformed" {
  command = plan
  variables {
    ssh_cidr = "198.51.100.999/32"
  }
  expect_failures = [var.ssh_cidr]
}

run "reject_empty_api" {
  command = plan
  variables {
    api_allowed_cidrs = []
  }
  expect_failures = [var.api_allowed_cidrs]
}

run "reject_api_public" {
  command = plan
  variables {
    api_allowed_cidrs = ["198.51.100.10/32", "0.0.0.0/0"]
  }
  expect_failures = [var.api_allowed_cidrs]
}

run "reject_api_network" {
  command = plan
  variables {
    api_allowed_cidrs = ["198.51.100.0/24"]
  }
  expect_failures = [var.api_allowed_cidrs]
}

run "reject_api_ipv6" {
  command = plan
  variables {
    api_allowed_cidrs = ["2001:db8::1/128"]
  }
  expect_failures = [var.api_allowed_cidrs]
}

run "reject_api_malformed" {
  command = plan
  variables {
    api_allowed_cidrs = ["invalid"]
  }
  expect_failures = [var.api_allowed_cidrs]
}

run "reject_reserved_name" {
  command = plan
  variables {
    name = "sg-reserved"
  }
  expect_failures = [var.name]
}

run "reject_missing_owner" {
  command = plan
  variables {
    tags = { Project = "prova-primeiro-bimestre-devops", Environment = "learner-lab" }
  }
  expect_failures = [var.tags]
}
