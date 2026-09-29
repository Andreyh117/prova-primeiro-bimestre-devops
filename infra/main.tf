locals {
  name = "prova-6325231"
  tags = {
    Project     = "prova-primeiro-bimestre-devops"
    Environment = "learner-lab"
    Owner       = "6325231"
  }
}

# Consulta a AMI explícita antes de planejar EC2; sem seleção dinâmica latest.
data "aws_ami" "selected" {
  owners = ["amazon"]
  filter {
    name   = "image-id"
    values = [var.ami_id]
  }
  lifecycle {
    postcondition {
      condition = (
        self.architecture == "x86_64" && self.virtualization_type == "hvm" &&
        self.root_device_type == "ebs" && can(regex("^al2023-ami-2023.*-x86_64$", self.name)) &&
        contains(["legacy-bios", "uefi-preferred"], self.boot_mode) &&
        try(tonumber(one([for mapping in self.block_device_mappings : mapping if mapping.device_name == self.root_device_name]).ebs.volume_size) <= 8, false)
      )
      error_message = "AMI deve ser Amazon AL2023 standard x86_64/HVM/EBS, compatível BIOS e root até 8GiB; revisar preflight."
    }
  }
}

module "vpc" {
  source               = "./modules/vpc"
  name                 = local.name
  vpc_cidr             = "10.20.0.0/16"
  availability_zones   = ["us-east-1a", "us-east-1b"]
  public_subnet_cidrs  = ["10.20.1.0/24", "10.20.2.0/24"]
  private_subnet_cidrs = ["10.20.11.0/24", "10.20.12.0/24"]
  tags                 = local.tags
}
module "security_group" {
  source            = "./modules/security-group"
  name              = local.name
  vpc_id            = module.vpc.vpc_id
  ssh_cidr          = var.ssh_cidr
  api_allowed_cidrs = var.api_allowed_cidrs
  tags              = local.tags
}
module "rds" {
  source                    = "./modules/rds"
  identifier                = "${local.name}-rds"
  private_subnet_ids        = module.vpc.private_subnet_ids
  rds_sg_id                 = module.security_group.rds_sg_id
  engine_version            = var.rds_engine_version
  instance_class            = "db.t3.micro"
  db_name                   = "reservas"
  username                  = var.rds_username
  password                  = var.rds_password
  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = var.final_snapshot_identifier
  tags                      = local.tags
}
module "ec2" {
  source               = "./modules/ec2"
  name                 = "${local.name}-api"
  ami_id               = data.aws_ami.selected.id
  instance_type        = "t2.micro"
  public_subnet_id     = module.vpc.public_subnet_ids[0]
  ec2_sg_id            = module.security_group.ec2_sg_id
  key_name             = var.key_name
  iam_instance_profile = var.iam_instance_profile
  tags                 = local.tags
}
