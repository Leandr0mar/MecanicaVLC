package com.example.dashboarvlc.dto;

import java.time.LocalDate;

public record ReseñaTrabajadorDTO(
        Long idReseña,
        Integer calificacion,
        String comentario,
        LocalDate fechaReseña,
        Cita cita) {

    public record Cita(Long idCita, LocalDate fecha, Cliente cliente, Servicio servicio) {}
    public record Cliente(String nombre, String apellido, String email, String telefono) {}
    public record Servicio(String nombreServicio) {}
}
