package com.example.dashboarvlc.services.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor; // Usamos lombok para inyectar más limpio

import com.example.dashboarvlc.models.*;
import com.example.dashboarvlc.models.enums.EstadoRecojo;
import com.example.dashboarvlc.repositories.*;
import com.example.dashboarvlc.services.HistorialStockService;
import com.example.dashboarvlc.services.OrdenCompraService;
import com.example.dashboarvlc.dto.OrdenCompraDTO;
import com.example.dashboarvlc.dto.ItemCompraDTO;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrdenCompraServiceImpl implements OrdenCompraService {
    
    private final OrdenCompraRepository ordenCompraRepository;
    private final ProductoRepository productoRepository;
    private final ClienteRepository clienteRepository;
    private final TrabajadorRepository trabajadorRepository;
    private final ItemsCompradosRepository itemsCompradosRepository;
    private final HistorialStockService historialStockService;

    @Override @Transactional(readOnly = true) public List<OrdenCompra> listarTodas() { return ordenCompraRepository.findAll(); }
    @Override @Transactional(readOnly = true) public Optional<OrdenCompra> buscarPorId(Long id) { return ordenCompraRepository.findById(id); }
    @Override @Transactional public OrdenCompra guardar(OrdenCompra o) { return ordenCompraRepository.save(o); }
    
    @Override 
    @Transactional 
    public OrdenCompra cambiarEstadoRecojo(Long id, EstadoRecojo nuevoEstado) {
        OrdenCompra orden = ordenCompraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        // Evitar procesar si ya se encuentra en ese estado
        if (orden.getEstadoRecojo() == nuevoEstado) {
            return orden;
        }

        // LÓGICA DE CANCELACIÓN: Devolver stock e historial
        if (nuevoEstado == EstadoRecojo.CANCELADO && orden.getEstadoRecojo() != EstadoRecojo.CANCELADO) {
            for (ItemsComprados item : orden.getItems()) {
                Producto producto = item.getProducto();
                
                // 1. Restaurar el stock
                producto.setStock(producto.getStock() + item.getCantidad());
                productoRepository.save(producto);

                // 2. Registrar el movimiento de devolución
                HistorialStock historial = new HistorialStock();
                historial.setCantidad(item.getCantidad());
                historial.setTipoMovimiento("ENTRADA");
                historial.setDescripcion("Anulación de Orden #" + orden.getIdReserva());
                historial.setProducto(producto);
                historialStockService.guardar(historial);
            }
        }

        // Aplicar el nuevo estado
        orden.setEstadoRecojo(nuevoEstado);
        
        // Si se recoge la compra, se marca la fecha de pago real
        if (nuevoEstado == EstadoRecojo.RECOGIDO) {
            orden.setFechaPago(java.time.LocalDateTime.now());
        }

        return ordenCompraRepository.save(orden);
    }

    // --- LÓGICA CORE DE COMPRAS ---
    @Override
    @Transactional
    public OrdenCompra procesarCompra(OrdenCompraDTO dto, String emailUsuarioLogueado) {
        // 1. Identificar al Cliente (Si el logueado no es cliente, buscamos uno por defecto o lanzamos error)
        Cliente cliente = clienteRepository.findByEmail(emailUsuarioLogueado)
                .orElseGet(() -> clienteRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No hay clientes en la base de datos para asignar la orden")));

        // 2. Asignar un trabajador por defecto (el primero disponible)
        Trabajador trabajador = trabajadorRepository.findByDisponibilidadTrue().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No hay personal disponible para gestionar la orden"));

        // 3. Crear cabecera de la Orden
        OrdenCompra orden = new OrdenCompra();
        orden.setFechaReserva(LocalDate.now());
        orden.setEstadoRecojo(EstadoRecojo.PENDIENTE);
        orden.setCliente(cliente);
        orden.setTrabajador(trabajador);
        orden.setMontoTotal(0.0); // Se actualiza más abajo
        OrdenCompra ordenGuardada = ordenCompraRepository.save(orden);

        double totalCalculado = 0.0;

        // 4. Procesar los productos seleccionados
        for (ItemCompraDTO itemDto : dto.getItems()) {
            Producto producto = productoRepository.findById(itemDto.getIdProducto())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            if (producto.getStock() < itemDto.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para: " + producto.getNombre());
            }

            // Descontar stock
            producto.setStock(producto.getStock() - itemDto.getCantidad());
            productoRepository.save(producto);

            // Registrar movimiento en el historial
            HistorialStock historial = new HistorialStock();
            historial.setCantidad(itemDto.getCantidad());
            historial.setTipoMovimiento("SALIDA");
            historial.setDescripcion("Venta de repuestos web (Orden #" + ordenGuardada.getIdReserva() + ")");
            historial.setProducto(producto);
            historialStockService.guardar(historial);

            // Calcular precio aplicando oferta (si está activa)
            double precioAplicar = producto.getPrecioVenta();
            if (producto.getOferta() != null && producto.getOferta().estado()) {
                double descuento = producto.getOferta().getDescuento() / 100.0;
                precioAplicar = producto.getPrecioVenta() - (producto.getPrecioVenta() * descuento);
            }

            totalCalculado += precioAplicar * itemDto.getCantidad();

            // Guardar el Item de la compra
            ItemsComprados itemComprado = new ItemsComprados();
            itemComprado.setCantidad(itemDto.getCantidad());
            itemComprado.setPrecioUnitarioHistorial(precioAplicar); // Se congela el precio
            itemComprado.setProducto(producto);
            itemComprado.setOrdenCompra(ordenGuardada);
            itemsCompradosRepository.save(itemComprado);
        }

        // 5. Actualizar y retornar orden con el total real
        ordenGuardada.setMontoTotal(totalCalculado);
        return ordenCompraRepository.save(ordenGuardada);
    }

   @Override
   @Transactional(readOnly = true)
    public List<OrdenCompra> listarMisOrdenes(String emailCliente) {
        return ordenCompraRepository.findAll().stream()
                .filter(o -> o.getCliente() != null && o.getCliente().getEmail().equals(emailCliente))
                .toList();
    } 
}