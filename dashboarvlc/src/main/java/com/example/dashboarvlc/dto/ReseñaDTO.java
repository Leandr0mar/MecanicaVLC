package com.example.dashboarvlc.dto;

import lombok.Data;

@Data
public class ReseñaDTO {
    private Long idCita;
    private Integer calificacion;
    private String comentario;
}