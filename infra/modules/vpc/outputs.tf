output "vpc_id" {
  description = "ID da VPC para os módulos de segurança, EC2 e RDS."
  value       = aws_vpc.this.id
}

output "public_subnet_ids" {
  description = "IDs das duas subnets públicas, na ordem de availability_zones."
  value       = aws_subnet.public[*].id

  # Consumidores só avançam depois de associar as rotas públicas.
  depends_on = [aws_route_table_association.public]
}

output "private_subnet_ids" {
  description = "IDs das duas subnets privadas, na ordem de availability_zones."
  value       = aws_subnet.private[*].id

  depends_on = [aws_route_table_association.private]
}
