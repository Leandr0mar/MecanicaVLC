package com.example.dashboarvlc.services;

import java.util.List;
import java.util.Optional;

import com.example.dashboarvlc.models.OrdenCompra;
import com.example.dashboarvlc.models.enums.EstadoRecojo;

public interface OrdenCompraService {
    List<OrdenCompra> listarTodas();
    Optional<OrdenCompra> buscarPorId(Long id);
    OrdenCompra guardar(OrdenCompra orden);
    OrdenCompra cambiarEstadoRecojo(Long id, EstadoRecojo nuevoEstado);
}