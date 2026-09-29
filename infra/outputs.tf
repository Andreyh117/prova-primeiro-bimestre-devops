output "ec2_instance_id" {
  description = "ID após apply; ausência nesta etapa de plano."
  value       = module.ec2.instance_id
}
output "ec2_public_ip" {
  description = "IP público após apply, sujeito a mudança stop/start."
  value       = module.ec2.public_ip
}
output "rds_endpoint" {
  description = "Hostname RDS sem porta/credenciais, para PGHOST."
  value       = module.rds.hostname
}
output "rds_port" {
  description = "Porta PostgreSQL, para PGPORT."
  value       = module.rds.port
}
output "api_url" {
  description = "URL proposta, não comprova API ou deploy; acesso somente ao /32 permitido."
  value       = "http://${module.ec2.public_ip}:3000"
}
