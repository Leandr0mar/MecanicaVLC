package com.example.dashboarvlc.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.stereotype.Component;

import java.util.Locale;

/** Mantiene la restricción creada por versiones anteriores alineada con MetodoPago. */
@Component
@RequiredArgsConstructor
public class MetodoPagoSchemaMigration implements ApplicationRunner {
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        String database = jdbcTemplate.execute((ConnectionCallback<String>) connection ->
                connection.getMetaData().getDatabaseProductName());
        if (database == null || !database.toLowerCase(Locale.ROOT).contains("postgresql")) {
            return;
        }

        String definicion = jdbcTemplate.query(
                "select pg_get_constraintdef(oid) from pg_constraint " +
                        "where conrelid = 'citas'::regclass and conname = 'citas_metodo_pago_check'",
                resultSet -> resultSet.next() ? resultSet.getString(1) : null);
        String definicionNormalizada = definicion == null ? "" : definicion.toUpperCase(Locale.ROOT);
        if (definicionNormalizada.contains("YAPE") && definicionNormalizada.contains("PLIN")) {
            return;
        }

        jdbcTemplate.execute("alter table citas drop constraint if exists citas_metodo_pago_check");
        jdbcTemplate.execute("alter table citas add constraint citas_metodo_pago_check " +
                "check (metodo_pago is null or metodo_pago in " +
                "('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'BILLETERA_DIGITAL', 'YAPE', 'PLIN', 'OTRO'))");
    }
}
