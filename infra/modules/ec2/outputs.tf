output "instance_id" {
  description = "ID da EC2 para consultas AWS futuras."
  value       = aws_instance.this.id
}

output "public_ip" {
  description = "IP público atribuído, sujeito a mudança após stop/start; URL composta no root T21."
  value       = aws_instance.this.public_ip
}
