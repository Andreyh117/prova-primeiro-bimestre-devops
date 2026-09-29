locals {
  subnet_networks = [
    for cidr in concat(var.public_subnet_cidrs, var.private_subnet_cidrs) : {
      address = try(cidrhost(cidr, 0), "invalid")
      prefix  = try(tonumber(split("/", cidr)[1]), 0)
    }
  ]
}

resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true
  instance_tenancy     = "default"
  tags                 = merge(var.tags, { Name = var.name })

  lifecycle {
    precondition {
      condition = alltrue([
        for subnet in local.subnet_networks : try(
          subnet.prefix >= tonumber(split("/", var.vpc_cidr)[1]) &&
          cidrhost("${subnet.address}/${split("/", var.vpc_cidr)[1]}", 0) == cidrhost(var.vpc_cidr, 0),
          false
        )
      ])
      error_message = "Todas as subnets devem estar contidas no CIDR da VPC."
    }

    precondition {
      # No prefixo menor, redes que resultam no mesmo endereço se sobrepõem.
      condition = alltrue(flatten([
        for i, left in local.subnet_networks : [
          for j, right in local.subnet_networks : try(
            cidrhost("${left.address}/${min(left.prefix, right.prefix)}", 0) !=
            cidrhost("${right.address}/${min(left.prefix, right.prefix)}", 0),
            false
          ) if i < j
        ]
      ]))
      error_message = "Os quatro CIDRs de subnets não podem se sobrepor."
    }
  }
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
  tags   = merge(var.tags, { Name = "${var.name}-igw" })
}

resource "aws_subnet" "public" {
  count = length(var.public_subnet_cidrs)

  vpc_id                  = aws_vpc.this.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true
  tags                    = merge(var.tags, { Name = "${var.name}-public-${count.index + 1}" })
}

resource "aws_subnet" "private" {
  count = length(var.private_subnet_cidrs)

  vpc_id                  = aws_vpc.this.id
  cidr_block              = var.private_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = false
  tags                    = merge(var.tags, { Name = "${var.name}-private-${count.index + 1}" })
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }

  tags = merge(var.tags, { Name = "${var.name}-public" })
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.this.id
  # Apenas a rota local automática da VPC; sem saída IGW/NAT.
  route = []
  tags  = merge(var.tags, { Name = "${var.name}-private" })
}

# Associações explícitas evitam depender da route table principal da VPC.
resource "aws_route_table_association" "public" {
  count = length(var.public_subnet_cidrs)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count = length(var.private_subnet_cidrs)

  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}
