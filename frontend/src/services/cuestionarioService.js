import api from './api'; // Importa la instancia configurada

export const obtenerCuestionarios = async () => {
    const response = await api.get('/cuestionarios');
    return response.data;
};

export const crearCuestionario = async (cuestionarioData) => {
    const response = await api.post('/cuestionarios', cuestionarioData);
    return response.data;
};

export const actualizarCuestionario = async (id, cuestionarioData) => {
    const response = await api.put(`/cuestionarios/${id}`, cuestionarioData);
    return response.data;
};

export const obtenerCuestionarioPorId = async (id) => {
    const response = await api.get(`/cuestionarios/${id}`);
    return response.data;
};

export const eliminarCuestionario = async (id) => {
    await api.delete(`/cuestionarios/${id}`);
};

export const obtenerEstadisticas = async () => {
    const response = await api.get('/intentos/estadisticas');
    return response.data;
};

export const responderCuestionario = async (data) => {
    const response = await api.post('/intentos/responder', data);
    return response.data;
};

export const obtenerAuditoriaCuestionario = async (cuestionarioId) => {
    const response = await api.get(`/intentos/auditoria/${cuestionarioId}`);
    return response.data;
};

export const calificarIntento = async (intentoId, calificacion) => {
    const response = await api.put(`/intentos/${intentoId}/calificar`, { calificacion });
    return response.data;
};

export const obtenerActividadReciente = async () => {
    const response = await api.get('/intentos/recientes');
    return response.data;
};

export const obtenerEstadisticasDetalladas = async () => {
    const response = await api.get('/intentos/estadisticas-detalladas');
    return response.data;
};