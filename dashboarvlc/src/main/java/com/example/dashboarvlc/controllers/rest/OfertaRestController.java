package com.example.dashboarvlc.controllers.rest;

import com.example.dashboarvlc.models.Oferta;
import com.example.dashboarvlc.services.OfertaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ofertas")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true") // <-- Permiso React
@RequiredArgsConstructor
public class OfertaRestController {

    private final OfertaService ofertaService;

    @GetMapping
    public ResponseEntity<List<Oferta>> listarTodas() {
        return ResponseEntity.ok(ofertaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Oferta> buscarPorId(@PathVariable Long id) {
        return ofertaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping 
    public ResponseEntity<Oferta> crear(@Valid @RequestBody Oferta oferta) {
        return new ResponseEntity<>(ofertaService.guardar(oferta), HttpStatus.CREATED);
    }

    @PutMapping("/{id}") 
    public ResponseEntity<Oferta> actualizar(@PathVariable Long id, @Valid @RequestBody Oferta oferta) {
        try {
            oferta.setIdOferta(id);
            return ResponseEntity.ok(ofertaService.guardar(oferta));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}") 
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        ofertaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}