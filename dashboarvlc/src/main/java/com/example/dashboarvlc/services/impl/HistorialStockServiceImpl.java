package com.example.dashboarvlc.services.impl;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dashboarvlc.models.HistorialStock;
import com.example.dashboarvlc.repositories.HistorialStockRepository;
import com.example.dashboarvlc.services.HistorialStockService;

import java.util.List;

@Service
public class HistorialStockServiceImpl implements HistorialStockService {
    @Autowired private HistorialStockRepository historialStockRepository;

    @Override @Transactional(readOnly = true) public List<HistorialStock> listarPorProducto(Long idProducto) {
        return historialStockRepository.findAll().stream()
                .filter(h -> h.getProducto().getIdProducto().equals(idProducto)).toList();
    }
}