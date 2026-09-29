# O SCP do Learner Lab bloqueia GetBucketObjectLockConfiguration no recurso
# aws_s3_bucket. Preservar o bucket criado no apply parcial; não destruí-lo.
removed {
  from = aws_s3_bucket.state

  lifecycle {
    destroy = false
  }
}

# Consulta o bucket existente sem a leitura Object Lock do recurso completo.
# Criação/remoção do bucket fora desse state é documentada no README.
data "aws_s3_bucket" "state" {
  bucket = var.state_bucket_name

  lifecycle {
    postcondition {
      condition     = self.bucket_region == var.aws_region
      error_message = "O bucket existente deve estar em us-east-1."
    }
  }
}

resource "aws_s3_bucket_versioning" "state" {
  bucket                = data.aws_s3_bucket.state.id
  expected_bucket_owner = var.aws_account_id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket                = data.aws_s3_bucket.state.id
  expected_bucket_owner = var.aws_account_id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "state" {
  bucket = data.aws_s3_bucket.state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_dynamodb_table" "locks" {
  name         = var.lock_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}
