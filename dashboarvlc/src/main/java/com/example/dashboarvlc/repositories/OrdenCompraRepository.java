package com.example.dashboarvlc.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

import com.example.dashboarvlc.models.OrdenCompra;
import org.springframework.data.jpa.repository.EntityGraph;

public interface OrdenCompraRepository extends JpaRepository<OrdenCompra, Long> {
    @Query(value = "select o from OrdenCompra o left join o.cliente c " +
            "where (:q = '' or lower(concat(cast(o.idReserva as string),' ',cast(o.fechaReserva as string),' ',coalesce(c.nombre,''),' ',coalesce(c.apellido,''),' ',coalesce(c.email,''),' ',coalesce(c.telefono,''),' ',cast(o.estadoRecojo as string))) like lower(concat('%',:q,'%')) " +
            "or exists (select i.idItemComprado from ItemsComprados i where i.ordenCompra = o and lower(coalesce(i.producto.nombre,'')) like lower(concat('%',:q,'%')))) " +
            "and (:estado = '' or cast(o.estadoRecojo as string) = :estado) " +
            "order by case when o.estadoRecojo = com.example.dashboarvlc.models.enums.EstadoRecojo.PENDIENTE then 0 " +
            "when o.estadoRecojo = com.example.dashboarvlc.models.enums.EstadoRecojo.RECOGIDO then 1 else 2 end, o.idReserva desc",
            countQuery = "select count(o) from OrdenCompra o left join o.cliente c " +
                    "where (:q = '' or lower(concat(cast(o.idReserva as string),' ',cast(o.fechaReserva as string),' ',coalesce(c.nombre,''),' ',coalesce(c.apellido,''),' ',coalesce(c.email,''),' ',coalesce(c.telefono,''),' ',cast(o.estadoRecojo as string))) like lower(concat('%',:q,'%')) " +
                    "or exists (select i.idItemComprado from ItemsComprados i where i.ordenCompra = o and lower(coalesce(i.producto.nombre,'')) like lower(concat('%',:q,'%')))) " +
                    "and (:estado = '' or cast(o.estadoRecojo as string) = :estado)")
    Page<OrdenCompra> buscarPagina(@Param("q") String q, @Param("estado") String estado, Pageable pageable);

    @EntityGraph(attributePaths = {"cliente", "trabajador"})
    List<OrdenCompra> findByCliente_EmailOrderByFechaReservaDesc(String email);

    @Query("select coalesce(sum(o.montoTotal), 0.0D) from OrdenCompra o where o.estadoRecojo = com.example.dashboarvlc.models.enums.EstadoRecojo.RECOGIDO and o.fechaPago is not null")
    Double sumarIngresosPagados();

    @Query("select o.fechaPago, o.montoTotal from OrdenCompra o where o.estadoRecojo = com.example.dashboarvlc.models.enums.EstadoRecojo.RECOGIDO and o.fechaPago between :inicio and :fin")
    List<Object[]> ingresosPagadosEntre(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);
}
