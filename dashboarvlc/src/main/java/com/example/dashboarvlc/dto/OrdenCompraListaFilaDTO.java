package com.example.dashboarvlc.dto;

import com.example.dashboarvlc.models.enums.EstadoRecojo;
import com.example.dashboarvlc.models.enums.MetodoPago;
import java.time.LocalDate;

/** Proyección plana de los campos que necesita cada fila del listado administrativo. */
public record OrdenCompraListaFilaDTO(
        Long idReserva,
        LocalDate fechaReserva,
        Double montoTotal,
        EstadoRecojo estadoRecojo,
        Boolean pagoRegistrado,
        Double montoPagado,
        MetodoPago metodoPago,
        java.time.LocalDateTime fechaPago,
        String nombreCliente,
        String apellidoCliente,
        String telefonoCliente) {
}
