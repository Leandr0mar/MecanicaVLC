package com.example.dashboarvlc.controllers.rest;

import com.example.dashboarvlc.models.HistorialStock;
import com.example.dashboarvlc.services.HistorialStockService;
import com.example.dashboarvlc.repositories.HistorialStockRepository;
import com.example.dashboarvlc.dto.PaginaRespuesta;
import com.example.dashboarvlc.dto.HistorialStockListaDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/historial-stock")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequiredArgsConstructor
public class HistorialStockRestController {

    private final HistorialStockService historialStockService;
    private final HistorialStockRepository historialStockRepository;

    @GetMapping("/pagina")
    public ResponseEntity<PaginaRespuesta<HistorialStockListaDTO>> listarPagina(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamano,
            @RequestParam(defaultValue = "") String q) {
        int paginaSegura = Math.max(0, pagina);
        int tamanoSeguro = Math.max(1, Math.min(tamano, 100));
        var paginaMovimientos = historialStockRepository.buscarPaginaResumen(
                q.trim(), PageRequest.of(paginaSegura, tamanoSeguro,
                        Sort.by(Sort.Direction.DESC, "fechaMovimiento")));
        var contenido = paginaMovimientos.getContent().stream()
                .map(movimiento -> new HistorialStockListaDTO(
                        movimiento.idHistorialStock(), movimiento.cantidad(), movimiento.tipoMovimiento(),
                        movimiento.fechaMovimiento(), movimiento.descripcion(),
                        movimiento.nombreProducto() == null ? null :
                                new HistorialStockListaDTO.Producto(movimiento.nombreProducto())))
                .toList();
        return ResponseEntity.ok(new PaginaRespuesta<>(contenido, paginaMovimientos.getNumber(),
                paginaMovimientos.getSize(), paginaMovimientos.getTotalElements(), paginaMovimientos.getTotalPages()));
    }

    @GetMapping("/resumen")
    public ResponseEntity<Map<String, Object>> obtenerResumen() {
        LocalDate hoy = LocalDate.now();
        LocalDateTime inicioMes = hoy.withDayOfMonth(1).atStartOfDay();
        LocalDateTime finMes = hoy.withDayOfMonth(hoy.lengthOfMonth()).atTime(23, 59, 59, 999_999_999);
        return ResponseEntity.ok(Map.of(
                "movimientosEsteMes", historialStockRepository.countByFechaMovimientoBetween(inicioMes, finMes),
                "entradasTotales", historialStockRepository.sumarCantidadPorTipo("ENTRADA"),
                "salidasTotales", historialStockRepository.sumarCantidadPorTipo("SALIDA")
        ));
    }

    @GetMapping
    public ResponseEntity<List<HistorialStock>> listarTodos() {
        return ResponseEntity.ok(historialStockService.listarTodos());
    }

    @GetMapping("/producto/{idProducto}")
    public ResponseEntity<List<HistorialStock>> listarPorProducto(@PathVariable Long idProducto) {
        return ResponseEntity.ok(historialStockService.listarPorProducto(idProducto));
    }
}
