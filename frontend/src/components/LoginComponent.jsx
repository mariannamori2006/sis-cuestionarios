import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

export default function LoginComponent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            // Si el login es exitoso, redirigimos al dashboard del profesor/admin
            navigate('/dashboard');
        } catch (err) {
            // Gracias a tu @ControllerAdvice en Spring Boot, el mensaje del backend vendrá limpio
            const errorMsg = err.response?.data?.message || 'Credenciales inválidas o error en el servidor';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '80px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Iniciar Sesión - Nativatec</h2>
            <p style={{ color: '#666', fontSize: '14px' }}>Acceso exclusivo para Profesores y Administradores</p>

            {error && <div style={{ background: '#ffe6e6', color: '#d9534f', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>{error}</div>}

            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Correo Electrónico:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Contraseña:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', padding: '10px', background: '#003366', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    {loading ? 'Validando...' : 'Entrar al Sistema'}
                </button>
            </form>
        </div>
    );
}