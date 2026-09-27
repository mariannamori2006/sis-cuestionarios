import React from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from '../services/authService';

export default function ProtectedRoute({ children, allowedRoles }) {
    const user = getCurrentUser();

    // Redirigir al login si no hay token de ese usuario
    if (!user || !user.accessToken) {
        return <Navigate to="/login" replace />;
    }

    // Si se especificaron roles permitidos y el usuario no tiene ninguno de ellos
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
        if (user.rol === 'ADMIN') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        if (user.rol === 'PROFESOR') {
            return <Navigate to="/dashboard" replace />;
        }
        return <Navigate to="/login" replace />;
    }

    // Si tiene token y rol autorizado, permitir acceso a la ruta protegida
    return children;
}