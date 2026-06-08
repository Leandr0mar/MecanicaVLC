package com.example.dashboarvlc.config;

import com.example.dashboarvlc.models.Usuario;
import com.example.dashboarvlc.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioService usuarioService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioService.buscarPorEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        return User.withUsername(usuario.getEmail())
                .password(usuario.getContrasenia())
                .authorities(resolveAuthorities(usuario.getRol()))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }

    private List<GrantedAuthority> resolveAuthorities(Integer rol) {
        if (rol == null) {
            return Collections.emptyList();
        }

        switch (rol) {
            case 1:
                return Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN"));
            case 2:
                return Collections.singletonList(new SimpleGrantedAuthority("ROLE_TRABAJADOR"));
            case 3:
                return Collections.singletonList(new SimpleGrantedAuthority("ROLE_CLIENTE"));
            default:
                return Collections.singletonList(new SimpleGrantedAuthority("ROLE_CLIENTE"));
        }
    }
}
