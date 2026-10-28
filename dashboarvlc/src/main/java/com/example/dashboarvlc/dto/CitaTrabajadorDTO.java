package com.example.dashboarvlc.dto;

import com.example.dashboarvlc.models.enums.EstadoCita;
import com.example.dashboarvlc.models.enums.MetodoPago;
import java.time.LocalDate;
import java.time.LocalTime;

/** Respuesta compacta compatible con la estructura que consume GestionarCitas. */
public record CitaTrabajadorDTO(
        Long idCita,
        LocalDate fecha,
        LocalTime hora,
        EstadoCita estado,
        String observaciones,
        Double montoInicial,
        Double montoPagado,
        MetodoPago metodoPago,
        Boolean pagoRegistrado,
        Cliente cliente,
        Servicio servicio) {

    public record Cliente(String nombre, String apellido, String telefono, String email, String placaMototaxi) {}
    public record Servicio(String nombreServicio) {}
}
