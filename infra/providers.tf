terraform {
  required_version = "= 1.16.2"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "= 6.65.0"
    }
  }
  # Configuração privada local fornecida por init, após conferir bootstrap.
  backend "s3" {}
}

provider "aws" {
  region              = var.aws_region
  profile             = var.aws_profile
  allowed_account_ids = [var.aws_account_id]
}
