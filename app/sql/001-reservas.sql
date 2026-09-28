-- Bootstrap idempotente. Alterações futuras exigem uma migração própria.
CREATE TABLE IF NOT EXISTS public.reservas (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cliente VARCHAR(120) NOT NULL,
    data DATE NOT NULL,
    status VARCHAR(10) NOT NULL,
    CONSTRAINT reservas_cliente_nao_vazio CHECK (length(btrim(cliente)) > 0),
    CONSTRAINT reservas_status_valido
        CHECK (status IN ('pendente', 'confirmada', 'cancelada'))
);
