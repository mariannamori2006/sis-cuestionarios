import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, googleLogin, verificarCodigo, reenviarCodigo } from '../services/authService';
import GoogleAuthButton from '../components/common/GoogleAuthButton';
import logoNativa from '../images/logoNativa.jpeg';
import loginBg from '../images/login-bg.jpg';
import useResponsive from '../hooks/useResponsive';
import {
    Mail,
    Lock,
    User,
    ArrowLeft,
    Eye,
    EyeOff,
    RotateCcw,
    ShieldCheck,
    Zap,
    GraduationCap,
    LogIn,
    UserPlus
} from 'lucide-react';

export default function LoginComponentV2() {
    const { isMobile } = useResponsive();
    const navigate = useNavigate();

    // Modo actual: Login o Registro
    const [isRegister, setIsRegister] = useState(false);

    // Campos de formulario
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [rol, setRol] = useState('PROFESOR');

    // Opciones: Recordar sesión y Ver contraseñas
    const [recordar, setRecordar] = useState(false);
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

    // OTP
    const [esperandoCodigo, setEsperandoCodigo] = useState(false);
    const [codigoOTP, setCodigoOTP] = useState('');
    const [verificando, setVerificando] = useState(false);
    const [reenviando, setReenviando] = useState(false);

    // Estados
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Efecto 3D interactivo con el cursor del mouse
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const savedEmail = localStorage.getItem('nativatec_saved_email');
        if (savedEmail) {
            setEmail(savedEmail);
            setRecordar(true);
        }
    }, []);

    const redireccionarSegunRol = (usuario) => {
        if (usuario?.rol === 'ADMIN') {
            navigate('/admin/dashboard');
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
            if (recordar) {
                localStorage.setItem('nativatec_saved_email', email.trim());
            } else {
                localStorage.removeItem('nativatec_saved_email');
            }
            redireccionarSegunRol(data);
        } catch (err) {
            const msg = err.response?.data?.message || 'Correo o contraseña incorrectos.';
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
                setSuccessMessage(data.message || 'Te enviamos un código de 6 dígitos a tu correo.');
            } else {
                if (recordar) localStorage.setItem('nativatec_saved_email', email.trim());
                setSuccessMessage('Cuenta creada exitosamente.');
                setTimeout(() => redireccionarSegunRol(data), 600);
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al registrar la cuenta.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerificarCodigo = async (e) => {
        e.preventDefault();
        if (!codigoOTP || codigoOTP.trim().length !== 6) {
            setError('Ingresa el código numérico de 6 dígitos.');
            return;
        }

        setError('');
        setSuccessMessage('');
        setVerificando(true);
        try {
            const data = await verificarCodigo(email.trim().toLowerCase(), codigoOTP.trim());
            setSuccessMessage('Cuenta verificada correctamente.');
            setTimeout(() => redireccionarSegunRol(data), 700);
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
            setSuccessMessage(res.message || 'Nuevo código enviado.');
        } catch (err) {
            setError('No se pudo reenviar el código.');
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
            redireccionarSegunRol(data);
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al autenticar con Google.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // Control de inclinación con el cursor
    const handleMouseMove = (e) => {
        if (isMobile) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
        setTilt({ x, y });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100vw',
            backgroundColor: '#090d16',
            color: '#f8fafc',
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '16px' : '32px 20px',
            boxSizing: 'border-box',
            position: 'relative',
            overflowX: 'hidden'
        }}>
            {/* ESTILOS Y ANIMACIONES CSS */}
            <style>{`
                @keyframes floatCard {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes floatBadge {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                .anim-badge-float {
                    animation: floatBadge 5s ease-in-out infinite;
                }
                .dark-input {
                    width: 100%;
                    padding: 11px 14px 11px 40px;
                    background: rgba(15, 23, 42, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 10px;
                    color: #ffffff;
                    font-size: 13.5px;
                    outline: none;
                    box-sizing: border-box;
                    transition: all 0.2s ease;
                }
                .dark-input:focus {
                    background: rgba(15, 23, 42, 0.95);
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
                }
                .dark-input::placeholder {
                    color: #64748b;
                }
            `}</style>

            {/* CONTENEDOR PRINCIPAL: OSCURO, MODERNO Y ELEGANTE */}
            <div style={{
                width: '100%',
                maxWidth: '1080px',
                minHeight: '620px',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1.1fr 1fr',
                overflow: 'hidden',
                position: 'relative'
            }}>

                {/* ============================================================== */}
                {/* LADO IZQUIERDO: FORMULARIO DE ACCESO Y REGISTRO */}
                {/* ============================================================== */}
                <div style={{
                    padding: isMobile ? '30px 20px' : '40px 42px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backgroundColor: 'rgba(11, 17, 32, 0.9)',
                    boxSizing: 'border-box'
                }}>
                    <div>
                        {/* Cabecera: Logo, Versión y Enlace Alumno */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ background: '#ffffff', borderRadius: '8px', padding: '4px 8px', display: 'flex', alignItems: 'center' }}>
                                    <img src={logoNativa} alt="NativaTec" style={{ height: '20px', objectFit: 'contain' }} />
                                </div>
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    background: 'rgba(59, 130, 246, 0.15)',
                                    color: '#60a5fa'
                                }}>
                                    v2.0
                                </span>
                            </div>

                            <button
                                onClick={() => navigate('/unirse')}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#34d399',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <GraduationCap size={15} />
                                Soy Alumno
                            </button>
                        </div>

                        {/* SELECTOR DE PESTAÑAS: INICIAR SESIÓN / CREAR CUENTA */}
                        {!esperandoCodigo && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                background: 'rgba(30, 41, 59, 0.6)',
                                padding: '3px',
                                borderRadius: '10px',
                                marginBottom: '20px',
                                border: '1px solid rgba(255, 255, 255, 0.06)'
                            }}>
                                <button
                                    type="button"
                                    onClick={() => { setIsRegister(false); setError(''); setSuccessMessage(''); }}
                                    style={{
                                        padding: '8px',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        border: 'none',
                                        transition: 'all 0.15s ease',
                                        background: !isRegister ? '#2563eb' : 'transparent',
                                        color: !isRegister ? '#ffffff' : '#94a3b8'
                                    }}
                                >
                                    Iniciar Sesión
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setIsRegister(true); setError(''); setSuccessMessage(''); }}
                                    style={{
                                        padding: '8px',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        border: 'none',
                                        transition: 'all 0.15s ease',
                                        background: isRegister ? '#2563eb' : 'transparent',
                                        color: isRegister ? '#ffffff' : '#94a3b8'
                                    }}
                                >
                                    Crear Cuenta
                                </button>
                            </div>
                        )}

                        {/* Título */}
                        <div style={{ marginBottom: '18px' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0', color: '#ffffff' }}>
                                {esperandoCodigo ? 'Verifica tu correo' : (isRegister ? 'Crear cuenta docente' : 'Bienvenido de nuevo')}
                            </h2>
                            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                                {esperandoCodigo
                                    ? `Ingresa el código enviado a ${email}`
                                    : (isRegister ? 'Ingresa tus datos para registrarte' : 'Ingresa tus credenciales para acceder')}
                            </p>
                        </div>

                        {/* Feedback */}
                        {error && (
                            <div style={{
                                padding: '10px 12px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#fca5a5',
                                fontSize: '12px',
                                marginBottom: '14px'
                            }}>
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div style={{
                                padding: '10px 12px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                color: '#6ee7b7',
                                fontSize: '12px',
                                marginBottom: '14px'
                            }}>
                                {successMessage}
                            </div>
                        )}

                        {/* FLUJO OTP */}
                        {esperandoCodigo ? (
                            <form onSubmit={handleVerificarCodigo} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                                        Código de Verificación (6 dígitos)
                                    </label>
                                    <input
                                        type="text"
                                        maxLength="6"
                                        placeholder="123456"
                                        value={codigoOTP}
                                        onChange={(e) => setCodigoOTP(e.target.value.replace(/\D/g, ''))}
                                        className="dark-input"
                                        style={{ letterSpacing: '5px', fontSize: '18px', textAlign: 'center', padding: '10px' }}
                                        required
                                        autoFocus
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={verificando}
                                    style={{
                                        padding: '11px',
                                        borderRadius: '10px',
                                        background: '#2563eb',
                                        color: '#ffffff',
                                        fontWeight: '700',
                                        fontSize: '13.5px',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {verificando ? 'Verificando...' : 'Confirmar y entrar'}
                                </button>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setEsperandoCodigo(false)}
                                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <ArrowLeft size={13} /> Volver
                                    </button>
                                    <button
                                        type="button"
                                        disabled={reenviando}
                                        onClick={handleReenviarCodigo}
                                        style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer' }}
                                    >
                                        {reenviando ? 'Reenviando...' : 'Reenviar código'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            /* FORMULARIO LOGIN / REGISTRO */
                            <form onSubmit={isRegister ? handleRegister : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>

                                {/* Nombre y Apellido en registro */}
                                {isRegister && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>Nombre</label>
                                            <div style={{ position: 'relative' }}>
                                                <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                                <input
                                                    type="text"
                                                    placeholder="Juan"
                                                    value={nombre}
                                                    onChange={(e) => setNombre(e.target.value)}
                                                    className="dark-input"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>Apellido</label>
                                            <div style={{ position: 'relative' }}>
                                                <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                                <input
                                                    type="text"
                                                    placeholder="Pérez"
                                                    value={apellido}
                                                    onChange={(e) => setApellido(e.target.value)}
                                                    className="dark-input"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Correo */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                                        Correo Electrónico
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                        <input
                                            type="email"
                                            placeholder="docente@nativatec.edu"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="dark-input"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Contraseña con ojito */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                                        Contraseña
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                        <input
                                            type={mostrarPassword ? "text" : "password"}
                                            placeholder="••••••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="dark-input"
                                            style={{ paddingRight: '38px' }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setMostrarPassword(!mostrarPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                color: '#94a3b8',
                                                cursor: 'pointer',
                                                padding: '2px'
                                            }}
                                            title={mostrarPassword ? "Ocultar" : "Mostrar"}
                                        >
                                            {mostrarPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirmar contraseña en registro */}
                                {isRegister && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                                            Confirmar Contraseña
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                            <input
                                                type={mostrarConfirmPassword ? "text" : "password"}
                                                placeholder="••••••••••••"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="dark-input"
                                                style={{ paddingRight: '38px' }}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
                                                style={{
                                                    position: 'absolute',
                                                    right: '10px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#94a3b8',
                                                    cursor: 'pointer',
                                                    padding: '2px'
                                                }}
                                                title={mostrarConfirmPassword ? "Ocultar" : "Mostrar"}
                                            >
                                                {mostrarConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Selector de Rol en registro */}
                                {isRegister && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                                            Rol
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                            <button
                                                type="button"
                                                onClick={() => setRol('PROFESOR')}
                                                style={{
                                                    padding: '7px',
                                                    borderRadius: '8px',
                                                    border: rol === 'PROFESOR' ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                                                    background: rol === 'PROFESOR' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                                                    color: rol === 'PROFESOR' ? '#93c5fd' : '#94a3b8',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Profesor
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setRol('ADMIN')}
                                                style={{
                                                    padding: '7px',
                                                    borderRadius: '8px',
                                                    border: rol === 'ADMIN' ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                                                    background: rol === 'ADMIN' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                                                    color: rol === 'ADMIN' ? '#93c5fd' : '#94a3b8',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Administrador
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Checkbox Recordar */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={recordar}
                                            onChange={(e) => setRecordar(e.target.checked)}
                                            style={{ accentColor: '#2563eb', cursor: 'pointer' }}
                                        />
                                        Recordar mis datos
                                    </label>
                                </div>

                                {/* Botón Iniciar Sesión / Registro */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '11px',
                                        borderRadius: '10px',
                                        background: '#2563eb',
                                        color: '#ffffff',
                                        fontWeight: '700',
                                        fontSize: '13.5px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        marginTop: '4px',
                                        transition: 'background 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#1d4ed8'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = '#2563eb'; }}
                                >
                                    {loading ? 'Procesando...' : (isRegister ? 'Registrar Cuenta' : 'Iniciar Sesión')}
                                </button>

                                {/* Separador */}
                                <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0', opacity: 0.5 }}>
                                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.2)' }} />
                                    <span style={{ padding: '0 8px', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>o</span>
                                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.2)' }} />
                                </div>

                                {/* Google Auth con soporte onGoogleSuccess */}
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <GoogleAuthButton
                                        onGoogleSuccess={handleGoogleSuccess}
                                        onSuccess={handleGoogleSuccess}
                                        onError={(err) => setError(err || 'Error con Google')}
                                        text={isRegister ? 'signup_with' : 'signin_with'}
                                    />
                                </div>
                            </form>
                        )}
                    </div>

                    <div style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', marginTop: '20px' }}>
                        {isRegister ? (
                            <span>¿Ya tienes cuenta? <b onClick={() => setIsRegister(false)} style={{ color: '#60a5fa', cursor: 'pointer' }}>Inicia sesión</b></span>
                        ) : (
                            <span>¿Aún no tienes cuenta? <b onClick={() => setIsRegister(true)} style={{ color: '#60a5fa', cursor: 'pointer' }}>Crear cuenta</b></span>
                        )}
                    </div>
                </div>

                {/* ============================================================== */}
                {/* LADO DERECHO: IMAGEN INTERACTIVA EN MOVIMIENTO 3D (TILT) */}
                {/* ============================================================== */}
                <div
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        padding: '40px 36px',
                        display: isMobile ? 'none' : 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        background: `linear-gradient(145deg, rgba(15, 23, 42, 0.88) 0%, rgba(9, 13, 22, 0.96) 100%), url(${loginBg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        perspective: '1000px',
                        overflow: 'hidden',
                        boxSizing: 'border-box'
                    }}
                >
                    {/* Encabezado del panel interactivo */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#93c5fd' }}>
                            NativaTec Suite
                        </span>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 9px',
                            borderRadius: '16px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#34d399',
                            fontSize: '11px',
                            fontWeight: '600'
                        }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                            En línea
                        </div>
                    </div>

                    {/* CENTRO: TARJETA 3D QUE SE MUEVE SUAVEMENTE CON EL MOUSE */}
                    <div style={{
                        margin: 'auto 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10
                    }}>
                        <div style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: '350px',
                            transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
                            transition: 'transform 0.12s ease-out',
                            transformStyle: 'preserve-3d'
                        }}>

                            {/* Tarjeta Central Traslúcida */}
                            <div style={{
                                backgroundColor: 'rgba(15, 23, 42, 0.82)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                borderRadius: '18px',
                                padding: '22px',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                                    </div>
                                    <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', background: 'rgba(59,130,246,0.2)', color: '#93c5fd' }}>
                                        EVALUACIÓN EN VIVO
                                    </span>
                                </div>

                                <h4 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 6px 0', color: '#ffffff' }}>
                                    Examen de Programación
                                </h4>
                                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                                    Calificación en tiempo real y autoguardado continuo de preguntas.
                                </p>

                                {/* Barra de progreso limpia */}
                                <div style={{ background: 'rgba(30,41,59,0.8)', height: '5px', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
                                    <div style={{ width: '88%', height: '100%', background: '#3b82f6', borderRadius: '10px' }} />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                                    <span>22 / 25 Alumnos</span>
                                    <span style={{ color: '#10b981', fontWeight: '600' }}>88% Finalizado</span>
                                </div>
                            </div>

                            {/* Badge Flotante Superior (Animado) */}
                            <div className="anim-badge-float" style={{
                                position: 'absolute',
                                top: '-18px',
                                right: '-16px',
                                background: '#10b981',
                                color: '#ffffff',
                                borderRadius: '10px',
                                padding: '8px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}>
                                <ShieldCheck size={16} />
                                <span style={{ fontSize: '11px', fontWeight: '700' }}>Código OTP seguro</span>
                            </div>

                            {/* Badge Flotante Inferior */}
                            <div style={{
                                position: 'absolute',
                                bottom: '-16px',
                                left: '-16px',
                                background: 'rgba(15, 23, 42, 0.95)',
                                border: '1px solid rgba(59, 130, 246, 0.35)',
                                color: '#ffffff',
                                borderRadius: '10px',
                                padding: '8px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
                            }}>
                                <Zap size={14} color="#60a5fa" />
                                <span style={{ fontSize: '11px', fontWeight: '700' }}>Autoguardado activo</span>
                            </div>

                        </div>
                    </div>

                    {/* Pie derecho */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, fontSize: '11px', color: '#64748b' }}>
                        <span>© 2026 NativaTec</span>
                        <span style={{ color: '#93c5fd' }}>Mueve el ratón para interactuar</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
