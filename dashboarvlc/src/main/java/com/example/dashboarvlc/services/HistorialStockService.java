package com.example.dashboarvlc.services;

import java.util.List;

import com.example.dashboarvlc.models.HistorialStock;

public interface HistorialStockService {
    List<HistorialStock> listarPorProducto(Long idProducto);
}