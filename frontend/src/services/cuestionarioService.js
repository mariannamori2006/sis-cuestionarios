import api from './api'; // Importa la instancia configurada

export const obtenerCuestionarios = async () => {
    const response = await api.get('/cuestionarios');
    return response.data;
};

export const crearCuestionario = async (cuestionarioData) => {
    const response = await api.post('/cuestionarios', cuestionarioData);
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