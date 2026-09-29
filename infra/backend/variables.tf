variable "aws_region" {
  description = "Região autorizada para esta prova no Learner Lab."
  type        = string
  default     = "us-east-1"

  validation {
    condition     = var.aws_region == "us-east-1"
    error_message = "Esta prova usa somente us-east-1."
  }
}

variable "aws_profile" {
  description = "Perfil local com credenciais temporárias, incluindo session token."
  type        = string
  default     = "default"
}

variable "aws_account_id" {
  description = "Conta do Lab conferida por STS; protege contra uso em outra conta."
  type        = string
  sensitive   = true

  validation {
    condition     = can(regex("^[0-9]{12}$", var.aws_account_id))
    error_message = "Informe o ID de 12 dígitos da conta do Learner Lab confirmado."
  }
}

variable "state_bucket_name" {
  description = "Nome S3 exclusivo do projeto; usar somente letras minúsculas, números e hífens."
  type        = string

  validation {
    condition = (
      length(var.state_bucket_name) >= 3 && length(var.state_bucket_name) <= 63 &&
      can(regex("^[a-z0-9][a-z0-9-]*[a-z0-9]$", var.state_bucket_name)) &&
      !startswith(var.state_bucket_name, "xn--") &&
      !startswith(var.state_bucket_name, "sthree-") &&
      !startswith(var.state_bucket_name, "amzn-s3-demo-") &&
      !endswith(var.state_bucket_name, "-s3alias") &&
      !endswith(var.state_bucket_name, "--ol-s3") &&
      !endswith(var.state_bucket_name, "--x-s3") &&
      !endswith(var.state_bucket_name, "--table-s3") &&
      !endswith(var.state_bucket_name, "-an")
    )
    error_message = "Use um nome S3 válido de 3–63 caracteres, sem pontos ou afixos reservados."
  }
}

variable "lock_table_name" {
  description = "Nome exclusivo da tabela de locking do state principal."
  type        = string

  validation {
    condition = (
      length(var.lock_table_name) >= 3 && length(var.lock_table_name) <= 255 &&
      can(regex("^[A-Za-z0-9_.-]+$", var.lock_table_name))
    )
    error_message = "Use um nome DynamoDB de 3–255 caracteres: letras, números, ponto, hífen ou underscore."
  }
}
