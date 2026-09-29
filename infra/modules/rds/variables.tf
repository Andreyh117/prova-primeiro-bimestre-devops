variable "identifier" {
  description = "Identificador exclusivo RDS, minúsculo, até 63 caracteres."
  type        = string
  nullable    = false
  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{0,62}$", var.identifier)) && !endswith(var.identifier, "-") && !strcontains(var.identifier, "--")
    error_message = "identifier deve começar com letra, conter somente minúsculas/números/hífens, até 63 caracteres, sem hífen final ou duplo."
  }
}

variable "private_subnet_ids" {
  description = "As duas subnets privadas em AZs distintas, via output private_subnet_ids do módulo vpc."
  type        = list(string)
  nullable    = false
  validation {
    condition = length(var.private_subnet_ids) == 2 && length(distinct(var.private_subnet_ids)) == 2 && alltrue([
      for id in var.private_subnet_ids : can(regex("^subnet-([0-9a-f]{8}|[0-9a-f]{17})$", id))
    ])
    error_message = "private_subnet_ids deve conter dois IDs subnet distintos; privacidade/AZs exigem vínculo correto no root e conferência AWS."
  }
}

variable "rds_sg_id" {
  description = "Somente o SG RDS do módulo security-group, que recebe 5432 exclusivamente do SG EC2."
  type        = string
  nullable    = false
  validation {
    condition     = can(regex("^sg-([0-9a-f]{8}|[0-9a-f]{17})$", var.rds_sg_id))
    error_message = "rds_sg_id deve ser um ID SG válido; suas regras são conferidas no módulo de segurança e AWS."
  }
}

variable "engine_version" {
  description = "Versão PostgreSQL 16.x completa; 16.15 observada em T13, reconsultar disponibilidade antes do plano."
  type        = string
  default     = "16.15"
  nullable    = false
  validation {
    condition     = can(regex("^16\\.[0-9]+$", var.engine_version))
    error_message = "engine_version deve indicar versão PostgreSQL 16.x explícita, compatível com o preflight desta prova."
  }
}

variable "instance_class" {
  description = "Classe exigida na prova; não ampliar automaticamente custo/tipo."
  type        = string
  default     = "db.t3.micro"
  nullable    = false
  validation {
    condition     = var.instance_class == "db.t3.micro"
    error_message = "instance_class deve ser db.t3.micro nesta prova."
  }
}

variable "db_name" {
  description = "Nome do banco da API; conferir palavras reservadas antes do plano real."
  type        = string
  default     = "reservas"
  nullable    = false
  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9_]{0,62}$", var.db_name)) && lower(var.db_name) != "rdsadmin"
    error_message = "db_name deve ter 1–63 letras/números/underscores, começar com letra e não ser rdsadmin."
  }
}

variable "username" {
  description = "Usuário administrador fornecido privadamente; validar palavras reservadas antes do plano."
  type        = string
  nullable    = false
  sensitive   = true
  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9_]{0,15}$", var.username)) && lower(var.username) != "rdsadmin"
    error_message = "username deve ter 1–16 letras/números/underscores, começar com letra e não ser rdsadmin; não imprimir seu valor."
  }
}

variable "password" {
  description = "Senha privada RDS; sensitive oculta a saída usual, mas não remove senha do state/plano."
  type        = string
  nullable    = false
  sensitive   = true
  validation {
    condition     = can(regex("^[!-~]{8,128}$", var.password)) && !strcontains(var.password, "/") && !strcontains(var.password, "@") && !strcontains(var.password, "\"")
    error_message = "password deve ter 8–128 caracteres ASCII imprimíveis, sem espaços, /, @ ou aspas duplas; não imprimir seu valor."
  }
}

variable "skip_final_snapshot" {
  description = "Decisão explícita de política: true propõe descarte sem snapshot final; destroy exige revisão/autorização T27/T28."
  type        = bool
  nullable    = false
}

variable "final_snapshot_identifier" {
  description = "Obrigatório quando skip_final_snapshot=false; null quando true. Retenção e custo exigem revisão."
  type        = string
  default     = null
  validation {
    condition = var.skip_final_snapshot ? var.final_snapshot_identifier == null : try(
      can(regex("^[a-z][a-z0-9-]{0,62}$", var.final_snapshot_identifier)) &&
      !endswith(var.final_snapshot_identifier, "-") && !strcontains(var.final_snapshot_identifier, "--"), false
    )
    error_message = "final_snapshot_identifier deve ser null ao pular snapshot, ou identificador válido explícito ao retê-lo."
  }
}

variable "tags" {
  description = "Tags comuns Project, Environment e Owner, propagadas à instância e subnet group."
  type        = map(string)
  nullable    = false
  validation {
    condition     = alltrue([for key in ["Project", "Environment", "Owner"] : try(length(trimspace(var.tags[key])) > 0, false)])
    error_message = "tags deve conter Project, Environment e Owner não vazios."
  }
}
