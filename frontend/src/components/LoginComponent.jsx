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
            navigate('/dashboard');
        } catch (err) {
            setError('Credenciales inválidas o error en el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#f1f5f9',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
        }}>
            {/* Panel lateral estético inspirando el dashboard */}
            <div style={{
                flex: '1',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                padding: '60px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
                        <div style={{ background: '#10b981', padding: '10px', borderRadius: '10px', fontWeight: 'bold' }}>N</div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '20px', letterSpacing: '0.5px' }}>nativatec</h2>
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>.cuestionarios</span>
                        </div>
                    </div>
                    <h1 style={{ fontSize: '38px', lineHeight: '1.2', marginBottom: '20px' }}>
                        Gestión inteligente de evaluaciones académicas.
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.5' }}>
                        Accede al panel de control exclusivo para profesores y administradores para supervisar cuestionarios y reportes.
                    </p>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Ciclo 2026-B • Nativatec Education
                </div>
            </div>

            {/* Formulario de Login */}
            <div style={{
                flex: '1',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px'
            }}>
                <div style={{
                    background: '#ffffff',
                    padding: '40px',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                    width: '100%',
                    maxWidth: '420px'
                }}>
                    <h2 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '24px' }}>Iniciar Sesión</h2>
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '30px' }}>
                        Ingresa tus credenciales institucionales
                    </p>

                    {error && (
                        <div style={{
                            background: '#fee2e2',
                            color: '#991b1b',
                            padding: '12px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            marginBottom: '20px',
                            border: '1px solid #fca5a5'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="profesor@nativatec.edu"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e1',
                                    outline: 'none',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                                Contraseña
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e1',
                                    outline: 'none',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: '10px',
                                background: '#0f172a',
                                color: '#ffffff',
                                border: 'none',
                                padding: '12px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                        >
                            {loading ? 'Verificando...' : 'Entrar al Sistema'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}