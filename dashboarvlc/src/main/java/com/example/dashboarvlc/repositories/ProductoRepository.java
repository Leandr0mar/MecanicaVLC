package com.example.dashboarvlc.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.query.Param;
import java.util.List;

import com.example.dashboarvlc.models.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    @EntityGraph(attributePaths = {"categoria", "proveedor", "oferta"})
    @Query(value = "select p from Producto p left join p.categoria c left join p.proveedor pr " +
            "where (:q = '' or lower(concat(coalesce(p.nombre,''),' ',coalesce(p.codigoProducto,''),' ',coalesce(p.marca,''),' ',coalesce(c.nombreCategoria,''),' ',coalesce(pr.nombreProveedor,''))) like lower(concat('%',:q,'%'))) " +
            "and (:categoria is null or c.idCategoria = :categoria) " +
            "and (:marca = '' or lower(p.marca) = lower(:marca)) " +
            "and (:proveedor is null or pr.idProveedor = :proveedor) " +
            "and (:stock = '' or (:stock = 'AGOTADO' and p.stock = 0) or (:stock = 'POCO_STOCK' and p.stock between 1 and 5) or (:stock = 'EN_STOCK' and p.stock > 5))",
            countQuery = "select count(p) from Producto p left join p.categoria c left join p.proveedor pr " +
                    "where (:q = '' or lower(concat(coalesce(p.nombre,''),' ',coalesce(p.codigoProducto,''),' ',coalesce(p.marca,''),' ',coalesce(c.nombreCategoria,''),' ',coalesce(pr.nombreProveedor,''))) like lower(concat('%',:q,'%'))) " +
                    "and (:categoria is null or c.idCategoria = :categoria) " +
                    "and (:marca = '' or lower(p.marca) = lower(:marca)) " +
                    "and (:proveedor is null or pr.idProveedor = :proveedor) " +
                    "and (:stock = '' or (:stock = 'AGOTADO' and p.stock = 0) or (:stock = 'POCO_STOCK' and p.stock between 1 and 5) or (:stock = 'EN_STOCK' and p.stock > 5))")
    Page<Producto> buscarPagina(@Param("q") String q, @Param("categoria") Long categoria,
                                @Param("marca") String marca, @Param("proveedor") Long proveedor,
                                @Param("stock") String stock, Pageable pageable);

    @Query("select distinct p.marca from Producto p where p.marca is not null and p.marca <> '' order by p.marca")
    List<String> listarMarcas();
}
