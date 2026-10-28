package com.example.dashboarvlc.dto;

import com.example.dashboarvlc.models.enums.EstadoCita;
import com.example.dashboarvlc.models.enums.MetodoPago;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/** Campos planos requeridos para una fila de la gestión administrativa de citas. */
public record CitaListaFilaDTO(
        Long idCita,
        LocalDate fecha,
        LocalTime hora,
        EstadoCita estado,
        Double montoInicial,
        Boolean pagoRegistrado,
        Double montoPagado,
        MetodoPago metodoPago,
        LocalDateTime fechaPago,
        String nombreCliente,
        String apellidoCliente,
        String telefonoCliente,
        Long idTrabajador,
        String nombreTrabajador,
        String apellidoTrabajador,
        String nombreServicio) {
}
