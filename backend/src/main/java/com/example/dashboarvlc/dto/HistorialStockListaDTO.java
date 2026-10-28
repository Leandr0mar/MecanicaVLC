package com.example.dashboarvlc.dto;

import java.time.LocalDateTime;

public record HistorialStockListaDTO(
        Long idHistorialStock,
        Integer cantidad,
        String tipoMovimiento,
        LocalDateTime fechaMovimiento,
        String descripcion,
        Producto producto) {

    public record Producto(String nombre) {}
}
