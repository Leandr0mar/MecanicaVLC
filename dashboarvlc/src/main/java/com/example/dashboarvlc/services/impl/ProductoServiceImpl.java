package com.example.dashboarvlc.services.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dashboarvlc.models.HistorialStock;
import com.example.dashboarvlc.models.Producto;
import com.example.dashboarvlc.repositories.HistorialStockRepository;
import com.example.dashboarvlc.repositories.ProductoRepository;
import com.example.dashboarvlc.services.ProductoService;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoServiceImpl implements ProductoService {
    @Autowired private ProductoRepository productoRepository;
    @Autowired private HistorialStockRepository historialStockRepository;

    @Override @Transactional(readOnly = true) public List<Producto> listarTodos() { return productoRepository.findAll(); }
    @Override @Transactional(readOnly = true) public Optional<Producto> buscarPorId(Long id) { return productoRepository.findById(id); }
    @Override @Transactional public Producto guardar(Producto p) { return productoRepository.save(p); }
    @Override @Transactional public Producto actualizarStock(Long id, Integer nuevoStock, String motivo) {
        return productoRepository.findById(id).map(p -> {
            int diff = nuevoStock - p.getStock();
            p.setStock(nuevoStock);
            Producto actualizado = productoRepository.save(p);

            HistorialStock hist = new HistorialStock();
            hist.setCantidad(Math.abs(diff));
            hist.setTipoMovimiento(diff >= 0 ? "ENTRADA" : "SALIDA");
            hist.setDescripcion(motivo);
            hist.setProducto(actualizado);
            historialStockRepository.save(hist);

            return actualizado;
        }).orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }
    @Override @Transactional public void eliminar(Long id) { productoRepository.deleteById(id); }
}