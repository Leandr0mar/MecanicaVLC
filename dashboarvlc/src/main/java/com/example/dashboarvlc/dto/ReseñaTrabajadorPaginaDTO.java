package com.example.dashboarvlc.dto;

import java.util.List;

public record ReseñaTrabajadorPaginaDTO(
        List<ReseñaTrabajadorDTO> contenido,
        int pagina,
        int tamano,
        long totalElementos,
        int totalPaginas,
        double promedioCalificacion) {}
