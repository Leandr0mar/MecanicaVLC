package com.example.dashboarvlc.services.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dashboarvlc.models.Cliente;
import com.example.dashboarvlc.repositories.ClienteRepository;
import com.example.dashboarvlc.services.ClienteService;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteServiceImpl implements ClienteService {
    private static final Logger logger = LoggerFactory.getLogger(ClienteServiceImpl.class);

    @Autowired private ClienteRepository clienteRepository;

    @Override @Transactional(readOnly = true) public List<Cliente> listarTodos() { return clienteRepository.findAll(); }
    @Override @Transactional(readOnly = true) public Optional<Cliente> buscarPorId(Long id) { return clienteRepository.findById(id); }
    @Override @Transactional public Cliente guardar(Cliente cliente) {
        Cliente guardado = clienteRepository.save(cliente);
        logger.info("[CLIENTE SERVICE] guardado cliente id={} email={}", guardado.getIdUsuario(), guardado.getEmail());
        return guardado;
    }

    @Transactional(readOnly = true)
    public Optional<Cliente> buscarPorEmail(String email) {
        return clienteRepository.findByEmail(email);
    }

    @Override @Transactional public Cliente actualizar(Long id, Cliente c) {
        return clienteRepository.findById(id).map(existente -> {
            existente.setNombre(c.getNombre()); existente.setApellido(c.getApellido());
            existente.setEmail(c.getEmail()); existente.setTelefono(c.getTelefono());
            existente.setDireccion(c.getDireccion()); existente.setPlacaMototaxi(c.getPlacaMototaxi());
            existente.setMarcaMototaxi(c.getMarcaMototaxi()); existente.setModeloMototaxi(c.getModeloMototaxi());
            return clienteRepository.save(existente);
        }).orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }
    @Override @Transactional public void eliminar(Long id) { clienteRepository.deleteById(id); }
}