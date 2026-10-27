package com.example.dashboarvlc.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;

import com.example.dashboarvlc.models.HistorialStock;

public interface HistorialStockRepository extends JpaRepository<HistorialStock, Long> {
    @Query("select h from HistorialStock h left join h.producto p where " +
            "(:q = '' or lower(concat(cast(h.idHistorialStock as string),' ',coalesce(h.tipoMovimiento,''),' ',coalesce(h.descripcion,''),' ',coalesce(p.nombre,''),' ',coalesce(p.codigoProducto,''))) like lower(concat('%',:q,'%')))")
    Page<HistorialStock> buscarPagina(@Param("q") String q, Pageable pageable);

    long countByFechaMovimientoBetween(LocalDateTime inicio, LocalDateTime fin);

    @Query("select coalesce(sum(h.cantidad), 0L) from HistorialStock h where upper(h.tipoMovimiento) like concat('%', upper(:tipo), '%')")
    Long sumarCantidadPorTipo(@Param("tipo") String tipo);
}
