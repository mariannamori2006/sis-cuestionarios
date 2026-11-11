import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, googleLogin, verificarCodigo, reenviarCodigo } from '../services/authService';
import GoogleAuthButton from '../components/common/GoogleAuthButton';
import logoNativa from '../images/logoNativa.jpeg';
import useResponsive from '../hooks/useResponsive';
import { Mail, Lock, User, LogIn, UserPlus, KeyRound, CheckCircle2, RotateCcw, ArrowLeft } from 'lucide-react';

export default function LoginComponent() {
    const { isMobile } = useResponsive();
    const [isRegister, setIsRegister] = useState(false);

    // Campos de Login / Registro
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [rol, setRol] = useState('PROFESOR');

    // Estados para la verificación de código OTP por correo
    const [esperandoCodigo, setEsperandoCodigo] = useState(false);
    const [codigoOTP, setCodigoOTP] = useState('');
    const [verificando, setVerificando] = useState(false);
    const [reenviando, setReenviando] = useState(false);

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
            if (data.requiereVerificacion) {
                setEsperandoCodigo(true);
                setCodigoOTP('');
                setSuccessMessage(data.message || 'Código de 6 dígitos enviado a tu correo.');
            } else {
                setSuccessMessage('¡Cuenta creada con éxito! Redirigiendo...');
                setTimeout(() => {
                    redireccionarSegunRol(data);
                }, 800);
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al registrar la cuenta. Verifica los datos.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerificarCodigo = async (e) => {
        e.preventDefault();
        if (!codigoOTP || codigoOTP.trim().length !== 6) {
            setError('Ingresa el código de verificación de 6 dígitos.');
            return;
        }

        setError('');
        setSuccessMessage('');
        setVerificando(true);
        try {
            const data = await verificarCodigo(email.trim().toLowerCase(), codigoOTP.trim());
            setSuccessMessage(data.message || '¡Cuenta verificada y activada con éxito! Redirigiendo...');
            setTimeout(() => {
                redireccionarSegunRol(data);
            }, 1000);
        } catch (err) {
            const msg = err.response?.data?.message || 'Código incorrecto o expirado.';
            setError(msg);
        } finally {
            setVerificando(false);
        }
    };

    const handleReenviarCodigo = async () => {
        setError('');
        setSuccessMessage('');
        setReenviando(true);
        try {
            const res = await reenviarCodigo(email.trim().toLowerCase());
            setSuccessMessage(res.message || 'Nuevo código enviado a tu correo.');
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al reenviar el código.';
            setError(msg);
        } finally {
            setReenviando(false);
        }
    };

    const handleGoogleSuccess = async (idToken) => {
        setError('');
        setSuccessMessage('');
        setLoading(true);
        try {
            const data = await googleLogin(idToken, isRegister ? rol : 'PROFESOR');
            setSuccessMessage(data.message || '¡Acceso correcto! Redirigiendo...');
            setTimeout(() => {
                redireccionarSegunRol(data);
            }, 700);
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al autenticar con Google. Intenta nuevamente.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const alternarModo = (modoRegistro) => {
        setIsRegister(modoRegistro);
        setEsperandoCodigo(false);
        setError('');
        setSuccessMessage('');
    };

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#f8fafc',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
        }}>
            {/* Panel lateral estético institucional (Oculto en celulares) */}
            <div style={{
                flex: '1.1',
                background: 'radial-gradient(circle at 10% 20%, #1e293b 0%, #0f172a 100%)',
                color: '#ffffff',
                padding: '60px 50px',
                display: isMobile ? 'none' : 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Header con Logo y Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '48px' }}>
                        <div style={{ background: '#ffffff', padding: '6px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
                            <img src={logoNativa} alt="NativaTec" style={{ height: '34px', objectFit: 'contain' }} />
                        </div>
                        <span style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '600',
                            letterSpacing: '0.04em',
                            color: '#93c5fd'
                        }}>
                            🎓 Ciclo Académico 2026-B
                        </span>
                    </div>

                    <h1 style={{ fontSize: '36px', fontWeight: '800', lineHeight: '1.25', marginBottom: '18px', letterSpacing: '-0.02em' }}>
                        Evaluaciones más ágiles,<br />
                        <span style={{ color: '#38bdf8' }}>resultados inmediatos.</span>
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', maxWidth: '480px', marginBottom: '40px' }}>
                        Plataforma integral para profesores y administradores: diseña cuestionarios interactivos, audita respuestas al instante y genera reportes consolidados.
                    </p>

                    {/* Features destacados */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '440px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            padding: '12px 16px',
                            borderRadius: '12px'
                        }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontSize: '18px', flexShrink: 0 }}>
                                ⚡
                            </div>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9' }}>Calificación y feedback automático</div>
                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Estadísticas y promedios actualizados en vivo.</div>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            padding: '12px 16px',
                            borderRadius: '12px'
                        }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', fontSize: '18px', flexShrink: 0 }}>
                                🛡️
                            </div>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9' }}>Modo seguro anti-fraude</div>
                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Detección de cambio de pestaña y control estricto de intentos.</div>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            padding: '12px 16px',
                            borderRadius: '12px'
                        }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', fontSize: '18px', flexShrink: 0 }}>
                                📊
                            </div>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9' }}>Auditoría y exportación a Excel</div>
                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Descarga actas oficiales de notas con un solo clic.</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ fontSize: '12px', color: '#64748b', position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
                    © 2026 Nativatec Education · SENATI. Todos los derechos reservados.
                </div>
            </div>

            {/* Formulario de Login / Registro */}
            <div style={{
                flex: '1',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: isMobile ? '20px 16px' : '40px',
                overflowY: 'auto'
            }}>
                <div style={{
                    background: '#ffffff',
                    padding: isMobile ? '28px 20px' : '40px 42px',
                    borderRadius: '20px',
                    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.07), 0 0 1px 1px rgba(0, 0, 0, 0.03)',
                    border: '1px solid #e2e8f0',
                    width: '100%',
                    maxWidth: '440px'
                }}>
                    {/* Logo visible en celulares */}
                    {isMobile && (
                        <div style={{ textAlign: 'center', marginBottom: '22px', display: 'flex', justifyContent: 'center' }}>
                            <img src={logoNativa} alt="NativaTec" style={{ height: '36px', objectFit: 'contain' }} />
                        </div>
                    )}
                    {esperandoCodigo ? (
                        /* PANTALLA DE VERIFICACIÓN DE CÓDIGO OTP (6 DÍGITOS) */
                        <form onSubmit={handleVerificarCodigo} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <div style={{ textAlign: 'center', padding: '10px 0' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '50%',
                                    backgroundColor: '#eff6ff',
                                    color: '#2563eb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px auto',
                                    border: '2px solid #bfdbfe'
                                }}>
                                    <KeyRound size={28} />
                                </div>
                                <h3 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>
                                    Verifica tu Correo
                                </h3>
                                <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
                                    Hemos enviado un código de 6 dígitos a: <br />
                                    <strong style={{ color: '#0f172a' }}>{email}</strong>
                                </p>
                            </div>

                            {error && (
                                <div style={{
                                    background: '#fee2e2',
                                    color: '#991b1b',
                                    padding: '12px 14px',
                                    borderRadius: '10px',
                                    fontSize: '13px',
                                    border: '1px solid #fca5a5'
                                }}>
                                    {error}
                                </div>
                            )}

                            {successMessage && (
                                <div style={{
                                    background: '#dcfce7',
                                    color: '#15803d',
                                    padding: '12px 14px',
                                    borderRadius: '10px',
                                    fontSize: '13px',
                                    border: '1px solid #86efac'
                                }}>
                                    {successMessage}
                                </div>
                            )}

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '8px', textAlign: 'center' }}>
                                    INGRESA EL CÓDIGO (OTP)
                                </label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={codigoOTP}
                                    onChange={(e) => setCodigoOTP(e.target.value.replace(/\D/g, ''))}
                                    placeholder="000000"
                                    required
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: '12px',
                                        border: '2px solid #3b82f6',
                                        outline: 'none',
                                        fontSize: isMobile ? '22px' : '28px',
                                        fontWeight: '800',
                                        letterSpacing: isMobile ? '5px' : '10px',
                                        textAlign: 'center',
                                        fontFamily: 'monospace',
                                        backgroundColor: '#f8fafc',
                                        color: '#1e40af',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <span style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', display: 'block', marginTop: '6px' }}>
                                    ⏱️ El código vence en 10 minutos. Revisa tu buzón de entrada o spam.
                                </span>
                            </div>

                            <button
                                type="submit"
                                disabled={verificando || codigoOTP.length !== 6}
                                style={{
                                    backgroundColor: codigoOTP.length === 6 ? '#10b981' : '#94a3b8',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '13px',
                                    borderRadius: '10px',
                                    fontWeight: '700',
                                    cursor: codigoOTP.length === 6 ? 'pointer' : 'not-allowed',
                                    fontSize: '14px',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: codigoOTP.length === 6 ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none'
                                }}
                            >
                                <CheckCircle2 size={18} /> {verificando ? 'Verificando...' : 'Verificar y Activar Cuenta'}
                            </button>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '6px' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEsperandoCodigo(false);
                                        setError('');
                                        setSuccessMessage('');
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#64748b',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}
                                >
                                    <ArrowLeft size={14} /> Corregir correo
                                </button>

                                <button
                                    type="button"
                                    onClick={handleReenviarCodigo}
                                    disabled={reenviando}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#2563eb',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <RotateCcw size={14} /> {reenviando ? 'Reenviando...' : 'Reenviar código'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            {/* Switch / Pestañas superiores */}
                            <div style={{
                                display: 'flex',
                                background: '#f1f5f9',
                                padding: '4px',
                                borderRadius: '12px',
                                marginBottom: '24px'
                            }}>
                        <button
                            type="button"
                            onClick={() => alternarModo(false)}
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: 'none',
                                borderRadius: '10px',
                                background: !isRegister ? '#ffffff' : 'transparent',
                                color: !isRegister ? '#0f172a' : '#64748b',
                                fontWeight: '700',
                                fontSize: '13px',
                                cursor: 'pointer',
                                boxShadow: !isRegister ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                                transition: 'all 0.2s ease'
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
                                borderRadius: '10px',
                                background: isRegister ? '#ffffff' : 'transparent',
                                color: isRegister ? '#0f172a' : '#64748b',
                                fontWeight: '700',
                                fontSize: '13px',
                                cursor: 'pointer',
                                boxShadow: isRegister ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Crear Cuenta
                        </button>
                    </div>

                    <h2 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.02em' }}>
                        {isRegister ? 'Crear Nueva Cuenta' : 'Iniciar Sesión'}
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px', lineHeight: '1.4' }}>
                        {isRegister
                            ? 'Completa tus datos para habilitar tu acceso institucional'
                            : 'Ingresa con tu correo institucional o personal'}
                    </p>

                    {error && (
                        <div style={{
                            background: '#fee2e2',
                            color: '#991b1b',
                            padding: '12px 14px',
                            borderRadius: '10px',
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
                            padding: '12px 14px',
                            borderRadius: '10px',
                            fontSize: '13px',
                            marginBottom: '20px',
                            border: '1px solid #86efac'
                        }}>
                            {successMessage}
                        </div>
                    )}

                    {/* Botón oficial de Google Identity (OAuth 2.0) */}
                    <div style={{ marginBottom: '16px' }}>
                        <GoogleAuthButton
                            onGoogleSuccess={handleGoogleSuccess}
                            onError={(msg) => setError(msg)}
                            text={isRegister ? 'signup_with' : 'signin_with'}
                            disabled={loading}
                        />
                    </div>

                    {/* Divisor estético */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        margin: '16px 0 20px 0',
                        color: '#94a3b8',
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em'
                    }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                        <span style={{ padding: '0 12px' }}>o continúa con correo</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                    </div>

                    {!isRegister ? (
                        /* FORMULARIO DE LOGIN */
                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                                    Correo Electrónico
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="ejemplo@gmail.com"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px 12px 40px',
                                            borderRadius: '10px',
                                            border: '1px solid #cbd5e1',
                                            outline: 'none',
                                            fontSize: '14px',
                                            boxSizing: 'border-box',
                                            transition: 'border 0.2s ease',
                                            backgroundColor: '#ffffff'
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                                    Contraseña
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px 12px 40px',
                                            borderRadius: '10px',
                                            border: '1px solid #cbd5e1',
                                            outline: 'none',
                                            fontSize: '14px',
                                            boxSizing: 'border-box',
                                            transition: 'border 0.2s ease',
                                            backgroundColor: '#ffffff'
                                        }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="interactive-card"
                                style={{
                                    marginTop: '8px',
                                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '13px',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.2)'
                                }}
                            >
                                <LogIn size={16} /> {loading ? 'Verificando...' : 'Entrar al Sistema'}
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
                                            color: '#059669',
                                            fontWeight: '700',
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
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                                        Nombre *
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input
                                            type="text"
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            placeholder="Ej: Carlos"
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px 10px 32px',
                                                borderRadius: '10px',
                                                border: '1px solid #cbd5e1',
                                                outline: 'none',
                                                fontSize: '13px',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
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
                                            borderRadius: '10px',
                                            border: '1px solid #cbd5e1',
                                            outline: 'none',
                                            fontSize: '13px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                                    Correo Electrónico *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="usuario@senati.pe o tu@correo.com"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px 10px 32px',
                                            borderRadius: '10px',
                                            border: '1px solid #cbd5e1',
                                            outline: 'none',
                                            fontSize: '13px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                                    ✓ Acepta correo institucional <strong>@senati.pe</strong> o correos personales válidos.
                                </span>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                                    Tipo de Perfil / Rol
                                </label>
                                <select
                                    value={rol}
                                    onChange={(e) => setRol(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '10px',
                                        border: '1px solid #cbd5e1',
                                        outline: 'none',
                                        fontSize: '13px',
                                        backgroundColor: '#ffffff',
                                        boxSizing: 'border-box',
                                        fontWeight: '600',
                                        color: '#1e293b'
                                    }}
                                >
                                    <option value="PROFESOR">Profesor (Crear y gestionar cuestionarios)</option>
                                    <option value="ADMIN">Administrador (Gestión total del sistema)</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
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
                                            borderRadius: '10px',
                                            border: '1px solid #cbd5e1',
                                            outline: 'none',
                                            fontSize: '13px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
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
                                            borderRadius: '10px',
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
                                className="interactive-card"
                                style={{
                                    marginTop: '10px',
                                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '13px',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
                                }}
                            >
                                <UserPlus size={16} /> {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
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
                                            fontWeight: '700',
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
                </>
            )}
                </div>
            </div>
        </div>
    );
}