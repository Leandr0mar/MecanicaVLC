package com.example.dashboarvlc.controllers.rest;

import com.example.dashboarvlc.models.Proveedor;
import com.example.dashboarvlc.dto.ProveedorListaDTO;
import com.example.dashboarvlc.repositories.ProveedorRepository;
import com.example.dashboarvlc.services.ProveedorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequiredArgsConstructor
public class ProveedorRestController {

    private final ProveedorService proveedorService;
    private final ProveedorRepository proveedorRepository;

    @GetMapping
    public ResponseEntity<List<ProveedorListaDTO>> listarTodos() {
        return ResponseEntity.ok(proveedorRepository.listarResumen());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Proveedor> buscarPorId(@PathVariable Long id) {
        return proveedorService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Proveedor> crear(@Valid @RequestBody Proveedor proveedor) {
        return new ResponseEntity<>(proveedorService.guardar(proveedor), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Proveedor> actualizar(@PathVariable Long id, @Valid @RequestBody Proveedor proveedor) {
        try {
            proveedor.setIdProveedor(id);
            return ResponseEntity.ok(proveedorService.guardar(proveedor));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        proveedorService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
