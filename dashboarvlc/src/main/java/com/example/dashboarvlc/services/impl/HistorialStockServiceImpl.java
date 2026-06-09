package com.example.dashboarvlc.services.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Sort;
import lombok.RequiredArgsConstructor;

import com.example.dashboarvlc.models.HistorialStock;
import com.example.dashboarvlc.repositories.HistorialStockRepository;
import com.example.dashboarvlc.services.HistorialStockService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HistorialStockServiceImpl implements HistorialStockService {
    
    private final HistorialStockRepository historialStockRepository;

    @Override 
    @Transactional(readOnly = true) 
    public List<HistorialStock> listarTodos() {
        // Ordenamos para que los movimientos más recientes salgan primero
        return historialStockRepository.findAll(Sort.by(Sort.Direction.DESC, "fechaMovimiento"));
    }

    @Override 
    @Transactional(readOnly = true) 
    public List<HistorialStock> listarPorProducto(Long idProducto) {
        return historialStockRepository.findAll().stream()
                .filter(h -> h.getProducto().getIdProducto().equals(idProducto)).toList();
    }

    @Override 
    @Transactional 
    public HistorialStock guardar(HistorialStock historialStock) {
        return historialStockRepository.save(historialStock);
    }
}