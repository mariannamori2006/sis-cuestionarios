import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginComponent from './views/LoginComponent';
import LoginComponentV2 from './views/LoginComponentV2';
import DashboardComponent from './views/DashboardComponent';
import AdminDashboardComponent from './views/AdminDashboardComponent';
import ParticipanteLogin from './views/ParticipanteLogin';
import ResolverCuestionario from './views/ResolverCuestionario';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rutas de autenticación */}
                <Route path="/login" element={<LoginComponentV2 />} />
                <Route path="/login-v1" element={<LoginComponent />} />
                <Route path="/login-v2" element={<LoginComponentV2 />} />

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
                <Route path="/unirse" element={<ParticipanteLogin />} />
                <Route path="/evaluacion" element={<ParticipanteLogin />} />
                <Route path="/alumno" element={<ParticipanteLogin />} />
                <Route path="/alumno/login" element={<ParticipanteLogin />} />
                <Route path="/resolver/:id" element={<ResolverCuestionario />} />

                {/* Redirección por defecto */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;