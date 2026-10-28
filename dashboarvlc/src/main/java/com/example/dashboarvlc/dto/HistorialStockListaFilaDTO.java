package com.example.dashboarvlc.dto;

import java.time.LocalDateTime;

public record HistorialStockListaFilaDTO(
        Long idHistorialStock,
        Integer cantidad,
        String tipoMovimiento,
        LocalDateTime fechaMovimiento,
        String descripcion,
        String nombreProducto) {
}
