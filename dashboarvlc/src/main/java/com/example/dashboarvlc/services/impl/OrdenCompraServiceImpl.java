package com.example.dashboarvlc.services.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dashboarvlc.models.OrdenCompra;
import com.example.dashboarvlc.models.enums.EstadoRecojo;
import com.example.dashboarvlc.repositories.OrdenCompraRepository;
import com.example.dashboarvlc.services.OrdenCompraService;

import java.util.List;
import java.util.Optional;

@Service
public class OrdenCompraServiceImpl implements OrdenCompraService {
    @Autowired private OrdenCompraRepository ordenCompraRepository;

    @Override @Transactional(readOnly = true) public List<OrdenCompra> listarTodas() { return ordenCompraRepository.findAll(); }
    @Override @Transactional(readOnly = true) public Optional<OrdenCompra> buscarPorId(Long id) { return ordenCompraRepository.findById(id); }
    @Override @Transactional public OrdenCompra guardar(OrdenCompra o) { return ordenCompraRepository.save(o); }
    @Override @Transactional public OrdenCompra cambiarEstadoRecojo(Long id, EstadoRecojo nuevoEstado) {
        return ordenCompraRepository.findById(id).map(o -> {
            o.setEstadoRecojo(nuevoEstado);
            if(nuevoEstado == EstadoRecojo.RECOGIDO) o.setFechaPago(java.time.LocalDateTime.now());
            return ordenCompraRepository.save(o);
        }).orElseThrow(() -> new RuntimeException("Orden no encontrada"));
    }
}