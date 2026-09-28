package com.example.dashboarvlc.controllers.web.cliente;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.example.dashboarvlc.models.Cliente;
import com.example.dashboarvlc.services.ClienteService;

@Controller
@RequestMapping("/cliente")
public class MisCitasWebController {

    @Autowired
    private ClienteService clienteService;

    @GetMapping("/mis-citas")
    public String listarMisCitas(Authentication authentication, Model model) {
        // 1. Obtener el email del usuario logueado desde la sesión
        String emailLogueado = authentication.getName();

        // 2. Buscar en la base de datos los datos completos de este cliente específico
        Cliente cliente = clienteService.buscarPorEmail(emailLogueado)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        // 3. Pasar el objeto cliente a la vista Thymeleaf para pintar su nombre, placa, etc.
        model.addAttribute("clienteLogueado", cliente);
        return "cliente/mis-citas";
    }
}
