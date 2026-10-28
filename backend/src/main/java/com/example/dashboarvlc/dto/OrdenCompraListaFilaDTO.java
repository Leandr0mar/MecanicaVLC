package com.example.dashboarvlc.dto;

import com.example.dashboarvlc.models.enums.EstadoRecojo;
import java.time.LocalDate;

/** Proyección plana de los campos que necesita cada fila del listado administrativo. */
public record OrdenCompraListaFilaDTO(
        Long idReserva,
        LocalDate fechaReserva,
        Double montoTotal,
        EstadoRecojo estadoRecojo,
        String nombreCliente,
        String apellidoCliente,
        String telefonoCliente) {
}
