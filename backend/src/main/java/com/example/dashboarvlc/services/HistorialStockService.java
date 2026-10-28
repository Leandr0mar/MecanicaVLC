package com.example.dashboarvlc.services;

import java.util.List;
import com.example.dashboarvlc.models.HistorialStock;

public interface HistorialStockService {
    List<HistorialStock> listarTodos();
    List<HistorialStock> listarPorProducto(Long idProducto);
    HistorialStock guardar(HistorialStock historialStock);
}