import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginComponent from './components/LoginComponent';
import DashboardComponent from './components/DashboardComponent';
import AdminDashboardComponent from './components/AdminDashboardComponent';
import ParticipanteLogin from './components/ParticipanteLogin';
import ResolverCuestionario from './components/ResolverCuestionario';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rutas de autenticación */}
                <Route path="/login" element={<LoginComponent />} />

                {/* Panel exclusivo para Profesores */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['PROFESOR']}>
                            <DashboardComponent />
                        </ProtectedRoute>
                    }
                />

                {/* Panel exclusivo para Administradores */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminDashboardComponent />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminDashboardComponent />
                        </ProtectedRoute>
                    }
                />

                {/* Rutas para alumnos / participantes */}
                <Route path="/alumno/login" element={<ParticipanteLogin />} />
                <Route path="/resolver/:id" element={<ResolverCuestionario />} />

                {/* Redirección por defecto */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;