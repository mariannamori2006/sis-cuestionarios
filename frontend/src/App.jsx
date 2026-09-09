import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginComponent from './components/LoginComponent';
import DashboardComponent from './components/DashboardComponent';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <Routes>
                {/* Ruta pública para iniciar sesión */}
                <Route path="/login" element={<LoginComponent />} />

                {/*Ruta para usuarios autenticados */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardComponent />
                        </ProtectedRoute>
                    }
                />

                {/* Redirigir cualquier otra ruta al login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;