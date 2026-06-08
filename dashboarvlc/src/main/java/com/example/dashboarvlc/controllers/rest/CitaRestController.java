package com.example.dashboarvlc.controllers.rest;

import com.example.dashboarvlc.models.Cita;
import com.example.dashboarvlc.models.enums.EstadoCita;
import com.example.dashboarvlc.services.CitaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/citas")
public class CitaRestController {

    @Autowired
    private CitaService citaService;

    // 1. Listar todas (Admin las ve todas, los Trabajadores su agenda)
    @GetMapping
    public ResponseEntity<List<Cita>> listarTodas() {
        return ResponseEntity.ok(citaService.listarTodas());
    }

    // 2. Buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<Cita> buscarPorId(@PathVariable Long id) {
        return citaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Crear Cita (Usado por el Cliente desde su portal)
    @PostMapping
    public ResponseEntity<Cita> crearCita(@Valid @RequestBody Cita cita) {
        Cita nuevaCita = citaService.guardar(cita);
        return new ResponseEntity<>(nuevaCita, HttpStatus.CREATED);
    }

    // 4. Cambiar Estado (PATCH es ideal para actualizaciones parciales)
    // El Trabajador lo cambia a EN_PROGRESO/COMPLETADA. El Admin o Cliente a CANCELADA.
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Cita> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            EstadoCita nuevoEstado = EstadoCita.valueOf(body.get("estado").toUpperCase());
            Cita citaActualizada = citaService.cambiarEstado(id, nuevoEstado);
            return ResponseEntity.ok(citaActualizada);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 5. Eliminar (Solo permitido para el Administrador)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            citaService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}