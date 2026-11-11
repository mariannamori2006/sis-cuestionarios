import api from './api';

export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.accessToken) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

export const register = async (nombre, apellido, email, password, rol = 'PROFESOR') => {
    const response = await api.post('/auth/register', {
        nombre,
        apellido,
        email,
        password,
        rol
    });
    if (response.data.accessToken) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

export const verificarCodigo = async (email, codigo) => {
    const response = await api.post('/auth/verificar-codigo', { email, codigo });
    if (response.data.accessToken) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

export const reenviarCodigo = async (email) => {
    const response = await api.post('/auth/reenviar-codigo', { email });
    return response.data;
};

export const googleLogin = async (idToken, rol = 'PROFESOR') => {
    const response = await api.post('/auth/google', {
        idToken,
        rol
    });
    if (response.data.accessToken) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('user');
};

export const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};