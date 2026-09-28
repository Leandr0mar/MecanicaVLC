package com.example.dashboarvlc.controllers.web.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import com.example.dashboarvlc.models.Cliente;
import com.example.dashboarvlc.services.ClienteService;

import jakarta.validation.Valid;

@Controller
public class AuthWebController {

    private static final Logger logger = LoggerFactory.getLogger(AuthWebController.class);

    @Autowired
        private ClienteService clienteService;

    @Autowired
    private PasswordEncoder passwordEncoder; // Inyectamos el encriptador de SecurityConfig

    @GetMapping("/iniciar-sesion")
    public String login() {
        return "auth/iniciar-sesion";
    }
    
    @GetMapping("/registrar")
    public String registrarse(Model model) {
        model.addAttribute("cliente", new Cliente());
        return "auth/registrar";
    }
    
    @PostMapping("/registrar")
    public String procesarRegistro(@Valid @ModelAttribute("cliente") Cliente cliente, 
                                   BindingResult result, 
                                   Model model) {
        logger.info("[REGISTRO] Entrada a procesarRegistro con email={}", cliente.getEmail());

        // 1. Si hay errores de validación (campos vacíos, formato email incorrecto), regresa al formulario
        if (result.hasErrors()) {
            logger.info("[REGISTRO] Errores de validación: {}", result.getAllErrors());
            return "auth/registrar";
        }

        try {
            // 2. Seguridad profesional: Encriptar la contraseña con BCrypt
            String contraseñaEncriptada = passwordEncoder.encode(cliente.getContrasenia());
            cliente.setContrasenia(contraseñaEncriptada);

            // 3. Regla de Negocio: Rol estricto de Cliente (Rol = 3)
            cliente.setRol(3); 
            
            // 4. Guardar en la base de datos a través de la jerarquía JOINED
            Cliente guardado = clienteService.guardar(cliente);
            logger.info("[REGISTRO] Cliente guardado con id={} email={}", guardado.getIdUsuario(), guardado.getEmail());
            
            // Redirige con parámetro de éxito
            return "redirect:/iniciar-sesion?registrado=true";
            
        } catch (Exception e) {
            logger.error("[REGISTRO] Error al guardar cliente", e);
            model.addAttribute("error", "El correo electrónico ya se encuentra registrado.");
            return "auth/registrar";
        }
    }
}
