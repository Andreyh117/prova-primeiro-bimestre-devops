#!/bin/bash
# Recebe apenas o diretório de staging público/privado do próprio deploy.
set -euo pipefail
umask 077
stage=$1
[[ "$stage" =~ ^/home/ec2-user/prova-deploy-[a-f0-9]{32}$ ]] || exit 2
[[ -d "$stage" && ! -L "$stage" ]] || exit 2
trap 'rm -rf -- "$stage"' EXIT
cd "$stage"
sha256sum --check artifacts.sha256
systemctl is-active --quiet docker
# Um container com o mesmo nome precisa ser deste projeto antes de qualquer stop.
if docker container inspect prova-reservas-api >/dev/null 2>&1; then
  [[ $(docker inspect --format '{{index .Config.Labels "prova.owner"}}' prova-reservas-api) == 6325231 ]] || exit 1
fi
# Valores de identidade da imagem não contêm segredos.
read -r image_id < image-id
read -r source_commit < source-commit
[[ "$image_id" =~ ^sha256:[a-f0-9]{64}$ && "$source_commit" =~ ^[a-f0-9]{40}$ ]] || exit 2
docker load --input image.tar
[[ $(docker image inspect --format '{{.Id}}' "$image_id") == "$image_id" ]]
[[ $(docker image inspect --format '{{.Architecture}}' "$image_id") == amd64 ]]
[[ $(docker image inspect --format '{{.Config.User}}' "$image_id") == node ]]
[[ $(docker image inspect --format '{{index .Config.Labels "org.opencontainers.image.revision"}}' "$image_id") == "$source_commit" ]]
install -d -o root -g root -m 0755 /opt/prova-reservas
install -d -o root -g root -m 0700 /etc/prova-reservas
install -o root -g root -m 0644 rds-ca.pem /opt/prova-reservas/rds-ca.pem
install -o root -g root -m 0600 api.env /etc/prova-reservas/api.env
install -o root -g root -m 0644 manifest.json /opt/prova-reservas/deployment.json
# Migração idempotente contida na própria imagem, pela EC2 e com TLS no RDS.
docker run --rm --env-file /etc/prova-reservas/api.env --mount type=bind,src=/opt/prova-reservas/rds-ca.pem,dst=/etc/ssl/certs/rds-ca.pem,readonly "$image_id" node src/migrate.js
printf 'IMAGE_ID=%s\nSOURCE_COMMIT=%s\n' "$image_id" "$source_commit" > /etc/prova-reservas/image.env
chmod 0600 /etc/prova-reservas/image.env
systemctl stop prova-reservas-api.service 2>/dev/null || {
  [[ $(systemctl show --property=LoadState --value prova-reservas-api.service) == not-found ]]
}
if docker container inspect prova-reservas-api >/dev/null 2>&1; then
  docker stop -t 20 prova-reservas-api
  docker rm prova-reservas-api
fi
install -o root -g root -m 0644 prova-reservas-api.service /etc/systemd/system/prova-reservas-api.service
systemctl daemon-reload
systemctl enable --now prova-reservas-api.service
# Saúde usa SQL SELECT1 no RDS; não imprimir ambiente ou docker inspect completo.
for attempt in {1..30}; do
  if curl --fail --silent --show-error --max-time 5 http://127.0.0.1:3000/health; then
    printf '\n'
    systemctl is-active prova-reservas-api.service
    exit 0
  fi
  sleep 2
done
printf 'API não ficou saudável; conferir serviço e RDS sem divulgar segredos.\n' >&2
exit 1
