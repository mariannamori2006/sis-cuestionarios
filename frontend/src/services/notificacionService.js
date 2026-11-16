import api from './api';

export const obtenerNotificaciones = async () => {
    const response = await api.get('/notificaciones');
    return response.data;
};

export const obtenerConteoNoLeidas = async () => {
    const response = await api.get('/notificaciones/no-leidas/count');
    return response.data;
};

export const marcarNotificacionLeida = async (id) => {
    const response = await api.put(`/notificaciones/${id}/leer`);
    return response.data;
};

export const marcarTodasLeidas = async () => {
    const response = await api.put('/notificaciones/marcar-todas-leidas');
    return response.data;
};

export const eliminarNotificacion = async (id) => {
    const response = await api.delete(`/notificaciones/${id}`);
    return response.data;
};

