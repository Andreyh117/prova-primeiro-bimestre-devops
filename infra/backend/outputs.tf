output "backend_config" {
  description = "Parâmetros do backend principal futuro; usar somente após apply/conferência do bootstrap."
  value = {
    bucket         = data.aws_s3_bucket.state.bucket
    key            = "prova-primeiro-bimestre-devops/terraform.tfstate"
    region         = var.aws_region
    encrypt        = true
    dynamodb_table = aws_dynamodb_table.locks.name
  }
}
