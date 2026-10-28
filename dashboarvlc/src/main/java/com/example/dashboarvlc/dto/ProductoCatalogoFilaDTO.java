package com.example.dashboarvlc.dto;

import java.time.LocalDate;

/** Proyección compacta para mostrar el catálogo de compra del cliente. */
public record ProductoCatalogoFilaDTO(
        Long idProducto,
        String nombre,
        String codigoProducto,
        String marca,
        Double precioVenta,
        Integer stock,
        String imagenUrl,
        Long idCategoria,
        Long idProveedor,
        Double descuento,
        LocalDate fechaInicioOferta,
        LocalDate fechaFinOferta) {
}
