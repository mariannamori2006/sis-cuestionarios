import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/authService';

export default function LoginComponent() {
    const [isRegister, setIsRegister] = useState(false);

    // Campos de Login / Registro
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [rol, setRol] = useState('PROFESOR');

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const redireccionarSegunRol = (usuario) => {
        if (usuario.rol === 'ADMIN') {
            navigate('/admin/dashboard');
        } else if (usuario.rol === 'PROFESOR') {
            navigate('/dashboard');
        } else {
            navigate('/dashboard');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);
        try {
            const data = await login(email, password);
            redireccionarSegunRol(data);
        } catch (err) {
            const msg = err.response?.data?.message || 'Credenciales inválidas o error en el servidor';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            const data = await register(nombre, apellido, email, password, rol);
            setSuccessMessage('¡Cuenta creada con éxito! Redirigiendo...');
            setTimeout(() => {
                redireccionarSegunRol(data);
            }, 800);
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al registrar la cuenta. Verifica los datos.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const alternarModo = (modoRegistro) => {
        setIsRegister(modoRegistro);
        setError('');
        setSuccessMessage('');
    };

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#f1f5f9',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
        }}>
            {/* Panel lateral estético institucional */}
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
                        Accede al panel de control exclusivo para profesores y administradores para supervisar cuestionarios, auditorías y reportes.
                    </p>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Ciclo 2026-B • Nativatec Education
                </div>
            </div>

            {/* Formulario de Login / Registro */}
            <div style={{
                flex: '1',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px',
                overflowY: 'auto'
            }}>
                <div style={{
                    background: '#ffffff',
                    padding: '40px',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                    width: '100%',
                    maxWidth: '440px'
                }}>
                    {/* Switch / Pestañas superiores */}
                    <div style={{
                        display: 'flex',
                        background: '#f1f5f9',
                        padding: '4px',
                        borderRadius: '10px',
                        marginBottom: '24px'
                    }}>
                        <button
                            type="button"
                            onClick={() => alternarModo(false)}
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: 'none',
                                borderRadius: '8px',
                                background: !isRegister ? '#ffffff' : 'transparent',
                                color: !isRegister ? '#0f172a' : '#64748b',
                                fontWeight: '600',
                                fontSize: '13px',
                                cursor: 'pointer',
                                boxShadow: !isRegister ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            type="button"
                            onClick={() => alternarModo(true)}
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: 'none',
                                borderRadius: '8px',
                                background: isRegister ? '#ffffff' : 'transparent',
                                color: isRegister ? '#0f172a' : '#64748b',
                                fontWeight: '600',
                                fontSize: '13px',
                                cursor: 'pointer',
                                boxShadow: isRegister ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            Crear Cuenta
                        </button>
                    </div>

                    <h2 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '24px' }}>
                        {isRegister ? 'Crear Nueva Cuenta' : 'Iniciar Sesión'}
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
                        {isRegister
                            ? 'Completa tus datos para habilitar tu acceso institucional'
                            : 'Ingresa tus credenciales institucionales'}
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

                    {successMessage && (
                        <div style={{
                            background: '#dcfce7',
                            color: '#15803d',
                            padding: '12px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            marginBottom: '20px',
                            border: '1px solid #86efac'
                        }}>
                            {successMessage}
                        </div>
                    )}

                    {!isRegister ? (
                        /* FORMULARIO DE LOGIN */
                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ejemplo@nativatec.edu"
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
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
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
                                    marginTop: '8px',
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

                            <div style={{ textAlign: 'center', marginTop: '6px' }}>
                                <span style={{ fontSize: '13px', color: '#64748b' }}>
                                    ¿Aún no tienes cuenta?{' '}
                                    <button
                                        type="button"
                                        onClick={() => alternarModo(true)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#10b981',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            padding: 0,
                                            fontSize: '13px'
                                        }}
                                    >
                                        Regístrate aquí
                                    </button>
                                </span>
                            </div>
                        </form>
                    ) : (
                        /* FORMULARIO DE REGISTRO */
                        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        placeholder="Ej: Carlos"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            outline: 'none',
                                            fontSize: '13px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                                        Apellido *
                                    </label>
                                    <input
                                        type="text"
                                        value={apellido}
                                        onChange={(e) => setApellido(e.target.value)}
                                        placeholder="Ej: Ramírez"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            outline: 'none',
                                            fontSize: '13px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                                    Correo Electrónico *
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="profesor@nativatec.edu"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        outline: 'none',
                                        fontSize: '13px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                                    Tipo de Perfil / Rol
                                </label>
                                <select
                                    value={rol}
                                    onChange={(e) => setRol(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        outline: 'none',
                                        fontSize: '13px',
                                        backgroundColor: '#ffffff',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <option value="PROFESOR">Profesor (Crear y gestionar cuestionarios)</option>
                                    <option value="ADMIN">Administrador (Gestión total del sistema)</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                                        Contraseña *
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Mín. 6 carácteres"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            outline: 'none',
                                            fontSize: '13px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                                        Confirmar *
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repite contraseña"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            outline: 'none',
                                            fontSize: '13px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    marginTop: '10px',
                                    background: '#10b981',
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
                                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                            </button>

                            <div style={{ textAlign: 'center', marginTop: '6px' }}>
                                <span style={{ fontSize: '13px', color: '#64748b' }}>
                                    ¿Ya tienes cuenta?{' '}
                                    <button
                                        type="button"
                                        onClick={() => alternarModo(false)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#0f172a',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            padding: 0,
                                            fontSize: '13px'
                                        }}
                                    >
                                        Inicia sesión
                                    </button>
                                </span>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}