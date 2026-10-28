package com.example.dashboarvlc.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

import com.example.dashboarvlc.models.Proveedor;
import com.example.dashboarvlc.dto.ProveedorListaDTO;

public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {
    @Query("select new com.example.dashboarvlc.dto.ProveedorListaDTO(p.idProveedor, p.ruc, p.nombreProveedor, p.telefono, count(pr.idProducto)) " +
            "from Proveedor p left join p.productos pr group by p.idProveedor, p.ruc, p.nombreProveedor, p.telefono order by p.nombreProveedor")
    List<ProveedorListaDTO> listarResumen();
}
