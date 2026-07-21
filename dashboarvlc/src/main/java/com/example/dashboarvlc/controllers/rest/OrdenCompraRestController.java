package com.example.dashboarvlc.controllers.rest;

import com.example.dashboarvlc.models.OrdenCompra;
import com.example.dashboarvlc.models.enums.EstadoRecojo;
import com.example.dashboarvlc.dto.OrdenCompraDTO;
import com.example.dashboarvlc.services.OrdenCompraService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ordenes")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequiredArgsConstructor
public class OrdenCompraRestController {

    private final OrdenCompraService ordenCompraService;

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