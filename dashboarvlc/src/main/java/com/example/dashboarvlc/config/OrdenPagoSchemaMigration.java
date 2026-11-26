package com.example.dashboarvlc.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Locale;

/** Adds payment receipt fields to existing PostgreSQL/Supabase order tables. */
@Component
@RequiredArgsConstructor
public class OrdenPagoSchemaMigration implements ApplicationRunner {
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        String database = jdbcTemplate.execute((ConnectionCallback<String>) connection ->
                connection.getMetaData().getDatabaseProductName());
        if (database == null || !database.toLowerCase(Locale.ROOT).contains("postgresql")) return;

        jdbcTemplate.execute("alter table ordenes_compra add column if not exists pago_registrado boolean");
        jdbcTemplate.execute("alter table ordenes_compra add column if not exists monto_pagado double precision");
        jdbcTemplate.execute("alter table ordenes_compra add column if not exists metodo_pago varchar(32)");
        jdbcTemplate.update("update ordenes_compra set pago_registrado = true, monto_pagado = coalesce(monto_pagado, monto_total), metodo_pago = coalesce(metodo_pago, 'OTRO') " +
                "where estado_recojo = 'RECOGIDO' and fecha_pago is not null and pago_registrado is not true");
        jdbcTemplate.update("update ordenes_compra set pago_registrado = false where pago_registrado is null");
        jdbcTemplate.execute("alter table ordenes_compra alter column pago_registrado set default false");
        jdbcTemplate.execute("alter table ordenes_compra alter column pago_registrado set not null");
        jdbcTemplate.execute("alter table ordenes_compra drop constraint if exists ordenes_compra_metodo_pago_check");
        jdbcTemplate.execute("alter table ordenes_compra add constraint ordenes_compra_metodo_pago_check " +
                "check (metodo_pago is null or metodo_pago in ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'BILLETERA_DIGITAL', 'YAPE', 'PLIN', 'OTRO'))");
    }
}
