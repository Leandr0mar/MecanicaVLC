package com.example.dashboarvlc.services.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import com.example.dashboarvlc.models.HistorialStock;
import com.example.dashboarvlc.models.Producto;
import com.example.dashboarvlc.repositories.ProductoRepository;
import com.example.dashboarvlc.services.HistorialStockService;
import com.example.dashboarvlc.services.ProductoService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {
    
    private final ProductoRepository productoRepository;

    private final HistorialStockService historialStockService;

    @Override @Transactional(readOnly = true) public List<Producto> listarTodos() { return productoRepository.findAll(); }
    @Override @Transactional(readOnly = true) public Optional<Producto> buscarPorId(Long id) { return productoRepository.findById(id); }
    
    @Override
    @Transactional // Importante para que producto e historial se guarden juntos
    public Producto guardar(Producto producto) {
        // ESCENARIO A: Es un producto NUEVO (no tiene ID todavía)
        if (producto.getIdProducto() == null) {
            Producto productoGuardado = productoRepository.save(producto);
            
            // Si lo crearon con stock inicial mayor a 0, registramos la entrada
            if (productoGuardado.getStock() != null && productoGuardado.getStock() > 0) {
                HistorialStock historial = new HistorialStock();
                historial.setCantidad(productoGuardado.getStock());
                historial.setTipoMovimiento("ENTRADA");
                historial.setDescripcion("Stock inicial al registrar nuevo producto");
                historial.setProducto(productoGuardado);
                
                // Llamamos a tu método guardar() del HistorialStockServiceImpl
                historialStockService.guardar(historial); 
            }
            return productoGuardado;
        }

       // ESCENARIO B: Se está EDITANDO un producto existente
        Producto productoAnterior = productoRepository.findById(producto.getIdProducto())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // Protegemos contra posibles valores null en la base de datos (Evita NullPointerException)
        int stockNuevo = producto.getStock() != null ? producto.getStock() : 0;
        int stockViejo = productoAnterior.getStock() != null ? productoAnterior.getStock() : 0;
        
        int diferenciaStock = stockNuevo - stockViejo;
        
        Producto productoActualizado = productoRepository.save(producto);

        // Solo creamos historial si realmente modificaron el número de stock en el modal
        if (diferenciaStock != 0) {
            HistorialStock historial = new HistorialStock();
            historial.setCantidad(Math.abs(diferenciaStock)); // Siempre positivo
            historial.setTipoMovimiento(diferenciaStock > 0 ? "ENTRADA" : "SALIDA");
            historial.setDescripcion("Actualización desde edición de producto");
            historial.setProducto(productoActualizado);
            
            // Llamamos a tu método guardar() del HistorialStockServiceImpl
            historialStockService.guardar(historial); 
        }

        return productoActualizado;
    }

    // Tu método específico para el endpoint PATCH (si decides usarlo más adelante)
    @Override
    @Transactional
    public Producto actualizarStock(Long id, Integer nuevoStock, String motivo) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        int diferencia = nuevoStock - producto.getStock();

        if (diferencia != 0) {
            producto.setStock(nuevoStock);
            Producto productoActualizado = productoRepository.save(producto);

            HistorialStock historial = new HistorialStock();
            historial.setCantidad(Math.abs(diferencia));
            historial.setTipoMovimiento(diferencia > 0 ? "ENTRADA" : "SALIDA");
            historial.setDescripcion(motivo);
            historial.setProducto(productoActualizado);
            
            historialStockService.guardar(historial);

            return productoActualizado;
        }

        return producto;
    }

    @Override
    public void eliminar(Long id) {
        productoRepository.deleteById(id);
    }
}