variable "name" {
  description = "Prefixo ASCII dos nomes; não usar o prefixo reservado sg-."
  type        = string
  nullable    = false
  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9-]{0,63}$", var.name)) && !startswith(lower(var.name), "sg-")
    error_message = "name deve ter 1–64 caracteres ASCII (letras, números ou hífen), começar com letra e não com sg-."
  }
}

variable "vpc_id" {
  description = "ID da VPC própria, obtido do output do módulo vpc."
  type        = string
  nullable    = false
  validation {
    condition     = can(regex("^vpc-([0-9a-f]{8}|[0-9a-f]{17})$", var.vpc_id))
    error_message = "vpc_id deve ser um ID VPC válido (formato curto ou longo)."
  }
}

variable "ssh_cidr" {
  description = "IPv4 /32 explícito do aluno; revalidar o IP antes do plano AWS."
  type        = string
  nullable    = false
  validation {
    condition = try(
      can(cidrnetmask(var.ssh_cidr)) &&
      cidrhost(var.ssh_cidr, 0) == split("/", var.ssh_cidr)[0] &&
      split("/", var.ssh_cidr)[1] == "32",
      false
    )
    error_message = "ssh_cidr deve ser IPv4 canônico /32 explícito; não aceitar redes amplas nem IPv6."
  }
}

variable "api_allowed_cidrs" {
  description = "IPv4s /32 aprovados para a API; atualmente somente o IP do aluno."
  type        = set(string)
  nullable    = false
  validation {
    condition = length(var.api_allowed_cidrs) > 0 && alltrue([
      for cidr in var.api_allowed_cidrs : try(
        can(cidrnetmask(cidr)) && cidrhost(cidr, 0) == split("/", cidr)[0] &&
        split("/", cidr)[1] == "32",
        false
      )
    ])
    error_message = "api_allowed_cidrs deve conter pelo menos um IPv4 canônico /32 aprovado."
  }
}

variable "tags" {
  description = "Tags comuns obrigatórias: Project, Environment e Owner."
  type        = map(string)
  nullable    = false
  validation {
    condition     = alltrue([for key in ["Project", "Environment", "Owner"] : try(length(trimspace(var.tags[key])) > 0, false)])
    error_message = "tags deve incluir Project, Environment e Owner não vazios."
  }
}
