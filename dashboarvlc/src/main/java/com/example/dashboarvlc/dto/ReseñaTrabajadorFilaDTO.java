package com.example.dashboarvlc.dto;

import java.time.LocalDate;

public record ReseñaTrabajadorFilaDTO(
        Long idReseña,
        Integer calificacion,
        String comentario,
        LocalDate fechaReseña,
        Long idCita,
        LocalDate fechaCita,
        String nombreServicio,
        String nombreCliente,
        String apellidoCliente,
        String emailCliente,
        String telefonoCliente) {}
