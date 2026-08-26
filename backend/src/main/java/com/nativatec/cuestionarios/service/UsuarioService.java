package com.nativatec.cuestionarios.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nativatec.cuestionarios.entity.Usuario;
import com.nativatec.cuestionarios.repository.UsuarioRepository;

@Service
public class UsuarioService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;

    //Listar todos los usuarios
    public List<Usuario> obtenerTodos(){
        return usuarioRepository.findAll();
    }

    //Buscar un usuario por ID
    public Optional<Usuario> obtenerPorId(UUID id){
        return usuarioRepository.findById(id);
    }

    //Guardar o registrar un usuario
    public Usuario guardarUsuario(Usuario usuario){
        return usuarioRepository.save(usuario);
    }

    //Eliminar un usuario
    public void eliminarUsuario(UUID id){
        usuarioRepository.deleteById(id);
    }
}
