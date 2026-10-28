package com.example.dashboarvlc.dto;

/** Proyección plana de una línea del pedido, consultada para una página completa. */
public record ItemPedidoListaFilaDTO(
        Long idReserva,
        Long idItemComprado,
        Integer cantidad,
        Double precioUnitarioHistorial,
        String nombreProducto) {
}
