package com.example.dashboarvlc.controllers.rest;

import com.example.dashboarvlc.models.Cliente;
import com.example.dashboarvlc.models.Usuario;
import com.example.dashboarvlc.services.ClienteService;
import com.example.dashboarvlc.services.PresenciaService;
import com.example.dashboarvlc.services.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Map;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthRestController {
    private final AuthenticationManager authenticationManager;
    private final UsuarioService usuarioService;
    private final ClienteService clienteService;
    private final PasswordEncoder passwordEncoder;
    private final PresenciaService presenciaService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            HttpSession session = httpRequest.getSession(true);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                    SecurityContextHolder.getContext());

            Usuario usuario = usuarioService.buscarPorEmail(request.getEmail())
                    .orElseThrow(() -> new IllegalStateException("Usuario no encontrado después de autenticación"));
            return ResponseEntity.ok(LoginResponse.fromUsuario(usuario));
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Credenciales inválidas"));
        }
    }

    @PostMapping("/heartbeat")
    public ResponseEntity<?> heartbeat(Authentication authentication, HttpServletRequest request) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }

        HttpSession session = request.getSession(false);
        if (session == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Sesión no disponible"));
        }

        Usuario usuario = usuarioService.buscarPorEmail(authentication.getName()).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Usuario no encontrado"));
        }

        presenciaService.registrarActividad(usuario, session);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            presenciaService.cerrarSesion(session);
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> register(@Valid @RequestBody ClienteRegistrationRequest request) {
        if (usuarioService.buscarPorDni(request.getDni()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "El DNI ya está registrado"));
        }
        if (clienteService.buscarPorEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "El correo electrónico ya está registrado"));
        }

        Cliente cliente = new Cliente();
        cliente.setNombre(request.getNombre());
        cliente.setApellido(request.getApellido());
        cliente.setDni(request.getDni());
        cliente.setEmail(request.getEmail());
        cliente.setContrasenia(passwordEncoder.encode(request.getPassword()));
        cliente.setTelefono(request.getTelefono());
        cliente.setDireccion(request.getDireccion());
        cliente.setPlacaMototaxi(request.getPlacaMototaxi());
        cliente.setMarcaMototaxi(request.getMarcaMototaxi());
        cliente.setModeloMototaxi(request.getModeloMototaxi());
        cliente.setRol(3);

        Cliente guardado = clienteService.guardar(cliente);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("id", guardado.getIdUsuario()));
    }
}
