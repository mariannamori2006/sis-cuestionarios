package com.nativatec.cuestionarios.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.nativatec.cuestionarios.entity.Usuario;
import com.nativatec.cuestionarios.repository.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Listar todos los usuarios
    public List<Usuario> obtenerTodos() {
        return usuarioRepository.findAll();
    }

    // Buscar un usuario por ID
    public Optional<Usuario> obtenerPorId(UUID id) {
        return usuarioRepository.findById(id);
    }

    // Guardar o registrar un usuario
    public Usuario guardarUsuario(Usuario usuario) {
        // Cifrar contraseña
        if (usuario.getPasswordHash() != null && !usuario.getPasswordHash().startsWith("$2a$")) {
            usuario.setPasswordHash(passwordEncoder.encode(usuario.getPasswordHash()));
        }
        return usuarioRepository.save(usuario);
    }

    // Actualizar un usuario existente
    public Usuario actualizarUsuario(UUID id, Usuario usuarioActualizado) {
        return usuarioRepository.findById(id).map(usuario -> {
            if (usuarioActualizado.getNombre() != null) {
                usuario.setNombre(usuarioActualizado.getNombre());
            }
            if (usuarioActualizado.getApellido() != null) {
                usuario.setApellido(usuarioActualizado.getApellido());
            }
            if (usuarioActualizado.getEmail() != null) {
                usuario.setEmail(usuarioActualizado.getEmail());
            }
            if (usuarioActualizado.getRol() != null) {
                usuario.setRol(usuarioActualizado.getRol());
            }
            if (usuarioActualizado.getActivo() != null) {
                usuario.setActivo(usuarioActualizado.getActivo());
            }
            if (usuarioActualizado.getPasswordHash() != null && !usuarioActualizado.getPasswordHash().trim().isEmpty()) {
                if (!usuarioActualizado.getPasswordHash().startsWith("$2a$")) {
                    usuario.setPasswordHash(passwordEncoder.encode(usuarioActualizado.getPasswordHash()));
                } else {
                    usuario.setPasswordHash(usuarioActualizado.getPasswordHash());
                }
            }
            return usuarioRepository.save(usuario);
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
    }

    // Eliminar un usuario
    public void eliminarUsuario(UUID id) {
        usuarioRepository.deleteById(id);
    }
}

