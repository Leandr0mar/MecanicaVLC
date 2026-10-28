package com.example.dashboarvlc.dto;

public record ProductoCatalogoDTO(
        Long idProducto,
        String nombre,
        String codigoProducto,
        String marca,
        Double precioVenta,
        Double precioFinal,
        Integer stock,
        String imagenUrl,
        Categoria categoria,
        Proveedor proveedor,
        Oferta oferta) {

    public record Categoria(Long idCategoria) {}
    public record Proveedor(Long idProveedor) {}
    public record Oferta(Double descuento) {}
}
