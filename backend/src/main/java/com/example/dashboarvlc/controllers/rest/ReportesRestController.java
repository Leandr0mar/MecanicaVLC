package com.example.dashboarvlc.controllers.rest;

import com.example.dashboarvlc.models.enums.EstadoCita;
import com.example.dashboarvlc.repositories.CitaRepository;
import com.example.dashboarvlc.repositories.ItemsCompradosRepository;
import com.example.dashboarvlc.repositories.OrdenCompraRepository;
import com.example.dashboarvlc.repositories.ReseñaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReportesRestController {
    private static final Map<String, String> COLORES_ESTADO = Map.of(
            "PENDIENTE", "#f59e0b", "EN_PROGRESO", "#3b82f6",
            "COMPLETADA", "#10b981", "CANCELADA", "#ef4444");

    private final OrdenCompraRepository ordenCompraRepository;
    private final CitaRepository citaRepository;
    private final ReseñaRepository reseñaRepository;
    private final ItemsCompradosRepository itemsCompradosRepository;

    @GetMapping("/resumen")
    public ResponseEntity<Map<String, Object>> resumen() {
        LocalDate hoy = LocalDate.now();
        YearMonth mesActual = YearMonth.from(hoy);
        LocalDateTime desdeSeisMeses = mesActual.minusMonths(5).atDay(1).atStartOfDay();
        LocalDateTime hastaHoy = hoy.atTime(23, 59, 59, 999_999_999);

        Map<YearMonth, Double> ingresosPorMes = new LinkedHashMap<>();
        for (int offset = 5; offset >= 0; offset--) {
            ingresosPorMes.put(mesActual.minusMonths(offset), 0.0);
        }
        sumarPorMes(ingresosPorMes, ordenCompraRepository.ingresosPagadosEntre(desdeSeisMeses, hastaHoy));
        sumarPorMes(ingresosPorMes, citaRepository.ingresosPagadosEntre(desdeSeisMeses, hastaHoy));

        List<Map<String, Object>> ventasMensuales = new ArrayList<>();
        ingresosPorMes.forEach((mes, importe) -> ventasMensuales.add(Map.of(
                "mesNum", mes.getMonthValue() - 1,
                "año", mes.getYear(),
                "nombre", mes.getMonth().getDisplayName(java.time.format.TextStyle.SHORT, java.util.Locale.forLanguageTag("es-PE")).toUpperCase(),
                "ingresos", importe)));

        List<Map<String, Object>> distribucionCitas = citaRepository.contarPorEstado().stream().map(fila -> {
            String estado = String.valueOf(fila[0]);
            return Map.<String, Object>of("name", estado.replace('_', ' '), "value", fila[1],
                    "color", COLORES_ESTADO.getOrDefault(estado, "#9ca3af"));
        }).toList();

        List<Object[]> resumenCalificaciones = reseñaRepository.resumenCalificaciones();
        Object[] calificaciones = resumenCalificaciones.isEmpty() ? null : resumenCalificaciones.get(0);
        double promedio = calificaciones == null || calificaciones[0] == null ? 0 : ((Number) calificaciones[0]).doubleValue();
        long totalReseñas = calificaciones == null || calificaciones[1] == null ? 0 : ((Number) calificaciones[1]).longValue();

        List<Map<String, Object>> topProductos = itemsCompradosRepository.productosMasVendidos(PageRequest.of(0, 5)).stream()
                .map(fila -> Map.<String, Object>of("nombre", fila[0], "cantidad", fila[1])).toList();
        List<Map<String, Object>> topServicios = citaRepository.serviciosMasSolicitados(PageRequest.of(0, 5)).stream()
                .map(fila -> Map.<String, Object>of("nombre", fila[0], "cantidad", fila[1])).toList();

        Map<String, Object> metricas = Map.of(
                "ingresosTotales", nuloACero(ordenCompraRepository.sumarIngresosPagados()) + nuloACero(citaRepository.sumarIngresosPagados()),
                "totalCitasMes", citaRepository.countByFechaBetween(mesActual.atDay(1), mesActual.atEndOfMonth()),
                "serviciosCompletados", citaRepository.countByEstado(EstadoCita.COMPLETADA),
                "promedioSatisfaccion", String.format(java.util.Locale.ROOT, "%.1f", promedio),
                "totalResenas", totalReseñas);

        return ResponseEntity.ok(Map.of(
                "metricas", metricas,
                "ventasMensuales", ventasMensuales,
                "distribucionCitas", distribucionCitas,
                "topProductos", topProductos,
                "topServicios", topServicios));
    }

    private static void sumarPorMes(Map<YearMonth, Double> acumulado, List<Object[]> filas) {
        for (Object[] fila : filas) {
            if (fila[0] instanceof LocalDateTime fecha && fila[1] instanceof Number monto) {
                YearMonth mes = YearMonth.from(fecha);
                if (acumulado.containsKey(mes)) acumulado.merge(mes, monto.doubleValue(), Double::sum);
            }
        }
    }

    private static double nuloACero(Double importe) {
        return importe == null ? 0 : importe;
    }
}
