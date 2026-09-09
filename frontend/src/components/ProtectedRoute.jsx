import React from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from '../services/authService';

export default function ProtectedRoute({ children }) {
    const user = getCurrentUser();

    // Redirigir al login si no hay token de ese usuario
    if (!user || !user.accessToken) {
        return <Navigate to="/login" replace />
    }

    // Si hay token, permitir acceso a la ruta protegida
    return children;
}