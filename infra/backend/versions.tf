terraform {
  required_version = "= 1.16.2"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "= 6.65.0"
    }
  }

  # O backend remoto principal só será inicializado depois do bootstrap aplicado.
  backend "local" {
    path = "terraform.tfstate"
  }
}
