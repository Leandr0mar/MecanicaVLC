package com.example.dashboarvlc.dto;

import com.example.dashboarvlc.models.enums.MetodoPago;
import jakarta.validation.constraints.NotNull;
public record RegistroPagoPedidoRequest(@NotNull(message = "Selecciona el método de pago") MetodoPago metodoPago) {}
