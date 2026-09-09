import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth/';

export const login = async (email, password) => {
    const response = await axios.post(API_URL + 'login', { email, password });
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