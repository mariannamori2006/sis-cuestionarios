package com.nativatec.cuestionarios.service;

import com.nativatec.cuestionarios.dto.v3.CursoDtos.*;
import com.nativatec.cuestionarios.entity.Curso;
import com.nativatec.cuestionarios.entity.Seccion;
import com.nativatec.cuestionarios.entity.Usuario;
import com.nativatec.cuestionarios.repository.CursoRepository;
import com.nativatec.cuestionarios.repository.SeccionRepository;
import com.nativatec.cuestionarios.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class CursoService {

    private final CursoRepository cursoRepository;
    private final SeccionRepository seccionRepository;
    private final UsuarioRepository usuarioRepository;

    public CursoService(
            CursoRepository cursoRepository,
            SeccionRepository seccionRepository,
            UsuarioRepository usuarioRepository) {
        this.cursoRepository = cursoRepository;
        this.seccionRepository = seccionRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<CursoResponse> listarCursosDocente(UUID docenteId, boolean soloActivos) {
        List<Curso> cursos = soloActivos
                ? cursoRepository.findByDocenteIdAndActivoTrueOrderByNombreAsc(docenteId)
                : cursoRepository.findByDocenteIdOrderByCreatedAtDesc(docenteId);
        return cursos.stream().map(this::toResponse).toList();
    }

    @Transactional
    public CursoResponse crearCurso(UUID docenteId, CrearCursoRequest request) {
        if (request == null || request.nombre() == null || request.nombre().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre del curso es obligatorio.");
        }
        String nombreLimpio = request.nombre().trim();
        if (cursoRepository.existsByDocenteIdAndNombreIgnoreCase(docenteId, nombreLimpio)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya tienes un curso registrado con ese nombre.");
        }

        Usuario docente = usuarioRepository.findById(docenteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Docente no encontrado."));

        Curso curso = new Curso();
        curso.setDocente(docente);
        curso.setNombre(nombreLimpio);
        curso.setCodigoCurso(trimOrNull(request.codigoCurso()));
        curso.setPeriodoAcademico(trimOrNull(request.periodoAcademico()));
        curso.setColorHex(request.colorHex() != null && !request.colorHex().trim().isEmpty()
                ? request.colorHex().trim()
                : "#3b82f6");
        curso.setActivo(true);

        if (request.seccionesIniciales() != null) {
            for (String secNombre : request.seccionesIniciales()) {
                if (secNombre != null && !secNombre.trim().isEmpty()) {
                    String limpio = secNombre.trim();
                    boolean yaExiste = curso.getSecciones().stream()
                            .anyMatch(s -> s.getNombre().equalsIgnoreCase(limpio));
                    if (!yaExiste) {
                        curso.getSecciones().add(new Seccion(curso, limpio));
                    }
                }
            }
        }

        return toResponse(cursoRepository.save(curso));
    }

    @Transactional
    public CursoResponse actualizarCurso(UUID cursoId, UUID solicitanteId, boolean esAdmin, ActualizarCursoRequest request) {
        Curso curso = obtenerCursoConPermiso(cursoId, solicitanteId, esAdmin);
        if (request.nombre() != null && !request.nombre().trim().isEmpty()) {
            curso.setNombre(request.nombre().trim());
        }
        if (request.codigoCurso() != null) {
            curso.setCodigoCurso(trimOrNull(request.codigoCurso()));
        }
        if (request.periodoAcademico() != null) {
            curso.setPeriodoAcademico(trimOrNull(request.periodoAcademico()));
        }
        if (request.colorHex() != null && !request.colorHex().trim().isEmpty()) {
            curso.setColorHex(request.colorHex().trim());
        }
        if (request.activo() != null) {
            curso.setActivo(request.activo());
        }
        return toResponse(cursoRepository.save(curso));
    }

    @Transactional
    public SeccionResponse agregarSeccion(UUID cursoId, UUID solicitanteId, boolean esAdmin, CrearSeccionRequest request) {
        if (request == null || request.nombre() == null || request.nombre().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre de la sección es obligatorio.");
        }
        Curso curso = obtenerCursoConPermiso(cursoId, solicitanteId, esAdmin);
        String nombreSeccion = request.nombre().trim();

        Seccion existente = seccionRepository.findByCursoIdAndNombreIgnoreCase(cursoId, nombreSeccion).orElse(null);
        if (existente != null) {
            if (Boolean.TRUE.equals(existente.getActivo())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "La sección '" + nombreSeccion + "' ya existe en este curso.");
            }
            existente.setActivo(true);
            Seccion reactivada = seccionRepository.save(existente);
            return new SeccionResponse(reactivada.getId(), reactivada.getNombre(), reactivada.getActivo());
        }

        Seccion nueva = seccionRepository.save(new Seccion(curso, nombreSeccion));
        return new SeccionResponse(nueva.getId(), nueva.getNombre(), nueva.getActivo());
    }

    @Transactional
    public void desactivarSeccion(UUID cursoId, UUID seccionId, UUID solicitanteId, boolean esAdmin) {
        obtenerCursoConPermiso(cursoId, solicitanteId, esAdmin);
        Seccion seccion = seccionRepository.findById(seccionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sección no encontrada."));
        if (!seccion.getCurso().getId().equals(cursoId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La sección no pertenece al curso indicado.");
        }
        seccion.setActivo(false);
        seccionRepository.save(seccion);
    }

    public Curso obtenerCursoConPermiso(UUID cursoId, UUID solicitanteId, boolean esAdmin) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado."));
        if (!esAdmin && !curso.getDocente().getId().equals(solicitanteId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para modificar este curso.");
        }
        return curso;
    }

    private CursoResponse toResponse(Curso c) {
        List<SeccionResponse> secciones = c.getSecciones().stream()
                .filter(s -> Boolean.TRUE.equals(s.getActivo()))
                .map(s -> new SeccionResponse(s.getId(), s.getNombre(), s.getActivo()))
                .toList();
        return new CursoResponse(
                c.getId(),
                c.getNombre(),
                c.getCodigoCurso(),
                c.getPeriodoAcademico(),
                c.getColorHex(),
                c.getActivo(),
                secciones,
                c.getCreatedAt()
        );
    }

    private static String trimOrNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}

