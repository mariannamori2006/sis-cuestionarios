import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/authService';
import { obtenerCuestionarios } from '../services/cuestionarioService';

export default function DashboardComponent() {
    const navigate = useNavigate();
    const user = getCurrentUser();

    // Estados para los cuestionarios
    const [cuestionarios, setCuestionarios] = useState([]);

    useEffect(() => {
        obtenerCuestionarios()
            .then(data => setCuestionarios(data))
            .catch(err => console.error("Error al cargar cuestionarios:", err));
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '20px' }}>
                <h2>Dashboard - Cuestionarios</h2>
                <button
                    onClick={handleLogout}
                    style={{ padding: '8px 16px', background: '#d9534f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}