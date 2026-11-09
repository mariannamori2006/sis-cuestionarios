import api from './api';

export const obtenerPreguntasBanco = async (filtros = {}) => {
    const params = {};
    if (filtros.materia) params.materia = filtros.materia;
    if (filtros.dificultad) params.dificultad = filtros.dificultad;
    if (filtros.buscar) params.buscar = filtros.buscar;

    const response = await api.get('/banco-preguntas', { params });
    return response.data;
};

export const obtenerMateriasBanco = async () => {
    const response = await api.get('/banco-preguntas/materias');
    return response.data;
};

export const obtenerPreguntaBancoPorId = async (id) => {
    const response = await api.get(`/banco-preguntas/${id}`);
    return response.data;
};

export const crearPreguntaBanco = async (preguntaData) => {
    const response = await api.post('/banco-preguntas', preguntaData);
    return response.data;
};

export const actualizarPreguntaBanco = async (id, preguntaData) => {
    const response = await api.put(`/banco-preguntas/${id}`, preguntaData);
    return response.data;
};

export const eliminarPreguntaBanco = async (id) => {
    await api.delete(`/banco-preguntas/${id}`);
};

