package com.example.dashboarvlc.controllers.rest;

import com.example.dashboarvlc.models.HistorialStock;
import com.example.dashboarvlc.services.HistorialStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/historial-stock")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequiredArgsConstructor
public class HistorialStockRestController {

    private final HistorialStockService historialStockService;

    @GetMapping
    public ResponseEntity<List<HistorialStock>> listarTodos() {
        return ResponseEntity.ok(historialStockService.listarTodos());
    }

    @GetMapping("/producto/{idProducto}")
    public ResponseEntity<List<HistorialStock>> listarPorProducto(@PathVariable Long idProducto) {
        return ResponseEntity.ok(historialStockService.listarPorProducto(idProducto));
    }
}