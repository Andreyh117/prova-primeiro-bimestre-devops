variable "name" {
  description = "Prefixo dos nomes dos recursos da rede."
  type        = string
  nullable    = false

  validation {
    condition     = length(trimspace(var.name)) > 0
    error_message = "name deve ser um prefixo não vazio."
  }
}

variable "vpc_cidr" {
  description = "CIDR IPv4 canônico da VPC; D09 usa 10.20.0.0/16."
  type        = string
  nullable    = false

  validation {
    condition = try(
      can(cidrnetmask(var.vpc_cidr)) &&
      cidrhost(var.vpc_cidr, 0) == split("/", var.vpc_cidr)[0] &&
      tonumber(split("/", var.vpc_cidr)[1]) >= 16 &&
      tonumber(split("/", var.vpc_cidr)[1]) <= 28,
      false
    )
    error_message = "vpc_cidr deve ser IPv4 canônico com prefixo entre /16 e /28."
  }
}

variable "availability_zones" {
  description = "Duas AZs distintas de us-east-1, na ordem das listas de subnets."
  type        = list(string)
  nullable    = false

  validation {
    condition = (
      length(var.availability_zones) == 2 &&
      length(distinct(var.availability_zones)) == 2 &&
      alltrue([for az in var.availability_zones : can(regex("^us-east-1[a-z]$", az))])
    )
    error_message = "availability_zones deve conter duas AZs distintas de us-east-1."
  }
}

variable "public_subnet_cidrs" {
  description = "Dois CIDRs públicos, correspondentes às duas AZs por índice."
  type        = list(string)
  nullable    = false

  validation {
    condition = length(var.public_subnet_cidrs) == 2 && alltrue([
      for cidr in var.public_subnet_cidrs : try(
        can(cidrnetmask(cidr)) && cidrhost(cidr, 0) == split("/", cidr)[0] &&
        tonumber(split("/", cidr)[1]) >= 16 && tonumber(split("/", cidr)[1]) <= 28,
        false
      )
    ])
    error_message = "public_subnet_cidrs deve conter dois CIDRs IPv4 canônicos entre /16 e /28."
  }
}

variable "private_subnet_cidrs" {
  description = "Dois CIDRs privados, correspondentes às duas AZs por índice."
  type        = list(string)
  nullable    = false

  validation {
    condition = length(var.private_subnet_cidrs) == 2 && alltrue([
      for cidr in var.private_subnet_cidrs : try(
        can(cidrnetmask(cidr)) && cidrhost(cidr, 0) == split("/", cidr)[0] &&
        tonumber(split("/", cidr)[1]) >= 16 && tonumber(split("/", cidr)[1]) <= 28,
        false
      )
    ])
    error_message = "private_subnet_cidrs deve conter dois CIDRs IPv4 canônicos entre /16 e /28."
  }
}

variable "tags" {
  description = "Tags comuns; exigir Project, Environment e Owner nos recursos que suportam tags."
  type        = map(string)
  nullable    = false

  validation {
    condition = alltrue([
      for key in ["Project", "Environment", "Owner"] : try(length(trimspace(var.tags[key])) > 0, false)
    ])
    error_message = "tags deve incluir Project, Environment e Owner não vazios."
  }
}
