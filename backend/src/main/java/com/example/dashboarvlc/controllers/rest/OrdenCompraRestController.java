package com.example.dashboarvlc.controllers.rest;

import com.example.dashboarvlc.models.OrdenCompra;
import com.example.dashboarvlc.models.enums.EstadoRecojo;
import com.example.dashboarvlc.dto.OrdenCompraDTO;
import com.example.dashboarvlc.services.OrdenCompraService;
import com.example.dashboarvlc.repositories.OrdenCompraRepository;
import com.example.dashboarvlc.dto.PaginaRespuesta;
import com.example.dashboarvlc.dto.ItemPedidoListaFilaDTO;
import com.example.dashboarvlc.dto.OrdenCompraListaDTO;
import com.example.dashboarvlc.dto.OrdenCompraListaFilaDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.PageRequest;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ordenes")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequiredArgsConstructor
public class OrdenCompraRestController {

    private final OrdenCompraService ordenCompraService;
    private final OrdenCompraRepository ordenCompraRepository;

    @GetMapping("/pagina")
    public ResponseEntity<PaginaRespuesta<OrdenCompraListaDTO>> listarPagina(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamano,
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "") String estado) {
        int paginaSegura = Math.max(0, pagina);
        int tamanoSeguro = Math.max(1, Math.min(tamano, 100));
        var paginaPedidos = ordenCompraRepository.buscarPaginaResumen(
                q.trim(), estado.trim(), PageRequest.of(paginaSegura, tamanoSeguro,
                        org.springframework.data.domain.Sort.unsorted()));

        List<Long> idsPedidos = paginaPedidos.getContent().stream()
                .map(OrdenCompraListaFilaDTO::idReserva)
                .toList();
        Map<Long, List<OrdenCompraListaDTO.Item>> itemsPorPedido = idsPedidos.isEmpty()
                ? Map.of()
                : ordenCompraRepository.buscarItemsParaPedidos(idsPedidos).stream()
                        .collect(Collectors.groupingBy(
                                ItemPedidoListaFilaDTO::idReserva,
                                Collectors.mapping(item -> new OrdenCompraListaDTO.Item(
                                        item.idItemComprado(), item.cantidad(), item.precioUnitarioHistorial(),
                                        new OrdenCompraListaDTO.Producto(item.nombreProducto())),
                                        Collectors.toList())));

        List<OrdenCompraListaDTO> contenido = paginaPedidos.getContent().stream()
                .map(pedido -> new OrdenCompraListaDTO(
                        pedido.idReserva(), pedido.fechaReserva(), pedido.montoTotal(), pedido.estadoRecojo(),
                        new OrdenCompraListaDTO.Cliente(
                                pedido.nombreCliente(), pedido.apellidoCliente(), pedido.telefonoCliente()),
                        itemsPorPedido.getOrDefault(pedido.idReserva(), List.of())))
                .toList();

        return ResponseEntity.ok(new PaginaRespuesta<>(contenido, paginaPedidos.getNumber(),
                paginaPedidos.getSize(), paginaPedidos.getTotalElements(), paginaPedidos.getTotalPages()));
    }

    @GetMapping
    public ResponseEntity<List<OrdenCompra>> listarTodas() {
        return ResponseEntity.ok(ordenCompraService.listarTodas());
    }

    @PostMapping
    public ResponseEntity<?> crearOrden(@RequestBody OrdenCompraDTO request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Debes iniciar sesión");
        }
        
        try {
            OrdenCompra nuevaOrden = ordenCompraService.procesarCompra(request, principal.getName());
            return new ResponseEntity<>(nuevaOrden, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            // Devuelve error 400 si falta stock o hay algún problema de negocio
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error interno del servidor");
        }
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            // Convierte el texto "RECOGIDO" o "CANCELADO" al Enum correspondiente
            EstadoRecojo nuevoEstado = EstadoRecojo.valueOf(body.get("estado").toUpperCase());
            ordenCompraService.cambiarEstadoRecojo(id, nuevoEstado);
            
            return ResponseEntity.ok(Map.of("mensaje", "Estado del pedido actualizado exitosamente"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno al procesar el estado"));
        }
    }

    @GetMapping("/mis-pedidos")
    public ResponseEntity<List<OrdenCompra>> listarMisPedidos(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(ordenCompraService.listarMisOrdenes(principal.getName()));
    }
}
