#!/bin/bash
set -euo pipefail
umask 077

# Amazon Linux 2023: instalar Docker dos repositórios da AMI escolhida.
# Não usar set -x; nunca colocar credenciais, senha RDS ou imagem privada aqui.
dnf install -y docker
systemctl enable --now docker

# Artefatos públicos e ambiente privado serão transferidos separadamente em T24.
install -d -o root -g root -m 0755 /opt/prova-reservas
install -d -o root -g root -m 0700 /etc/prova-reservas
