package com.example.dashboarvlc.controllers.rest;

import com.example.dashboarvlc.models.Cita;
import com.example.dashboarvlc.models.enums.EstadoCita;
import com.example.dashboarvlc.dto.RegistroPagoCitaRequest;
import com.example.dashboarvlc.services.CitaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import java.security.Principal;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true") // <-- Permiso a React
@RequiredArgsConstructor
public class CitaRestController {

    private final CitaService citaService;

    @GetMapping
    public ResponseEntity<List<Cita>> listarTodas() {
        return ResponseEntity.ok(citaService.listarTodas());
    }

    // NUEVO: Devuelve solo las citas del cliente logueado
    @GetMapping("/mis-citas")
    public ResponseEntity<List<Cita>> listarMisCitas(Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(citaService.listarPorCliente(principal.getName()));
    }

    // NUEVO: Motor de búsqueda de horas libres
    @GetMapping("/disponibilidad")
    public ResponseEntity<?> horariosDisponibles(@RequestParam String fecha, @RequestParam Long idServicio) {
        try {
            return ResponseEntity.ok(citaService.obtenerHorariosDisponibles(LocalDate.parse(fecha), idServicio));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cita> buscarPorId(@PathVariable Long id) {
        return citaService.buscarPorId(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> crearCita(@Valid @RequestBody Cita cita, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Debes iniciar sesión");
        
        try {
            Cita nuevaCita = citaService.guardar(cita, principal.getName());
            return new ResponseEntity<>(nuevaCita, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) {
        try {
            EstadoCita nuevoEstado = EstadoCita.valueOf(body.get("estado").toUpperCase());
            return ResponseEntity.ok(citaService.cambiarEstado(
                id, nuevoEstado, auth.getName(), tieneRol(auth, "ADMIN"), tieneRol(auth, "TRABAJADOR"), tieneRol(auth, "CLIENTE")
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage() == null ? "No se pudo actualizar la cita" : e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            citaService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/trabajador")
    public ResponseEntity<?> reasignarTrabajador(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        try {
            Long idTrabajador = body.get("idTrabajador");
            return ResponseEntity.ok(citaService.reasignarTrabajador(id, idTrabajador));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al reasignar trabajador: " + e.getMessage());
        }
    }

    // NUEVO: Devuelve solo las citas asignadas al TRABAJADOR logueado
    @GetMapping("/mis-tareas")
    public ResponseEntity<List<Cita>> listarMisTareas(java.security.Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        // Filtramos todas las citas para quedarnos solo con las de este trabajador
        List<Cita> tareas = citaService.listarTodas().stream()
                .filter(c -> c.getTrabajador() != null && c.getTrabajador().getEmail().equals(principal.getName()))
                .toList();
        return ResponseEntity.ok(tareas);
    }

@PatchMapping("/{id}/observaciones")
    public ResponseEntity<?> guardarObservacion(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) {
        try {
            String observacion = body.get("observacion");
            
            // Ejecutamos el guardado en la base de datos
            citaService.agregarObservacion(id, observacion, auth.getName(), tieneRol(auth, "ADMIN"));
            
            // Retornamos un JSON simple para evitar errores de serialización (Lazy Loading)
            return ResponseEntity.ok(Map.of("mensaje", "Observación guardada correctamente"));
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            // Imprime el error exacto en la consola de Spring Boot si algo falla internamente
            e.printStackTrace(); 
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/pago")
    public ResponseEntity<?> registrarPago(@PathVariable Long id, @Valid @RequestBody RegistroPagoCitaRequest pago, Authentication auth) {
        try {
            boolean administrador = tieneRol(auth, "ADMIN");
            Cita cita = citaService.registrarPago(id, pago, administrador);
            return ResponseEntity.ok(cita);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private boolean tieneRol(Authentication auth, String rol) {
        return auth.getAuthorities().stream().anyMatch(authority -> authority.getAuthority().equals("ROLE_" + rol));
    }

}
