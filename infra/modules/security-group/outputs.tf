output "ec2_sg_id" {
  description = "SG da EC2, disponível após instalar suas regras de entrada/saída."
  value       = aws_security_group.ec2.id
  depends_on = [
    aws_vpc_security_group_ingress_rule.ssh,
    aws_vpc_security_group_ingress_rule.api,
    aws_vpc_security_group_egress_rule.web,
    aws_vpc_security_group_egress_rule.postgres,
  ]
}

output "rds_sg_id" {
  description = "SG do RDS, disponível após permitir PostgreSQL somente da EC2."
  value       = aws_security_group.rds.id
  depends_on  = [aws_vpc_security_group_ingress_rule.postgres]
}
