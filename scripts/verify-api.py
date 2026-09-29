#!/usr/bin/env python3
"""Verifica uma API já iniciada; usa apenas a biblioteca padrão do Python."""

import argparse
import json
import math
import sys
import uuid
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener


class VerificationError(Exception):
    pass


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


class Verifier:
    def __init__(self, base_url, timeout):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.marker = f"Verificacao API {uuid.uuid4()}"
        self.owned_ids = set()
        self.opener = build_opener(NoRedirect())

    def request(self, method, path, body=None):
        headers = {"Accept": "application/json"}
        data = None
        if body is not None:
            data = json.dumps(body).encode("utf-8")
            headers["Content-Type"] = "application/json"
        request = Request(self.base_url + path, data=data, headers=headers, method=method)
        try:
            try:
                response = self.opener.open(request, timeout=self.timeout)
            except HTTPError as error:
                response = error
            with response:
                status = response.status
                response_headers = response.headers
                raw = response.read()
            if status == 204:
                self.require(raw == b"", "DELETE 204 deve ter corpo vazio.")
                result = None
            else:
                self.require(response_headers.get_content_type() == "application/json",
                             f"{method} {path}: resposta deve ser JSON.")
                result = json.loads(raw)
        except (URLError, OSError, ValueError) as error:
            raise VerificationError(f"{method} {path}: falha de comunicação ou JSON inválido.") from error

        # Registrar propriedade antes de conferir o status, inclusive em POST inválido.
        if method == "POST" and isinstance(result, dict):
            row_id = result.get("id")
            if type(row_id) is int and row_id > 0 and result.get("cliente") == self.marker:
                self.owned_ids.add(row_id)
        return status, result, response_headers

    @staticmethod
    def require(condition, message):
        if not condition:
            raise VerificationError(message)

    def expect(self, method, path, status, body=None):
        actual, result, headers = self.request(method, path, body)
        self.require(actual == status, f"{method} {path}: esperado HTTP {status}, recebido {actual}.")
        if status in (400, 404):
            self.require(isinstance(result, dict) and isinstance(result.get("erro"), dict),
                         f"{method} {path}: erro deve ter envelope JSON.")
        print(f"PASSOU: {method} {path} -> {actual}", flush=True)
        return result, headers

    def run(self):
        print(f"Marcador exclusivo para conferência/limpeza: {self.marker}", flush=True)
        health, _ = self.expect("GET", "/health", 200)
        self.require(health == {"status": "ok", "database": "ok"}, "Saúde do banco não confirmada.")
        original = {"cliente": self.marker, "data": "29-02-2024", "status": "pendente"}
        created, headers = self.expect("POST", "/reservas", 201, original)
        self.require(isinstance(created, dict) and type(created.get("id")) is int
                     and created["id"] in self.owned_ids, "POST não devolveu ID próprio válido.")
        row_id = created["id"]
        path = f"/reservas/{row_id}"
        self.require(created == {"id": row_id, **original}, "POST não preservou os campos/data.")
        self.require(headers.get("Location") == path, "Location do POST incorreto.")
        rows, _ = self.expect("GET", "/reservas", 200)
        self.require(isinstance(rows, list) and all(isinstance(row, dict)
                     and type(row.get("id")) is int for row in rows), "Lista de reservas inválida.")
        self.require([row["id"] for row in rows] == sorted(row["id"] for row in rows)
                     and rows.count(created) == 1, "Lista não contém a reserva própria em ordem por ID.")
        fetched, _ = self.expect("GET", path, 200)
        self.require(fetched == created, "GET não devolveu a reserva criada.")
        for field in original:
            self.expect("POST", "/reservas", 400, {key: value for key, value in original.items() if key != field})
        self.expect("POST", "/reservas", 400, {**original, "data": "31-02-2026"})
        updated = {**original, "data": "01-10-2026", "status": "confirmada"}
        result, _ = self.expect("PUT", path, 200, updated)
        expected = {"id": row_id, **updated}
        self.require(result == expected, "PUT não preservou ID/campos/data DD-MM-YYYY.")
        self.expect("PUT", path, 400, {"cliente": self.marker})
        result, _ = self.expect("GET", path, 200)
        self.require(result == expected, "PUT parcial alterou a reserva ou GET não refletiu atualização.")
        self.expect("DELETE", path, 204)
        self.expect("GET", path, 404)
        self.expect("DELETE", path, 404)

    def cleanup(self):
        for row_id in sorted(self.owned_ids):
            path = f"/reservas/{row_id}"
            status, row, _ = self.request("GET", path)
            if status == 404:
                self.owned_ids.remove(row_id)
                continue
            self.require(status == 200 and isinstance(row, dict) and row.get("id") == row_id
                         and row.get("cliente") == self.marker,
                         f"Limpeza não confirmou propriedade de {path}; nenhuma exclusão realizada.")
            self.expect("DELETE", path, 204)
            status, _, _ = self.request("GET", path)
            self.require(status == 404, f"Limpeza não confirmou exclusão de {path}.")
            self.owned_ids.remove(row_id)
        print("Limpeza confirmada: nenhuma reserva com ID próprio remanescente.", flush=True)


def positive_timeout(value):
    try:
        number = float(value)
    except ValueError as error:
        raise argparse.ArgumentTypeError("timeout deve ser numérico e positivo") from error
    if not math.isfinite(number) or number <= 0:
        raise argparse.ArgumentTypeError("timeout deve ser finito e positivo")
    return number


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", required=True, help="URL HTTP/HTTPS de uma API já em execução")
    parser.add_argument("--timeout", type=positive_timeout, default=5.0, help="Prazo por requisição em segundos (padrão: 5)")
    args = parser.parse_args()
    try:
        url = urlsplit(args.base_url)
        valid_url = url.scheme in ("http", "https") and url.hostname and not (
            url.username is not None or url.password is not None or url.query or url.fragment
        )
        # Forçar a validação de porta sem divulgar a URL recebida.
        url.port
    except ValueError:
        valid_url = False
    if not valid_url:
        parser.error("base-url deve ser HTTP/HTTPS, sem credenciais, query ou fragmento")
    verifier = Verifier(args.base_url, args.timeout)
    failed = False
    try:
        verifier.run()
    except (VerificationError, KeyboardInterrupt) as error:
        failed = True
        print(f"FALHOU: {error or 'execução interrompida'}. Confira o marcador caso um POST tenha resultado incerto.", file=sys.stderr)
    finally:
        try:
            verifier.cleanup()
        except (VerificationError, KeyboardInterrupt) as error:
            failed = True
            print(f"FALHOU na limpeza: {error or 'execução interrompida'}. IDs pendentes: {sorted(verifier.owned_ids)}.", file=sys.stderr)
    if failed:
        return 1
    print("PASSOU: CRUD, entradas inválidas, 404 e limpeza verificados.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
