package com.example.dashboarvlc.services.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import com.example.dashboarvlc.models.Producto;
import com.example.dashboarvlc.repositories.ProductoRepository;
import com.example.dashboarvlc.services.ProductoService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {
    
    private final ProductoRepository productoRepository;

    @Override @Transactional(readOnly = true) public List<Producto> listarTodos() { return productoRepository.findAll(); }
    @Override @Transactional(readOnly = true) public Optional<Producto> buscarPorId(Long id) { return productoRepository.findById(id); }
    
    @Override @Transactional public Producto guardar(Producto producto) { 
        return productoRepository.save(producto); 
    }
    
    @Override @Transactional public Producto actualizarStock(Long id, Integer nuevoStock, String motivo) {
        // La lógica del historial la conectaremos después, por ahora solo actualizamos
        return productoRepository.findById(id).map(prod -> {
            prod.setStock(nuevoStock);
            return productoRepository.save(prod);
        }).orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }
    
    @Override @Transactional public void eliminar(Long id) { productoRepository.deleteById(id); }
}