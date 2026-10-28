package com.example.dashboarvlc.dto;

import com.example.dashboarvlc.models.enums.EstadoCita;
import com.example.dashboarvlc.models.enums.MetodoPago;
import java.time.LocalDate;
import java.time.LocalTime;

/** Proyección plana de los datos que la agenda del trabajador muestra. */
public record CitaTrabajadorFilaDTO(
        Long idCita,
        LocalDate fecha,
        LocalTime hora,
        EstadoCita estado,
        String observaciones,
        Double montoInicial,
        Double montoPagado,
        MetodoPago metodoPago,
        Boolean pagoRegistrado,
        String nombreCliente,
        String apellidoCliente,
        String telefonoCliente,
        String emailCliente,
        String placaMototaxi,
        String nombreServicio) {
}
