package com.example.dashboarvlc.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import java.io.IOException;
import java.util.Set;

public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        
        // Obtenemos los roles del usuario que se acaba de autenticar
        Set<String> roles = AuthorityUtils.authorityListToSet(authentication.getAuthorities());

        // Redirección según su rol en la BD
        if (roles.contains("ROLE_ADMIN")) {
            response.sendRedirect("/admin/dashboard");
        } else if (roles.contains("ROLE_TRABAJADOR")) {
            response.sendRedirect("/trabajador/agenda");
        } else if (roles.contains("ROLE_CLIENTE")) {
            response.sendRedirect("/cliente/mis-citas");
        } else {
            response.sendRedirect("/iniciar-sesion");
        }
    }
}