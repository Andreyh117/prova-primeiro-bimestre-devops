variable "name" {
  description = "Nome/tag da EC2 própria da prova."
  type        = string
  nullable    = false
  validation {
    condition     = length(trimspace(var.name)) > 0 && length(var.name) <= 128
    error_message = "name deve ser não vazio e ter até 128 caracteres."
  }
}

variable "ami_id" {
  description = "AMI Amazon Linux 2023 standard x86_64/HVM/EBS, selecionada e conferida no root T21 em us-east-1."
  type        = string
  nullable    = false
  validation {
    condition     = can(regex("^ami-([0-9a-f]{8}|[0-9a-f]{17})$", var.ami_id))
    error_message = "ami_id deve ser um ID AMI válido; formato não comprova OS/arquitetura/região/compatibilidade."
  }
}

variable "instance_type" {
  description = "Tipo exigido na prova; não mudar automaticamente para outra geração/tamanho."
  type        = string
  default     = "t2.micro"
  nullable    = false
  validation {
    condition     = var.instance_type == "t2.micro"
    error_message = "instance_type deve ser t2.micro nesta prova."
  }
}

variable "public_subnet_id" {
  description = "Primeira pública via output public_subnet_ids do módulo vpc; conferir AZ/rota/IP no root e AWS."
  type        = string
  nullable    = false
  validation {
    condition     = can(regex("^subnet-([0-9a-f]{8}|[0-9a-f]{17})$", var.public_subnet_id))
    error_message = "public_subnet_id deve ser um ID subnet válido; seu formato não comprova rota pública."
  }
}

variable "ec2_sg_id" {
  description = "Único SG EC2 do módulo security-group, com SSH/API restritos e saída PostgreSQL ao RDS."
  type        = string
  nullable    = false
  validation {
    condition     = can(regex("^sg-([0-9a-f]{8}|[0-9a-f]{17})$", var.ec2_sg_id))
    error_message = "ec2_sg_id deve ser um ID SG válido; regras/origens serão conferidas no root e AWS."
  }
}

variable "key_name" {
  description = "Nome da key pair existente (vockey observada em T13); nunca caminho/conteúdo de chave privada."
  type        = string
  nullable    = false
  validation {
    condition     = can(regex("^[a-zA-Z0-9][a-zA-Z0-9._-]{0,254}$", var.key_name))
    error_message = "key_name deve ser o nome explícito da key pair existente; conferir existência/posse da chave antes do deploy."
  }
}

variable "iam_instance_profile" {
  description = "null ou LabInstanceProfile já existente; não criar IAM para contornar o Lab."
  type        = string
  default     = null
  validation {
    condition     = var.iam_instance_profile == null || var.iam_instance_profile == "LabInstanceProfile"
    error_message = "iam_instance_profile deve ser null ou LabInstanceProfile existente."
  }
}

variable "tags" {
  description = "Tags comuns obrigatórias, aplicadas na instância e volume raiz."
  type        = map(string)
  nullable    = false
  validation {
    condition     = alltrue([for key in ["Project", "Environment", "Owner"] : try(length(trimspace(var.tags[key])) > 0, false)])
    error_message = "tags deve conter Project, Environment e Owner não vazios."
  }
}
