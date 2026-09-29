# Contrato LOCAL, provider mock/command=plan; IDs fictícios não provam AWS.
mock_provider "aws" {}
variables {
  name                 = "prova-6325231-api"
  ami_id               = "ami-0123456789abcdef0"
  public_subnet_id     = "subnet-0123456789abcdef0"
  ec2_sg_id            = "sg-0123456789abcdef0"
  key_name             = "vockey"
  iam_instance_profile = "LabInstanceProfile"
  tags = {
    Project     = "prova-primeiro-bimestre-devops"
    Environment = "learner-lab"
    Owner       = "6325231"
  }
}
run "ec2_contract" {
  command = plan
  assert {
    condition = (
      aws_instance.this.ami == var.ami_id && aws_instance.this.instance_type == "t2.micro" &&
      aws_instance.this.subnet_id == var.public_subnet_id &&
      toset(aws_instance.this.vpc_security_group_ids) == toset([var.ec2_sg_id]) &&
      aws_instance.this.associate_public_ip_address && aws_instance.this.key_name == var.key_name &&
      aws_instance.this.iam_instance_profile == "LabInstanceProfile" &&
      aws_instance.this.tenancy == "default" && !aws_instance.this.monitoring && aws_instance.this.source_dest_check
    )
    error_message = "EC2 deve preservar inputs e tipo/subnet/SG único/key/profile existente sem serviços adicionais."
  }
  assert {
    condition = (
      aws_instance.this.metadata_options[0].http_tokens == "required" &&
      aws_instance.this.metadata_options[0].http_endpoint == "enabled" &&
      aws_instance.this.metadata_options[0].http_put_response_hop_limit == 1 &&
      aws_instance.this.metadata_options[0].instance_metadata_tags == "disabled" &&
      aws_instance.this.credit_specification[0].cpu_credits == "standard"
    )
    error_message = "IMDSv2 obrigatório, hop1/tags desabilitadas e CPU standard devem estar explícitos."
  }
  assert {
    condition = (
      aws_instance.this.root_block_device[0].encrypted &&
      aws_instance.this.root_block_device[0].volume_type == "gp3" &&
      aws_instance.this.root_block_device[0].volume_size == 8 &&
      aws_instance.this.root_block_device[0].delete_on_termination &&
      aws_instance.this.user_data_replace_on_change
    )
    error_message = "Raiz gp3 8GiB encriptada/excluída na terminação, user-data exige recriação ao mudar."
  }
  assert {
    condition = alltrue([
      for tags in [aws_instance.this.tags, aws_instance.this.root_block_device[0].tags] :
      alltrue([for key in ["Project", "Environment", "Owner"] : tags[key] == var.tags[key]]) && length(tags.Name) > 0
    ])
    error_message = "Instância e volume raiz exigem tags comuns/Name."
  }
}
run "optional_profile_and_short_ids" {
  command = plan
  variables {
    name                 = "api-alternativa"
    ami_id               = "ami-0123abcd"
    public_subnet_id     = "subnet-0123abcd"
    ec2_sg_id            = "sg-0123abcd"
    key_name             = "fixture-existing-key"
    iam_instance_profile = null
  }
  assert {
    condition = (
      var.iam_instance_profile == null && aws_instance.this.ami == var.ami_id &&
      aws_instance.this.subnet_id == var.public_subnet_id && aws_instance.this.key_name == var.key_name &&
      aws_instance.this.tags.Name == var.name
    )
    error_message = "Perfil opcional e demais inputs devem ser respeitados, sem criar IAM."
  }
}

run "reject_bad_ami" {
  command = plan
  variables {
    ami_id = "ami-invalid"
  }
  expect_failures = [var.ami_id]
}

run "reject_wrong_type" {
  command = plan
  variables {
    instance_type = "t3.micro"
  }
  expect_failures = [var.instance_type]
}

run "reject_bad_subnet" {
  command = plan
  variables {
    public_subnet_id = "subnet-invalid"
  }
  expect_failures = [var.public_subnet_id]
}

run "reject_bad_sg" {
  command = plan
  variables {
    ec2_sg_id = "sg-invalid"
  }
  expect_failures = [var.ec2_sg_id]
}

run "reject_private_key_path" {
  command = plan
  variables {
    key_name = "/tmp/vockey.pem"
  }
  expect_failures = [var.key_name]
}

run "reject_new_profile" {
  command = plan
  variables {
    iam_instance_profile = "NewRole"
  }
  expect_failures = [var.iam_instance_profile]
}

run "reject_empty_name" {
  command = plan
  variables {
    name = "   "
  }
  expect_failures = [var.name]
}

run "reject_missing_owner" {
  command = plan
  variables {
    tags = { Project = "prova-primeiro-bimestre-devops", Environment = "learner-lab" }
  }
  expect_failures = [var.tags]
}
