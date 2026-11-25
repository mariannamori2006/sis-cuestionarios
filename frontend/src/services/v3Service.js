import axios from 'axios';
import api from './api';

// Instancia pública separada para que el portal del alumno nunca envíe JWT de docente
const publicApi = axios.create({
    baseURL: '/api/v3/public/evaluaciones'
});

// ============================================================================
// FLUJO PÚBLICO DEL ALUMNO (Sin inicio de sesión)
// ============================================================================

export const validarCodigoEvaluacionV3 = async (codigoNumerico) => {
    const { data } = await publicApi.post('/validar-codigo', { codigoNumerico });
    return data;
};

export const iniciarIntentoEvaluacionV3 = async (payload) => {
    const { data } = await publicApi.post('/iniciar-intento', payload);
    return data;
};

export const guardarAvanceEvaluacionV3 = async (intentoId, payload) => {
    const { data } = await publicApi.put(`/intentos/${intentoId}/avance`, payload);
    return data;
};

export const registrarEventoSeguridadV3 = async (intentoId, payload) => {
    const { data } = await publicApi.post(`/intentos/${intentoId}/evento-seguridad`, payload);
    return data;
};

export const entregarIntentoEvaluacionV3 = async (intentoId, payload) => {
    const { data } = await publicApi.post(`/intentos/${intentoId}/entregar`, payload);
    return data;
};

// ============================================================================
// CURSOS Y SECCIONES (Docente)
// ============================================================================

export const listarCursosV3 = async (soloActivos = true) => {
    const { data } = await api.get(`/v3/cursos?soloActivos=${soloActivos}`);
    return data;
};

export const crearCursoV3 = async (payload) => {
    const { data } = await api.post('/v3/cursos', payload);
    return data;
};

export const actualizarCursoV3 = async (cursoId, payload) => {
    const { data } = await api.put(`/v3/cursos/${cursoId}`, payload);
    return data;
};

export const agregarSeccionV3 = async (cursoId, nombre) => {
    const { data } = await api.post(`/v3/cursos/${cursoId}/secciones`, { nombre });
    return data;
};

export const desactivarSeccionV3 = async (cursoId, seccionId) => {
    await api.delete(`/v3/cursos/${cursoId}/secciones/${seccionId}`);
};

// ============================================================================
// SESIONES DE EVALUACIÓN, MONITOR EN VIVO Y ACTA DE NOTAS (Docente)
// ============================================================================

export const listarSesionesV3 = async (cuestionarioId = null) => {
    const query = cuestionarioId ? `?cuestionarioId=${cuestionarioId}` : '';
    const { data } = await api.get(`/v3/sesiones${query}`);
    return data;
};

export const crearSesionV3 = async (payload) => {
    const { data } = await api.post('/v3/sesiones', payload);
    return data;
};

export const actualizarEstadoSesionV3 = async (sesionId, payload) => {
    const { data } = await api.patch(`/v3/sesiones/${sesionId}/estado`, payload);
    return data;
};

export const regenerarCodigoSesionV3 = async (sesionId) => {
    const { data } = await api.post(`/v3/sesiones/${sesionId}/regenerar-codigo`);
    return data;
};

export const obtenerMonitorSesionV3 = async (sesionId) => {
    const { data } = await api.get(`/v3/sesiones/${sesionId}/monitor`);
    return data;
};

export const obtenerActaSesionV3 = async (sesionId, soloOficiales = true) => {
    const { data } = await api.get(`/v3/sesiones/${sesionId}/acta?soloOficiales=${soloOficiales}`);
    return data;
};

export const obtenerDetalleIntentoDocenteV3 = async (intentoId) => {
    const { data } = await api.get(`/v3/sesiones/intentos/${intentoId}`);
    return data;
};

export const ajustarCalificacionIntentoV3 = async (intentoId, payload) => {
    const { data } = await api.put(`/v3/sesiones/intentos/${intentoId}/calificar`, payload);
    return data;
};

