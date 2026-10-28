package com.example.dashboarvlc.dto;

import com.example.dashboarvlc.models.enums.EstadoRecojo;
import java.time.LocalDate;
import java.util.List;

/** Respuesta ligera con la misma forma JSON consumida por GestionPedidos. */
public record OrdenCompraListaDTO(
        Long idReserva,
        LocalDate fechaReserva,
        Double montoTotal,
        EstadoRecojo estadoRecojo,
        Cliente cliente,
        List<Item> items) {

    public record Cliente(String nombre, String apellido, String telefono) {}
    public record Producto(String nombre) {}
    public record Item(Long idItemComprado, Integer cantidad, Double precioUnitarioHistorial, Producto producto) {}
}
