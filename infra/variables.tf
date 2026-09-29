variable "aws_region" {
  type        = string
  default     = "us-east-1"
  nullable    = false
  description = "Única região autorizada do Learner Lab."
  validation {
    condition     = var.aws_region == "us-east-1"
    error_message = "aws_region deve ser us-east-1."
  }
}
variable "aws_profile" {
  type        = string
  default     = "default"
  nullable    = false
  description = "Perfil local com credenciais temporárias; nenhum segredo em HCL."
  validation {
    condition     = var.aws_profile == "default"
    error_message = "Usar perfil default da conta Learner Lab conferida."
  }
}
variable "aws_account_id" {
  type        = string
  nullable    = false
  sensitive   = true
  description = "Conta conferida por STS, privada e permitida pelo provider."
  validation {
    condition     = can(regex("^[0-9]{12}$", var.aws_account_id))
    error_message = "aws_account_id deve ter 12 dígitos; não imprimir."
  }
}
variable "ami_id" {
  type        = string
  nullable    = false
  description = "AMI AL2023 x86_64 concreta selecionada em preflight; não seguir latest silenciosamente."
}
variable "ssh_cidr" {
  type        = string
  nullable    = false
  description = "IP atual IPv4 /32 privado; validar em security-group e reconsultar antes do apply."
}
variable "api_allowed_cidrs" {
  type        = set(string)
  nullable    = false
  description = "IPs /32 aprovados; atualmente somente o aluno, guardas no módulo SG."
}
variable "key_name" {
  type        = string
  default     = "vockey"
  nullable    = false
  description = "Key pair já existente; não criar chave privada ou key pair."
}
variable "iam_instance_profile" {
  type        = string
  default     = "LabInstanceProfile"
  description = "Profile já existente; módulo aceita somente LabInstanceProfile ou null."
}
variable "rds_engine_version" {
  type        = string
  default     = "16.15"
  nullable    = false
  description = "Versão PostgreSQL16 revalidada em preflight."
}
variable "rds_username" {
  type        = string
  nullable    = false
  sensitive   = true
  description = "Usuário administrador privado, sem default/output/user-data."
}
variable "rds_password" {
  type        = string
  nullable    = false
  sensitive   = true
  description = "Senha gerada/guardada localmente; sensitive não a remove do state/plano."
}
variable "skip_final_snapshot" {
  type        = bool
  nullable    = false
  description = "Proposta explícita de descarte/retenção do Lab; rever T22/T27 antes de destruir."
}
variable "final_snapshot_identifier" {
  type        = string
  default     = null
  description = "Nome necessário se snapshot final for retido; política validada pelo módulo RDS."
}
