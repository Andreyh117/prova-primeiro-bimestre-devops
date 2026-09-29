output "identifier" {
  description = "Identificador RDS para consultas de estado, sem credenciais."
  value       = aws_db_instance.this.identifier
}

output "hostname" {
  description = "Hostname RDS sem porta; usar como PGHOST no deploy futuro."
  value       = aws_db_instance.this.address
}

output "port" {
  description = "Porta PostgreSQL para PGPORT; não contém senha."
  value       = aws_db_instance.this.port
}
