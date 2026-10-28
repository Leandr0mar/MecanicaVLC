package com.example.dashboarvlc.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

import com.example.dashboarvlc.models.ItemsComprados;

public interface ItemsCompradosRepository extends JpaRepository<ItemsComprados, Long> {
    @Query("select i.producto.nombre, sum(i.cantidad) from ItemsComprados i where i.ordenCompra.estadoRecojo = com.example.dashboarvlc.models.enums.EstadoRecojo.RECOGIDO and i.ordenCompra.fechaPago is not null group by i.producto.nombre order by sum(i.cantidad) desc")
    List<Object[]> productosMasVendidos(Pageable pageable);
}
