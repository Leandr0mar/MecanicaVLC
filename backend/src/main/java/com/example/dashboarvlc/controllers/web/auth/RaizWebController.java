package com.example.dashboarvlc.controllers.web.auth;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Set;

@Controller
public class RaizWebController {

    @GetMapping("/")
    public String redirigirUsuarioLogueado(Authentication authentication) {
        // 1. Si el usuario no está logueado, lo mandamos a que inicie sesión
        if (authentication == null || !authentication.isAuthenticated()) {
            return "redirect:/iniciar-sesion";
        }

        // 2. Si ya está logueado (como te pasó a ti), lo mandamos a su panel según su rol
        Set<String> roles = AuthorityUtils.authorityListToSet(authentication.getAuthorities());

        if (roles.contains("ROLE_ADMIN")) {
            return "redirect:/admin/dashboard";
        } else if (roles.contains("ROLE_TRABAJADOR")) {
            return "redirect:/trabajador/agenda";
        } else if (roles.contains("ROLE_CLIENTE")) {
            return "redirect:/cliente/mis-citas";
        }

        return "redirect:/iniciar-sesion";
    }
}
