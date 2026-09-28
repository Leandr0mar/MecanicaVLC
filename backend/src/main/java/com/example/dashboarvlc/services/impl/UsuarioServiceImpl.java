package com.example.dashboarvlc.services.impl;

import com.example.dashboarvlc.models.Usuario;
import com.example.dashboarvlc.repositories.UsuarioRepository;
import com.example.dashboarvlc.services.UsuarioService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioServiceImpl implements UsuarioService {
    @Autowired private UsuarioRepository usuarioRepository;

    @Override @Transactional(readOnly = true) public List<Usuario> listarTodos() { return usuarioRepository.findAll(); }
    @Override @Transactional(readOnly = true) public Optional<Usuario> buscarPorId(Long id) { return usuarioRepository.findById(id); }
    @Override @Transactional(readOnly = true) public Optional<Usuario> buscarPorEmail(String email) { return usuarioRepository.findByEmail(email); }
    @Override @Transactional public Usuario guardar(Usuario usuario) { return usuarioRepository.save(usuario); }
    @Override @Transactional public void eliminar(Long id) { usuarioRepository.deleteById(id); }
}
