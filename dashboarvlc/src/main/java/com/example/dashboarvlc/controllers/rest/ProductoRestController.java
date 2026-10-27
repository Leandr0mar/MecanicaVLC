package com.example.dashboarvlc.controllers.rest;

import com.example.dashboarvlc.models.Producto;
import com.example.dashboarvlc.services.ProductoService;
import com.example.dashboarvlc.repositories.ProductoRepository;
import com.example.dashboarvlc.dto.PaginaRespuesta;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true") // Permiso para React
@RequiredArgsConstructor
public class ProductoRestController {

    private final ProductoService productoService;
    private final ProductoRepository productoRepository;

    @GetMapping("/pagina")
    public ResponseEntity<PaginaRespuesta<Producto>> listarPagina(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamano,
            @RequestParam(defaultValue = "") String q,
            @RequestParam(required = false) Long categoria,
            @RequestParam(defaultValue = "") String marca,
            @RequestParam(required = false) Long proveedor,
            @RequestParam(defaultValue = "") String stock) {
        int paginaSegura = Math.max(0, pagina);
        int tamanoSeguro = Math.max(1, Math.min(tamano, 100));
        return ResponseEntity.ok(PaginaRespuesta.desde(productoRepository.buscarPagina(
                q.trim(), categoria, marca.trim(), proveedor, stock, PageRequest.of(paginaSegura, tamanoSeguro,
                        Sort.by(Sort.Direction.ASC, "nombre")))));
    }

    @GetMapping("/marcas")
    public ResponseEntity<List<String>> listarMarcas() {
        return ResponseEntity.ok(productoRepository.listarMarcas());
    }

    @GetMapping
    public ResponseEntity<List<Producto>> listarTodos() {
        return ResponseEntity.ok(productoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> buscarPorId(@PathVariable Long id) {
        return productoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Producto> crearProducto(@Valid @RequestBody Producto producto) {
        return new ResponseEntity<>(productoService.guardar(producto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarProducto(@PathVariable Long id, @Valid @RequestBody Producto producto) {
        try {
            producto.setIdProducto(id);
            return ResponseEntity.ok(productoService.guardar(producto));
        } catch (Exception e) {
            // Imprime el error real en tu consola del backend
            e.printStackTrace(); 
            // Devuelve un error 500 con el mensaje para que sepas qué falló
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno al actualizar: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<Producto> actualizarStock(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Integer nuevoStock = (Integer) body.get("nuevoStock");
            String motivo = (String) body.get("motivo");
            return ResponseEntity.ok(productoService.actualizarStock(id, nuevoStock, motivo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
