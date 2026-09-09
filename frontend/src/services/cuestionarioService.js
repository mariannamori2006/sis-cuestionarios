import api from './api';

export const obtenerCuestionarios = async () => {
    const response = await api.get('/cuestionarios');
    return response.data;
};