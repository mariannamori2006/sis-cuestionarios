import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, googleLogin, verificarCodigo, reenviarCodigo } from '../services/authService';
import GoogleAuthButton from '../components/common/GoogleAuthButton';
import logoNativa from '../images/logoNativa.jpeg';
import useResponsive from '../hooks/useResponsive';
import {
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    GraduationCap,
    Sparkles,
    Shield,
    RotateCcw
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

    // Estados de feedback
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Efecto 3D de inclinación con el ratón
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const savedEmail = localStorage.getItem('nativatec_saved_email');
        if (savedEmail) {
            setEmail(savedEmail);
            setRecordar(true);
        }
    }, []);

    const handleMouseMove = (e) => {
        if (isMobile) return;
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const posX = (clientX - centerX) / centerX;
        const posY = (clientY - centerY) / centerY;
        setMousePos({ x: posX, y: posY });
    };

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

    return (
        <div
            onMouseMove={handleMouseMove}
            style={{
                minHeight: '100vh',
                width: '100vw',
                backgroundColor: '#07080f',
                color: '#f8fafc',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isMobile ? '16px' : '32px 40px',
                boxSizing: 'border-box'
            }}
        >
            {/* ESTILOS Y KEYFRAMES PARA LA ESCENA 3D */}
            <style>{`
                @keyframes orbitRotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes orbitCounterRotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(-360deg); }
                }
                @keyframes floatCard {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-6px); }
                }
                @keyframes pulseHexGlow {
                    0%, 100% { filter: drop-shadow(0 0 15px rgba(56, 189, 248, 0.45)) drop-shadow(0 0 35px rgba(139, 92, 246, 0.25)); }
                    50% { filter: drop-shadow(0 0 25px rgba(56, 189, 248, 0.8)) drop-shadow(0 0 50px rgba(139, 92, 246, 0.5)); }
                }
                @keyframes pulseRingCyan {
                    0%, 100% { opacity: 0.45; box-shadow: 0 0 20px rgba(56, 189, 248, 0.3), inset 0 0 20px rgba(56, 189, 248, 0.15); }
                    50% { opacity: 0.85; box-shadow: 0 0 35px rgba(56, 189, 248, 0.6), inset 0 0 35px rgba(56, 189, 248, 0.35); }
                }
                @keyframes starGlow {
                    0%, 100% { opacity: 0.25; transform: scale(0.8); }
                    50% { opacity: 0.9; transform: scale(1.2); }
                }

                .nexus-input-field {
                    width: 100%;
                    padding: 12px 14px 12px 42px;
                    background: rgba(18, 22, 36, 0.65);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    color: #ffffff;
                    font-size: 13.5px;
                    outline: none;
                    box-sizing: border-box;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .nexus-input-field:focus {
                    background: rgba(22, 27, 46, 0.95);
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25), 0 0 20px rgba(99, 102, 241, 0.15);
                }
                .nexus-input-field::placeholder {
                    color: #64748b;
                }

                .nexus-btn-primary {
                    width: 100%;
                    padding: 13px 20px;
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%);
                    border: none;
                    border-radius: 12px;
                    color: #ffffff;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.3);
                    transition: all 0.2s ease;
                }
                .nexus-btn-primary:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 12px 30px rgba(99, 102, 241, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.4);
                    filter: brightness(1.08);
                }
                .nexus-btn-primary:active:not(:disabled) {
                    transform: translateY(1px);
                    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
                }
                .nexus-btn-primary:disabled {
                    opacity: 0.65;
                    cursor: not-allowed;
                }

                .nexus-orbit-pill {
                    position: absolute;
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: rgba(14, 18, 32, 0.9);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6), 0 0 15px rgba(56, 189, 248, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(8px);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .nexus-orbit-pill:hover {
                    border-color: rgba(56, 189, 248, 0.5);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.8), 0 0 25px rgba(56, 189, 248, 0.45);
                }
            `}</style>

            {/* LUCES DE FONDO CÓSMICAS (NEBULA GLOW) */}
            <div style={{
                position: 'absolute',
                top: '-15%',
                left: '-10%',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.16) 0%, rgba(99, 102, 241, 0.05) 50%, transparent 70%)',
                filter: 'blur(70px)',
                pointerEvents: 'none',
                zIndex: 1
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-20%',
                left: '20%',
                width: '700px',
                height: '700px',
                background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(14, 165, 233, 0.03) 60%, transparent 75%)',
                filter: 'blur(80px)',
                pointerEvents: 'none',
                zIndex: 1
            }} />
            <div style={{
                position: 'absolute',
                top: '30%',
                right: '-5%',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, transparent 70%)',
                filter: 'blur(80px)',
                pointerEvents: 'none',
                zIndex: 1
            }} />

            {/* ESTRELLAS Y PARTÍCULAS FLOTANTES */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
                {[
                    { t: '12%', l: '8%', s: '3px', a: '2.5s' },
                    { t: '24%', l: '35%', s: '2px', a: '3.8s' },
                    { t: '78%', l: '14%', s: '4px', a: '4.2s' },
                    { t: '82%', l: '42%', s: '2px', a: '3.1s' },
                    { t: '15%', l: '75%', s: '3px', a: '2.9s' },
                    { t: '65%', l: '88%', s: '2px', a: '4.7s' },
                    { t: '45%', l: '5%', s: '3px', a: '3.5s' },
                    { t: '90%', l: '65%', s: '3px', a: '4.0s' }
                ].map((st, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            top: st.t,
                            left: st.l,
                            width: st.s,
                            height: st.s,
                            backgroundColor: '#38bdf8',
                            borderRadius: '50%',
                            boxShadow: '0 0 8px #38bdf8',
                            animation: `starGlow ${st.a} infinite ease-in-out`
                        }}
                    />
                ))}
            </div>

            {/* CONTENEDOR PRINCIPAL SPLIT EN 2 COLUMNAS */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                maxWidth: '1280px',
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1.15fr 0.95fr',
                gap: isMobile ? '36px' : '60px',
                alignItems: 'center'
            }}>

                {/* ========================================================================= */}
                {/* COLUMNA IZQUIERDA: ESCENA 3D NEXUS + TEXTO FUTURISTA                       */}
                {/* ========================================================================= */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMobile ? 'center' : 'flex-start',
                    textAlign: isMobile ? 'center' : 'left',
                    padding: isMobile ? '0 10px' : '0 20px',
                    transform: isMobile ? 'none' : `translate3d(${mousePos.x * 12}px, ${mousePos.y * 12}px, 0)`,
                    transition: 'transform 0.15s ease-out'
                }}>

                    {/* ESCENA DE ÓRBITAS Y NÚCLEO 3D */}
                    <div style={{
                        position: 'relative',
                        width: isMobile ? '280px' : '380px',
                        height: isMobile ? '220px' : '280px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {/* PERSPECTIVA DE PLANO INCLINADO 3D */}
                        <div style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            transform: 'perspective(900px) rotateX(68deg) rotateY(-14deg) rotateZ(12deg)',
                            transformStyle: 'preserve-3d',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {/* ÓRBITA EXTERIOR (AZUL / CYAN) */}
                            <div style={{
                                position: 'absolute',
                                width: isMobile ? '260px' : '340px',
                                height: isMobile ? '260px' : '340px',
                                borderRadius: '50%',
                                border: '1.5px solid rgba(56, 189, 248, 0.45)',
                                animation: 'pulseRingCyan 4s ease-in-out infinite'
                            }} />

                            {/* ÓRBITA INTERMEDIA (LÍNEA DISCONTINUA VIOLETA) */}
                            <div style={{
                                position: 'absolute',
                                width: isMobile ? '200px' : '260px',
                                height: isMobile ? '200px' : '260px',
                                borderRadius: '50%',
                                border: '1.5px dashed rgba(168, 85, 247, 0.4)',
                                boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)'
                            }} />

                            {/* ÓRBITA INTERIOR (SUAVE CYAN) */}
                            <div style={{
                                position: 'absolute',
                                width: isMobile ? '140px' : '180px',
                                height: isMobile ? '140px' : '180px',
                                borderRadius: '50%',
                                border: '1px solid rgba(56, 189, 248, 0.3)'
                            }} />
                        </div>

                        {/* NÚCLEO CENTRAL: HEXÁGONO 3D GLOWING */}
                        <div style={{
                            position: 'relative',
                            zIndex: 5,
                            animation: 'pulseHexGlow 3.5s ease-in-out infinite',
                            transform: 'translateY(-4px)'
                        }}>
                            <svg width="86" height="96" viewBox="0 0 74 84" fill="none">
                                <defs>
                                    <linearGradient id="nexusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#38bdf8" />
                                        <stop offset="50%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#a855f7" />
                                    </linearGradient>
                                    <linearGradient id="innerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#0f172a" />
                                        <stop offset="100%" stopColor="#070a14" />
                                    </linearGradient>
                                </defs>
                                {/* Hexágono exterior brillante */}
                                <polygon
                                    points="37,4 70,23 70,61 37,80 4,61 4,23"
                                    fill="url(#innerGrad)"
                                    stroke="url(#nexusGrad)"
                                    strokeWidth="3.2"
                                />
                                {/* Hexágono interior fino */}
                                <polygon
                                    points="37,13 62,27 62,57 37,71 12,57 12,27"
                                    fill="#080c18"
                                    stroke="rgba(56, 189, 248, 0.45)"
                                    strokeWidth="1.2"
                                />
                                {/* Letra N brillante con gradiente */}
                                <text
                                    x="37"
                                    y="52"
                                    textAnchor="middle"
                                    fill="#ffffff"
                                    fontSize="28"
                                    fontWeight="900"
                                    letterSpacing="1px"
                                    fontFamily="system-ui, sans-serif"
                                >
                                    N
                                </text>
                            </svg>
                        </div>

                    </div>

                    {/* GRAN TÍTULO CON GRADIENTE NEXUS */}
                    <h1 style={{
                        margin: '0 0 14px 0',
                        fontSize: isMobile ? '34px' : '52px',
                        fontWeight: '900',
                        lineHeight: 1.12,
                        letterSpacing: '-0.03em',
                        color: '#ffffff'
                    }}>
                        Crea. <br />
                        Aplica. <br />
                        <span style={{
                            background: 'linear-gradient(90deg, #a855f7 0%, #6366f1 50%, #38bdf8 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 0 25px rgba(168, 85, 247, 0.35))'
                        }}>
                            Evalúa.
                        </span>
                    </h1>

                    {/* FRASE CORTA SOBRE EL SISTEMA */}
                    <p style={{
                        margin: '0 0 24px 0',
                        fontSize: isMobile ? '14px' : '16px',
                        color: '#94a3b8',
                        lineHeight: 1.55,
                        maxWidth: '440px',
                        fontWeight: '400'
                    }}>
                        Diseña cuestionarios interactivos, gestiona evaluaciones en tiempo real y mide el aprendizaje de tus estudiantes al instante.
                    </p>

                    {/* ACCESO RÁPIDO PARA ALUMNOS */}
                    {/*<button
                        onClick={() => navigate('/unirse')}
                        style={{
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '10px',
                            padding: '9px 16px',
                            color: '#cbd5e1',
                            fontSize: '12.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            backdropFilter: 'blur(8px)',
                            transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.color = '#ffffff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#cbd5e1'; }}
                    >
                        <GraduationCap size={16} color="#38bdf8" />
                        <span>¿Eres alumno? Rinde tu evaluación aquí</span>
                        <ArrowRight size={14} />
                    </button>*/}
                </div>

                {/* ========================================================================= */}
                {/* COLUMNA DERECHA: TARJETA DE LOGIN CON GLASSMORPISM                       */}
                {/* ========================================================================= */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    transform: isMobile ? 'none' : `translate3d(${mousePos.x * -8}px, ${mousePos.y * -8}px, 0)`,
                    transition: 'transform 0.15s ease-out'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '440px',
                        backgroundColor: 'rgba(13, 16, 27, 0.78)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.09)',
                        padding: isMobile ? '28px 20px' : '36px 32px',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75), 0 0 35px rgba(99, 102, 241, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
                        boxSizing: 'border-box'
                    }}>

                        {/* TÍTULO Y SUBTÍTULO */}
                        <div style={{ marginBottom: '22px' }}>
                            <h2 style={{
                                margin: '0 0 6px 0',
                                fontSize: '26px',
                                fontWeight: '800',
                                letterSpacing: '-0.02em',
                                color: '#ffffff'
                            }}>
                                {esperandoCodigo ? 'Verifica tu cuenta' : (isRegister ? 'Crear cuenta' : 'Bienvenido(a)')}
                            </h2>
                            <p style={{
                                margin: 0,
                                fontSize: '13px',
                                color: '#94a3b8',
                                fontWeight: '400',
                                lineHeight: 1.45
                            }}>
                                {esperandoCodigo
                                    ? `Ingresa el código OTP enviado a ${email}`
                                    : (isRegister
                                        ? 'Regístrate para gestionar cuestionarios y exámenes en tiempo real.'
                                        : 'Inicia sesión para gestionar tus cuestionarios.')}
                            </p>
                        </div>

                        {/* ALERTAS DE ERROR O ÉXITO */}
                        {error && (
                            <div style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                                border: '1px solid rgba(239, 68, 68, 0.35)',
                                color: '#fca5a5',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                fontSize: '12.5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '18px'
                            }}>
                                <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                                <span>{error}</span>
                            </div>
                        )}

                        {successMessage && (
                            <div style={{
                                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                border: '1px solid rgba(16, 185, 129, 0.35)',
                                color: '#6ee7b7',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                fontSize: '12.5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '18px'
                            }}>
                                <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        {/* MODO OTP: VERIFICACIÓN DE CÓDIGO */}
                        {esperandoCodigo ? (
                            <form onSubmit={handleVerificarCodigo} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                                        Código de 6 dígitos
                                    </label>
                                    <input
                                        type="text"
                                        maxLength="6"
                                        placeholder="000000"
                                        value={codigoOTP}
                                        onChange={(e) => setCodigoOTP(e.target.value.replace(/\D/g, ''))}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            textAlign: 'center',
                                            letterSpacing: '8px',
                                            fontSize: '22px',
                                            fontWeight: '800',
                                            background: 'rgba(18, 22, 36, 0.8)',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            borderRadius: '12px',
                                            color: '#ffffff',
                                            outline: 'none',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={verificando}
                                    className="nexus-btn-primary"
                                >
                                    {verificando ? 'Verificando...' : 'Confirmar y entrar →'}
                                </button>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                    <button
                                        type="button"
                                        onClick={handleReenviarCodigo}
                                        disabled={reenviando}
                                        style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '12px', cursor: 'pointer', padding: 0 }}
                                    >
                                        {reenviando ? 'Reenviando...' : 'Reenviar código'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEsperandoCodigo(false)}
                                        style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '12px', cursor: 'pointer', padding: 0 }}
                                    >
                                        Volver al registro
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <>
                                {/* BOTÓN SOCIAL (GOOGLE OAUTH) */}
                                <div style={{ width: '100%', marginBottom: '20px' }}>
                                    <GoogleAuthButton onGoogleSuccess={handleGoogleSuccess} />
                                </div>

                                {/* DIVIDER: OR CONTINUE WITH EMAIL */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginBottom: '20px'
                                }}>
                                    <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
                                    <span style={{ fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.12em', color: '#64748b', textTransform: 'uppercase' }}>
                                        O CONTINUA CON TU CORREO ELECTRÓNICO
                                    </span>
                                    <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
                                </div>

                                {/* FORMULARIO PRINCIPAL */}
                                <form onSubmit={isRegister ? handleRegister : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                                    {/* CAMPOS DE NOMBRE Y APELLIDO EN REGISTRO */}
                                    {isRegister && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                                                    Nombre
                                                </label>
                                                <div style={{ position: 'relative' }}>
                                                    <User size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                                                    <input
                                                        type="text"
                                                        placeholder="Juan"
                                                        value={nombre}
                                                        onChange={(e) => setNombre(e.target.value)}
                                                        required
                                                        className="nexus-input-field"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                                                    Apellido
                                                </label>
                                                <div style={{ position: 'relative' }}>
                                                    <User size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                                                    <input
                                                        type="text"
                                                        placeholder="Pérez"
                                                        value={apellido}
                                                        onChange={(e) => setApellido(e.target.value)}
                                                        required
                                                        className="nexus-input-field"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* CAMPO CORREO ELECTRÓNICO */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                                            Correo Electrónico
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="nexus-input-field"
                                            />
                                        </div>
                                    </div>

                                    {/* CAMPO CONTRASEÑA */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                                            Contraseña
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                                            <input
                                                type={mostrarPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="nexus-input-field"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setMostrarPassword(!mostrarPassword)}
                                                style={{
                                                    position: 'absolute',
                                                    right: '12px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#64748b',
                                                    cursor: 'pointer',
                                                    padding: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* CAMPO CONFIRMAR CONTRASEÑA EN REGISTRO */}
                                    {isRegister && (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                                                Confirmar contraseña
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                                                <input
                                                    type={mostrarConfirmPassword ? 'text' : 'password'}
                                                    placeholder="Repite tu contraseña"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                    className="nexus-input-field"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
                                                    style={{
                                                        position: 'absolute',
                                                        right: '12px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#64748b',
                                                        cursor: 'pointer',
                                                        padding: '4px',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    {mostrarConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* SELECTOR DE ROL DISCRETO EN REGISTRO */}
                                    {isRegister && (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                                                Rol institucional
                                            </label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => setRol('PROFESOR')}
                                                    style={{
                                                        padding: '8px',
                                                        borderRadius: '8px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        border: rol === 'PROFESOR' ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                                                        backgroundColor: rol === 'PROFESOR' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.02)',
                                                        color: rol === 'PROFESOR' ? '#ffffff' : '#94a3b8'
                                                    }}
                                                >
                                                    Docente
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setRol('ADMIN')}
                                                    style={{
                                                        padding: '8px',
                                                        borderRadius: '8px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        border: rol === 'ADMIN' ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                                                        backgroundColor: rol === 'ADMIN' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.02)',
                                                        color: rol === 'ADMIN' ? '#ffffff' : '#94a3b8'
                                                    }}
                                                >
                                                    Administrador
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* OPCIONES: RECORDARME Y OLVIDÓ CONTRASEÑA */}
                                    {!isRegister && (
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginTop: '2px',
                                            fontSize: '12.5px'
                                        }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={recordar}
                                                    onChange={(e) => setRecordar(e.target.checked)}
                                                    style={{ accentColor: '#6366f1', cursor: 'pointer' }}
                                                />
                                                <span>Recordarme</span>
                                            </label>

                                            <button
                                                type="button"
                                                onClick={() => setError('Contacta al soporte institucional de NativaTec para restablecer tu contraseña.')}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#818cf8',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    padding: 0
                                                }}
                                            >
                                                ¿Olvidaste tu contraseña?
                                            </button>
                                        </div>
                                    )}

                                    {/* BOTÓN PRINCIPAL SIGN IN CON FLECHA */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="nexus-btn-primary"
                                        style={{ marginTop: '8px' }}
                                    >
                                        <span>{loading ? 'Procesando...' : (isRegister ? 'Crear cuenta' : 'Ingresar')}</span>
                                        {!loading && <ArrowRight size={16} />}
                                    </button>
                                </form>

                                {/* FOOTER: TOGGLE LOGIN / REGISTRO */}
                                <div style={{
                                    textAlign: 'center',
                                    marginTop: '22px',
                                    paddingTop: '16px',
                                    borderTop: '1px solid rgba(255, 255, 255, 0.07)',
                                    fontSize: '13px',
                                    color: '#94a3b8'
                                }}>
                                    {isRegister ? (
                                        <span>
                                            ¿Ya tienes cuenta?{' '}
                                            <button
                                                type="button"
                                                onClick={() => { setIsRegister(false); setError(''); setSuccessMessage(''); }}
                                                style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                                            >
                                                Iniciar Sesión
                                            </button>
                                        </span>
                                    ) : (
                                        <span>
                                            ¿No tienes una cuenta?{' '}
                                            <button
                                                type="button"
                                                onClick={() => { setIsRegister(true); setError(''); setSuccessMessage(''); }}
                                                style={{ background: 'transparent', border: 'none', color: '#a855f7', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                                            >
                                                Crear cuenta
                                            </button>
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
