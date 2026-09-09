import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

//Inyectar token en cada peticion
api.interceptors.request.use(

    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.accessToken) {
            config.headers['Authorization'] = `Bearer ${user.accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;