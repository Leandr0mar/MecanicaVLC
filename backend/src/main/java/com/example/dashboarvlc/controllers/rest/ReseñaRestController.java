package com.example.dashboarvlc.controllers.rest;

import com.example.dashboarvlc.dto.ReseñaDTO;
import com.example.dashboarvlc.models.Reseña;
import com.example.dashboarvlc.services.impl.ReseñaServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reseñas")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequiredArgsConstructor
public class ReseñaRestController {

    private final ReseñaServiceImpl reseñaService;

    @PostMapping
    public ResponseEntity<?> crearReseña(@RequestBody ReseñaDTO dto, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Debes iniciar sesión"));
        }
        
        try {
            reseñaService.crearReseña(dto, principal.getName());
            return ResponseEntity.ok(Map.of("mensaje", "Reseña guardada con éxito"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/mis-reseñas")
    public ResponseEntity<List<Reseña>> listarMisReseñas(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(reseñaService.listarMisReseñas(principal.getName()));
    }
}