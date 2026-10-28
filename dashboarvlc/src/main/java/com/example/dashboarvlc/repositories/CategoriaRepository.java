package com.example.dashboarvlc.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

import com.example.dashboarvlc.models.Categoria;
import com.example.dashboarvlc.dto.CategoriaListaDTO;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    @Query("select new com.example.dashboarvlc.dto.CategoriaListaDTO(c.idCategoria, c.nombreCategoria, c.descripcion, count(p.idProducto)) " +
            "from Categoria c left join c.productos p group by c.idCategoria, c.nombreCategoria, c.descripcion order by c.nombreCategoria")
    List<CategoriaListaDTO> listarResumen();
}
