package com.nativatec.cuestionarios.repository;

import com.nativatec.cuestionarios.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
    //Buscar a un usuario por correo
    Optional<Usuario> findByEmail(String email);
}
