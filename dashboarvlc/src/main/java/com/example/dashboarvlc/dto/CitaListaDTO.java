package com.example.dashboarvlc.dto;

import com.example.dashboarvlc.models.enums.EstadoCita;
import com.example.dashboarvlc.models.enums.MetodoPago;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/** Respuesta ligera que conserva la estructura JSON usada por GestionCitas. */
public record CitaListaDTO(
        Long idCita,
        LocalDate fecha,
        LocalTime hora,
        EstadoCita estado,
        Double montoInicial,
        Boolean pagoRegistrado,
        Double montoPagado,
        MetodoPago metodoPago,
        LocalDateTime fechaPago,
        Cliente cliente,
        Trabajador trabajador,
        Servicio servicio) {

    public record Cliente(String nombre, String apellido, String telefono) {}
    public record Trabajador(Long idUsuario, String nombre, String apellido) {}
    public record Servicio(String nombreServicio) {}
}
