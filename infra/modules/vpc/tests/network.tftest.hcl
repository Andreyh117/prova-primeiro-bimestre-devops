# Testes LOCAIS do contrato HCL. Provider mock: não chama AWS, não prova deploy.
# Todos os runs usam plan; referências de IDs são verificadas pelo grafo nativo.
mock_provider "aws" {}

variables {
  name                 = "prova-6325231"
  vpc_cidr             = "10.20.0.0/16"
  availability_zones   = ["us-east-1a", "us-east-1b"]
  public_subnet_cidrs  = ["10.20.1.0/24", "10.20.2.0/24"]
  private_subnet_cidrs = ["10.20.11.0/24", "10.20.12.0/24"]
  tags = {
    Project     = "prova-primeiro-bimestre-devops"
    Environment = "learner-lab"
    Owner       = "6325231"
  }
}

run "network_contract" {
  command = plan

  assert {
    condition = (
      aws_vpc.this.cidr_block == "10.20.0.0/16" &&
      aws_vpc.this.enable_dns_support && aws_vpc.this.enable_dns_hostnames &&
      aws_vpc.this.instance_tenancy == "default"
    )
    error_message = "VPC deve preservar CIDR, DNS e tenancy do design."
  }

  assert {
    condition = (
      length(aws_subnet.public) == 2 && length(aws_subnet.private) == 2 &&
      tolist([for subnet in aws_subnet.public : subnet.availability_zone]) == var.availability_zones &&
      tolist([for subnet in aws_subnet.private : subnet.availability_zone]) == var.availability_zones &&
      tolist([for subnet in aws_subnet.public : subnet.cidr_block]) == var.public_subnet_cidrs &&
      tolist([for subnet in aws_subnet.private : subnet.cidr_block]) == var.private_subnet_cidrs &&
      alltrue([for subnet in aws_subnet.public : subnet.map_public_ip_on_launch]) &&
      alltrue([for subnet in aws_subnet.private : !subnet.map_public_ip_on_launch])
    )
    error_message = "São duas públicas e duas privadas, alinhadas por AZ/CIDR e IP público."
  }

  assert {
    condition = (
      length(aws_route_table.public.route) == 1 &&
      one(aws_route_table.public.route).cidr_block == "0.0.0.0/0" &&
      length(aws_route_table.private.route) == 0 &&
      length(aws_route_table_association.public) == 2 &&
      length(aws_route_table_association.private) == 2
    )
    error_message = "Somente públicas podem ter rota default; cada subnet exige associação explícita."
  }

  assert {
    condition = alltrue([
      for resource in concat(
        [aws_vpc.this, aws_internet_gateway.this, aws_route_table.public, aws_route_table.private],
        aws_subnet.public, aws_subnet.private
      ) : alltrue([for key in ["Project", "Environment", "Owner"] : resource.tags[key] == var.tags[key]])
    ])
    error_message = "Recursos com suporte a tags devem preservar as três tags comuns."
  }

  assert {
    condition = (
      length(output.public_subnet_ids) == 2 && length(output.private_subnet_ids) == 2
    )
    error_message = "Outputs devem fornecer duas subnets de cada tipo; vínculo vpc_id conferido pelo grafo."
  }
}

run "different_cidrs" {
  command = plan
  variables {
    vpc_cidr             = "10.30.0.0/16"
    public_subnet_cidrs  = ["10.30.1.0/24", "10.30.2.0/24"]
    private_subnet_cidrs = ["10.30.11.0/24", "10.30.12.0/24"]
  }
  assert {
    condition     = aws_vpc.this.cidr_block == var.vpc_cidr && aws_subnet.private[1].cidr_block == var.private_subnet_cidrs[1]
    error_message = "Módulo deve usar os inputs do chamador, sem CIDRs fixos escondidos."
  }
}

run "reject_repeated_az" {
  command = plan
  variables {
    availability_zones = ["us-east-1a", "us-east-1a"]
  }
  expect_failures = [var.availability_zones]
}

run "reject_single_public_subnet" {
  command = plan
  variables {
    public_subnet_cidrs = ["10.20.1.0/24"]
  }
  expect_failures = [var.public_subnet_cidrs]
}

run "reject_noncanonical_cidr" {
  command = plan
  variables {
    public_subnet_cidrs = ["10.20.1.1/24", "10.20.2.0/24"]
  }
  expect_failures = [var.public_subnet_cidrs]
}

run "reject_outside_vpc" {
  command = plan
  variables {
    private_subnet_cidrs = ["10.21.11.0/24", "10.21.12.0/24"]
  }
  expect_failures = [aws_vpc.this]
}

run "reject_overlapping_subnets" {
  command = plan
  variables {
    private_subnet_cidrs = ["10.20.0.0/20", "10.20.12.0/24"]
  }
  expect_failures = [aws_vpc.this]
}

run "reject_ipv6_vpc" {
  command = plan
  variables {
    vpc_cidr = "2001:db8::/56"
  }
  expect_failures = [var.vpc_cidr]
}

run "reject_missing_owner_tag" {
  command = plan
  variables {
    tags = {
      Project     = "prova-primeiro-bimestre-devops"
      Environment = "learner-lab"
    }
  }
  expect_failures = [var.tags]
}
