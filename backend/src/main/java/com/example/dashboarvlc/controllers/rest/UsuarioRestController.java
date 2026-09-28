package com.example.dashboarvlc.controllers.rest;

import com.example.dashboarvlc.models.*;
import com.example.dashboarvlc.services.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequiredArgsConstructor
public class UsuarioRestController {

    private final UsuarioService usuarioService;
    private final ClienteService clienteService;
    private final TrabajadorService trabajadorService;
    private final AdministradorService administradorService;
    private final PasswordEncoder passwordEncoder; // Inyectamos el encriptador

    // Obtener todos los usuarios para la tabla (Spring traerá Clientes, Trabajadores y Admins automáticamente)
    @GetMapping
    public ResponseEntity<List<Usuario>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        usuarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    // --- ENDPOINTS ESPECÍFICOS POR ROL ---

    @PostMapping("/cliente")
    public ResponseEntity<Cliente> crearCliente(@Valid @RequestBody Cliente cliente) {
        cliente.setContrasenia(passwordEncoder.encode(cliente.getContrasenia())); // ¡Encriptar!
        cliente.setRol(3);
        return new ResponseEntity<>(clienteService.guardar(cliente), HttpStatus.CREATED);
    }

    @PostMapping("/trabajador")
    public ResponseEntity<Trabajador> crearTrabajador(@Valid @RequestBody Trabajador trabajador) {
        trabajador.setContrasenia(passwordEncoder.encode(trabajador.getContrasenia()));
        trabajador.setRol(2);
        return new ResponseEntity<>(trabajadorService.guardar(trabajador), HttpStatus.CREATED);
    }

    @PostMapping("/admin")
    public ResponseEntity<Administrador> crearAdmin(@Valid @RequestBody Administrador admin) {
        admin.setContrasenia(passwordEncoder.encode(admin.getContrasenia()));
        admin.setRol(1);
        return new ResponseEntity<>(administradorService.guardar(admin), HttpStatus.CREATED);
    }
}