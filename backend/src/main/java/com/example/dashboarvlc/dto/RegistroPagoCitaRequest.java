package com.example.dashboarvlc.dto;

import com.example.dashboarvlc.models.enums.MetodoPago;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class RegistroPagoCitaRequest {
    @NotNull(message = "Indica el monto cobrado")
    @PositiveOrZero(message = "El monto cobrado no puede ser negativo")
    private Double montoPagado;

    @NotNull(message = "Selecciona el método de pago")
    private MetodoPago metodoPago;
}
