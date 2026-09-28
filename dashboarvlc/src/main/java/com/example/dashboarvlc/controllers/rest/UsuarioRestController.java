package com.example.dashboarvlc.controllers.rest;

import com.example.dashboarvlc.models.*;
import com.example.dashboarvlc.services.*;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

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
    private final Validator validator;

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

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id,
                                        @Valid @RequestBody UsuarioActualizacionRequest request) {
        Optional<Usuario> usuarioActual = usuarioService.buscarPorId(id);
        if (usuarioActual.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        boolean emailEnUso = usuarioService.buscarPorEmail(request.getEmail())
                .filter(usuario -> !usuario.getIdUsuario().equals(id))
                .isPresent();
        if (emailEnUso) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "El correo ya está registrado"));
        }

        boolean dniEnUso = usuarioService.buscarPorDni(request.getDni())
                .filter(usuario -> !usuario.getIdUsuario().equals(id))
                .isPresent();
        if (dniEnUso) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "El DNI ya está registrado"));
        }

        Usuario actualizado = crearModeloActualizacion(usuarioActual.get(), request);
        Set<ConstraintViolation<Usuario>> errores = validator.validate(actualizado);
        if (!errores.isEmpty()) {
            String mensaje = errores.iterator().next().getMessage();
            return ResponseEntity.badRequest().body(Map.of("error", mensaje));
        }

        if (actualizado instanceof Cliente cliente) {
            return ResponseEntity.ok(clienteService.actualizar(id, cliente));
        }
        if (actualizado instanceof Trabajador trabajador) {
            return ResponseEntity.ok(trabajadorService.actualizar(id, trabajador));
        }
        if (actualizado instanceof Administrador administrador) {
            return ResponseEntity.ok(administradorService.actualizar(id, administrador));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Tipo de usuario no compatible"));
    }

    private Usuario crearModeloActualizacion(Usuario actual, UsuarioActualizacionRequest request) {
        Usuario actualizado;
        if (actual instanceof Cliente) {
            Cliente cliente = new Cliente();
            cliente.setTelefono(request.getTelefono());
            cliente.setDireccion(request.getDireccion());
            cliente.setPlacaMototaxi(request.getPlacaMototaxi());
            cliente.setMarcaMototaxi(request.getMarcaMototaxi());
            cliente.setModeloMototaxi(request.getModeloMototaxi());
            actualizado = cliente;
        } else if (actual instanceof Trabajador) {
            Trabajador trabajador = new Trabajador();
            trabajador.setEspecialidad(request.getEspecialidad());
            trabajador.setDisponibilidad(request.getDisponibilidad());
            actualizado = trabajador;
        } else if (actual instanceof Administrador administradorActual) {
            Administrador administrador = new Administrador();
            administrador.setNivelAcceso(administradorActual.getNivelAcceso());
            actualizado = administrador;
        } else {
            return actual;
        }

        actualizado.setNombre(request.getNombre());
        actualizado.setApellido(request.getApellido());
        actualizado.setDni(request.getDni());
        actualizado.setEmail(request.getEmail());
        actualizado.setRol(actual.getRol());
        actualizado.setContrasenia(actual.getContrasenia());
        return actualizado;
    }

    // --- ENDPOINTS ESPECÍFICOS POR ROL ---

    @PostMapping("/cliente")
    public ResponseEntity<?> crearCliente(@Valid @RequestBody Cliente cliente) {
        if (usuarioService.buscarPorDni(cliente.getDni()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "El DNI ya está registrado"));
        }
        cliente.setContrasenia(passwordEncoder.encode(cliente.getContrasenia())); // ¡Encriptar!
        cliente.setRol(3);
        return new ResponseEntity<>(clienteService.guardar(cliente), HttpStatus.CREATED);
    }

    @PostMapping("/trabajador")
    public ResponseEntity<?> crearTrabajador(@Valid @RequestBody Trabajador trabajador) {
        if (usuarioService.buscarPorDni(trabajador.getDni()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "El DNI ya está registrado"));
        }
        trabajador.setContrasenia(passwordEncoder.encode(trabajador.getContrasenia()));
        trabajador.setRol(2);
        return new ResponseEntity<>(trabajadorService.guardar(trabajador), HttpStatus.CREATED);
    }

    @PostMapping("/admin")
    public ResponseEntity<?> crearAdmin(@Valid @RequestBody Administrador admin) {
        if (usuarioService.buscarPorDni(admin.getDni()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "El DNI ya está registrado"));
        }
        admin.setContrasenia(passwordEncoder.encode(admin.getContrasenia()));
        admin.setRol(1);
        return new ResponseEntity<>(administradorService.guardar(admin), HttpStatus.CREATED);
    }
}