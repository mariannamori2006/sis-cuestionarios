import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';
import logoNativa from '../images/logoNativa.jpeg';
import useResponsive from '../hooks/useResponsive';
import {
    User,
    KeyRound,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    BookOpen,
    Clock,
    RotateCcw,
    Users,
    Sparkles,
    ShieldCheck,
    Award,
    Check,
    GraduationCap,
    Zap
} from 'lucide-react';
import { verificarDisponibilidadCuestionario } from '../services/cuestionarioService';

export default function ParticipanteLogin() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isMobile } = useResponsive();
    const inputPinRef = useRef(null);

    // Paso 1: Ingreso del PIN de 6 dígitos con casillas interactivas
    // Paso 2: Identificación con avatar dinámico y datos de examen
    const [paso, setPaso] = useState(1);
    const [codigoAcceso, setCodigoAcceso] = useState('');
    const [nombreParticipante, setNombreParticipante] = useState(sessionStorage.getItem('nombreParticipante') || '');
    const [grupoParticipante, setGrupoParticipante] = useState(sessionStorage.getItem('grupoParticipante') || '');

    const [cuestionario, setCuestionario] = useState(null);
    const [disponibilidad, setDisponibilidad] = useState(null);
    const [validando, setValidando] = useState(false);
    const [error, setError] = useState('');

    // Detección automática de PIN desde URL (ej: ?pin=123456 o ?codigo=123456)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const pinParam = params.get('pin') || params.get('codigo');
        if (pinParam && pinParam.trim().length >= 6) {
            const limpio = pinParam.trim().replace(/[^0-9]/g, '').slice(0, 6);
            setCodigoAcceso(limpio);
            verificarCodigo(limpio);
        }
    }, [location.search]);

    // Foco automático en el input al estar en el paso 1
    useEffect(() => {
        if (paso === 1) {
            setTimeout(() => inputPinRef.current?.focus(), 150);
        }
    }, [paso]);

    const verificarCodigo = async (codigoParaVerificar) => {
        const codigo = (codigoParaVerificar !== undefined ? codigoParaVerificar : codigoAcceso).trim();
        if (!codigo) {
            setError('Por favor, ingresa el código numérico del cuestionario.');
            return;
        }

        try {
            setValidando(true);
            setError('');

            const response = await api.get(`/cuestionarios/resolver/${codigo}`);
            if (response.data && response.data.id) {
                // Verificar restricciones de disponibilidad
                try {
                    const disp = await verificarDisponibilidadCuestionario(response.data.id, '');
                    setDisponibilidad(disp);
                    if (!disp.disponible && (disp.codigoEstado === 'NO_INICIADO' || disp.codigoEstado === 'FINALIZADO')) {
                        setError(disp.mensaje);
                        return;
                    }
                } catch (e) {
                    console.warn("No se pudo verificar disponibilidad:", e);
                }

                setCuestionario(response.data);
                setPaso(2); // Avanzar al paso 2 con animación
            } else {
                setError('No se encontró ningún cuestionario activo con ese código.');
            }
        } catch (err) {
            console.error("Error al validar código:", err);
            setError('El código ingresado no existe o no está activo. Verifica los 6 dígitos con tu profesor.');
        } finally {
            setValidando(false);
        }
    };

    const handleValidarCodigo = (e) => {
        e.preventDefault();
        verificarCodigo();
    };

    const handleComenzarExamen = async (e) => {
        e.preventDefault();
        if (!nombreParticipante.trim()) {
            setError('Por favor ingresa tu nombre y apellido para continuar.');
            return;
        }

        if (!cuestionario) {
            setError('Sesión expirada. Por favor valida el código nuevamente.');
            setPaso(1);
            return;
        }

        try {
            setValidando(true);
            setError('');

            const disp = await verificarDisponibilidadCuestionario(cuestionario.id, nombreParticipante.trim());
            if (!disp.disponible) {
                setError(disp.mensaje);
                return;
            }
        } catch (e) {
            console.warn("Error en verificación de intentos:", e);
        } finally {
            setValidando(false);
        }

        sessionStorage.setItem('nombreParticipante', nombreParticipante.trim());
        sessionStorage.setItem('grupoParticipante', (grupoParticipante || '').trim());

        const rutaDestino = cuestionario.codigoAcceso || cuestionario.id;
        navigate(`/resolver/${rutaDestino}`);
    };

    // Generar iniciales dinámicas para avatar del estudiante
    const obtenerIniciales = (nombre) => {
        if (!nombre || !nombre.trim()) return '🎓';
        const partes = nombre.trim().split(' ').filter(Boolean);
        if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
        return (partes[0][0] + partes[1][0]).toUpperCase();
    };

    return (
        <div style={{
            position: 'relative',
            display: 'flex',
            minHeight: '100vh',
            width: '100vw',
            background: 'radial-gradient(ellipse at 50% 20%, #1e293b 0%, #090e17 100%)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: isMobile ? '16px 12px' : '28px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
        }}>
            {/* ESTILOS Y KEYFRAMES PARA ANIMACIONES VIVAS Y MODERNAS */}
            <style>{`
                @keyframes floatOrb1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(40px, -30px) scale(1.12); }
                }
                @keyframes floatOrb2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(-45px, 35px) scale(1.15); }
                }
                @keyframes floatOrb3 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(25px, 30px) scale(1.08); }
                }
                @keyframes floatShape {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-12px) rotate(6deg); }
                }
                @keyframes blinkCursor {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                @keyframes digitPop {
                    0% { transform: scale(0.65); opacity: 0; }
                    70% { transform: scale(1.15); }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes gradientBar {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes pulseStart {
                    0%, 100% { box-shadow: 0 4px 18px rgba(16, 185, 129, 0.45); }
                    50% { box-shadow: 0 8px 28px rgba(16, 185, 129, 0.7); transform: translateY(-1px); }
                }
                .btn-comenzar-pulse:hover {
                    animation: pulseStart 1.5s infinite ease-in-out;
                }
            `}</style>

            {/* ORBES AMBIENTALES LUMINOSOS DE FONDO (ANIMADOS) */}
            <div style={{
                position: 'absolute',
                top: '5%',
                right: '12%',
                width: '380px',
                height: '380px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.35) 0%, rgba(59, 130, 246, 0.05) 70%, transparent 100%)',
                filter: 'blur(60px)',
                pointerEvents: 'none',
                animation: 'floatOrb1 14s infinite ease-in-out'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '8%',
                left: '10%',
                width: '420px',
                height: '420px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.28) 0%, rgba(5, 150, 105, 0.05) 70%, transparent 100%)',
                filter: 'blur(70px)',
                pointerEvents: 'none',
                animation: 'floatOrb2 16s infinite ease-in-out'
            }} />
            <div style={{
                position: 'absolute',
                top: '45%',
                left: '50%',
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)',
                filter: 'blur(65px)',
                pointerEvents: 'none',
                transform: 'translate(-50%, -50%)',
                animation: 'floatOrb3 18s infinite ease-in-out'
            }} />

            {/* ELEMENTOS DECORATIVOS DIDÁCTICOS FLOTANTES (SUTILES EN FONDO) */}
            <div style={{ position: 'absolute', top: '14%', left: '12%', color: 'rgba(255, 255, 255, 0.08)', animation: 'floatShape 8s infinite ease-in-out', pointerEvents: 'none' }}>
                <GraduationCap size={48} />
            </div>
            <div style={{ position: 'absolute', bottom: '16%', right: '14%', color: 'rgba(255, 255, 255, 0.08)', animation: 'floatShape 10s infinite ease-in-out 1s', pointerEvents: 'none' }}>
                <Sparkles size={44} />
            </div>
            <div style={{ position: 'absolute', top: '70%', left: '8%', color: 'rgba(255, 255, 255, 0.07)', animation: 'floatShape 9s infinite ease-in-out 2s', pointerEvents: 'none' }}>
                <Award size={40} />
            </div>
            <div style={{ position: 'absolute', top: '22%', right: '8%', color: 'rgba(255, 255, 255, 0.07)', animation: 'floatShape 11s infinite ease-in-out 3s', pointerEvents: 'none' }}>
                <Zap size={38} />
            </div>

            {/* TARJETA PRINCIPAL DEL PORTAL (GLASSMORPHISM CON SOMBRA ELEVADA) */}
            <div
                className="animate-scale-up"
                style={{
                    position: 'relative',
                    backgroundColor: '#ffffff',
                    borderRadius: '26px',
                    width: '100%',
                    maxWidth: '460px',
                    padding: isMobile ? '32px 22px' : '38px 34px',
                    boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.15)',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    zIndex: 1
                }}
            >
                {/* LÍNEA DE GRADIENTE ANIMADA EN EL TOPE DE LA TARJETA */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #3b82f6, #10b981, #8b5cf6, #3b82f6)',
                    backgroundSize: '200% 100%',
                    animation: 'gradientBar 4s infinite linear'
                }} />

                {/* LOGO INSTITUCIONAL + TÍTULO */}
                <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                    <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'center' }}>
                        <div style={{
                            background: '#f8fafc',
                            padding: '8px 18px',
                            borderRadius: '16px',
                            border: '1px solid #e2e8f0',
                            display: 'inline-flex',
                            alignItems: 'center',
                            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
                            transition: 'transform 0.2s ease'
                        }}>
                            <img src={logoNativa} alt="NativaTec" style={{ height: '32px', objectFit: 'contain' }} />
                        </div>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <h2 style={{ margin: 0, fontSize: '23px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
                            Portal de Evaluaciones
                        </h2>
                        <Sparkles size={18} color="#f59e0b" />
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                        {paso === 1
                            ? 'Ingresa el código PIN proporcionado por tu docente'
                            : 'Ingresa tus datos para comenzar la evaluación'}
                    </p>
                </div>

                {/* STEPPER ANIMADO DE PROGRESO */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    marginBottom: '24px',
                    padding: '8px 14px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: paso === 1 ? '#2563eb' : '#10b981'
                    }}>
                        <span style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            backgroundColor: paso === 1 ? '#2563eb' : '#10b981',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: '800',
                            boxShadow: paso === 1 ? '0 2px 8px rgba(37,99,235,0.45)' : 'none',
                            transition: 'all 0.25s ease'
                        }}>
                            {paso > 1 ? '✓' : '1'}
                        </span>
                        <span>Código PIN</span>
                    </div>

                    <div style={{
                        width: '36px',
                        height: '2.5px',
                        borderRadius: '2px',
                        backgroundColor: paso === 2 ? '#10b981' : '#cbd5e1',
                        transition: 'background-color 0.3s ease'
                    }} />

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: paso === 2 ? '#2563eb' : '#94a3b8'
                    }}>
                        <span style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            backgroundColor: paso === 2 ? '#2563eb' : '#e2e8f0',
                            color: paso === 2 ? '#ffffff' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: '800',
                            boxShadow: paso === 2 ? '0 2px 8px rgba(37,99,235,0.45)' : 'none',
                            transition: 'all 0.25s ease'
                        }}>
                            2
                        </span>
                        <span>Identificación</span>
                    </div>
                </div>

                {/* MENSAJE DE ERROR AMIGABLE */}
                {error && (
                    <div className="animate-fade-in" style={{
                        backgroundColor: '#fff1f2',
                        color: '#9f1239',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        marginBottom: '18px',
                        border: '1px solid #fecdd3',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        boxShadow: '0 2px 6px rgba(225, 29, 72, 0.06)'
                    }}>
                        <AlertCircle size={18} color="#e11d48" style={{ flexShrink: 0, marginTop: '1px' }} />
                        <span style={{ lineHeight: '1.4' }}>{error}</span>
                    </div>
                )}

                {/* PASO 1: CASILLAS INTERACTIVAS Y DINÁMICAS PARA EL CÓDIGO PIN */}
                {paso === 1 && (
                    <form onSubmit={handleValidarCodigo} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '11.5px',
                                fontWeight: '700',
                                color: '#475569',
                                marginBottom: '12px',
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                                textAlign: 'center'
                            }}>
                                Ingresa el código PIN (6 dígitos)
                            </label>

                            {/* CASILLAS VISUALES INTERACTIVAS PARA LOS DÍGITOS */}
                            <div
                                onClick={() => inputPinRef.current?.focus()}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: isMobile ? '8px' : '10px',
                                    marginBottom: '10px',
                                    cursor: 'text'
                                }}
                            >
                                {[0, 1, 2, 3, 4, 5].map((idx) => {
                                    const digito = codigoAcceso[idx];
                                    const esSiguiente = codigoAcceso.length === idx;
                                    const estaLleno = Boolean(digito);

                                    return (
                                        <div
                                            key={idx}
                                            style={{
                                                width: isMobile ? '46px' : '54px',
                                                height: isMobile ? '58px' : '64px',
                                                borderRadius: '14px',
                                                backgroundColor: estaLleno ? '#ffffff' : esSiguiente ? '#eff6ff' : '#f8fafc',
                                                border: estaLleno
                                                    ? '2px solid #2563eb'
                                                    : esSiguiente
                                                        ? '2px solid #3b82f6'
                                                        : '2px solid #e2e8f0',
                                                boxShadow: esSiguiente
                                                    ? '0 0 0 4px rgba(37, 99, 235, 0.15)'
                                                    : estaLleno
                                                        ? '0 4px 14px rgba(37, 99, 235, 0.12)'
                                                        : 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: isMobile ? '24px' : '28px',
                                                fontWeight: '800',
                                                color: '#0f172a',
                                                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                                                transform: estaLleno ? 'scale(1.03)' : 'scale(1)'
                                            }}
                                        >
                                            {estaLleno ? (
                                                <span style={{ animation: 'digitPop 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                                                    {digito}
                                                </span>
                                            ) : esSiguiente ? (
                                                <span style={{ animation: 'blinkCursor 1s infinite', color: '#2563eb', fontWeight: '300' }}>
                                                    |
                                                </span>
                                            ) : (
                                                <span style={{ color: '#cbd5e1', fontSize: '16px' }}>•</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* INPUT OCULTO CON CONTROL TOTAL DEL TECLADO MÓVIL Y FÍSICO */}
                            <input
                                ref={inputPinRef}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={codigoAcceso}
                                onChange={(e) => {
                                    const limpio = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                                    setCodigoAcceso(limpio);
                                }}
                                style={{
                                    position: 'absolute',
                                    opacity: 0,
                                    pointerEvents: 'none',
                                    height: 0,
                                    width: 0
                                }}
                            />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', padding: '0 4px' }}>
                                <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                                    {codigoAcceso.length}/6 dígitos ingresados
                                </span>
                                {codigoAcceso && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCodigoAcceso('');
                                            inputPinRef.current?.focus();
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#ef4444',
                                            fontSize: '11.5px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            padding: 0
                                        }}
                                    >
                                        Borrar código
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* BOTÓN DE ACCIÓN CON EFECTO ELEVADO */}
                        <button
                            type="submit"
                            disabled={validando || codigoAcceso.length < 6}
                            style={{
                                background: codigoAcceso.length === 6
                                    ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                                    : '#e2e8f0',
                                color: codigoAcceso.length === 6 ? '#ffffff' : '#94a3b8',
                                border: 'none',
                                padding: '14px',
                                borderRadius: '14px',
                                fontWeight: '700',
                                cursor: codigoAcceso.length === 6 && !validando ? 'pointer' : 'default',
                                fontSize: '14.5px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: codigoAcceso.length === 6 ? '0 6px 18px rgba(37, 99, 235, 0.35)' : 'none',
                                transition: 'all 0.2s ease',
                                transform: codigoAcceso.length === 6 && !validando ? 'translateY(-1px)' : 'none'
                            }}
                        >
                            {validando ? (
                                <>Validando con el servidor...</>
                            ) : (
                                <>
                                    Continuar al examen <ArrowRight size={17} />
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* PASO 2: RESUMEN DEL EXAMEN + IDENTIFICACIÓN DEL ESTUDIANTE */}
                {paso === 2 && cuestionario && (
                    <form onSubmit={handleComenzarExamen} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* TARJETA ELEGANTE Y COMPACTA DEL CUESTIONARIO */}
                        <div style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '14px',
                            padding: '14px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    color: '#64748b',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase'
                                }}>
                                    Cuestionario Seleccionado
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setPaso(1)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#2563eb',
                                        fontSize: '11.5px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        padding: '2px 4px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <RotateCcw size={11} /> Cambiar PIN
                                </button>
                            </div>

                            <h3 style={{ margin: '2px 0 0 0', fontSize: '16.5px', fontWeight: '800', color: '#0f172a', lineHeight: '1.3' }}>
                                {cuestionario.titulo}
                            </h3>

                            {/* LÍNEA DE DETALLES LIMPIA Y SIN SATURACIÓN */}
                            <div style={{ fontSize: '12.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span>{cuestionario.materia || 'General'}</span>
                                <span>•</span>
                                <span>{cuestionario.preguntas?.length || 0} preguntas</span>
                                <span>•</span>
                                <span>{cuestionario.tiempoLimiteMinutos > 0 ? `${cuestionario.tiempoLimiteMinutos} min` : 'Sin límite'}</span>
                                {cuestionario.modoSeguro && (
                                    <>
                                        <span>•</span>
                                        <span style={{ color: '#e11d48', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                            <ShieldCheck size={12} /> Modo seguro
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* INPUT DEL NOMBRE DEL ESTUDIANTE */}
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                                Tu Nombre y Apellido <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    value={nombreParticipante}
                                    onChange={(e) => setNombreParticipante(e.target.value)}
                                    placeholder="Ej: Sofía Ramírez"
                                    autoFocus
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px 12px 40px',
                                        borderRadius: '12px',
                                        border: '1.5px solid #cbd5e1',
                                        outline: 'none',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#0f172a',
                                        backgroundColor: '#ffffff',
                                        boxSizing: 'border-box',
                                        transition: 'all 0.15s ease'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#2563eb';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#cbd5e1';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </div>

                        {/* GRUPO / SECCIÓN ACADÉMICA */}
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                                Grupo o Sección <span style={{ fontSize: '11px', fontWeight: '500', color: '#94a3b8' }}>(Opcional)</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Users size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                                {cuestionario?.gruposPermitidos ? (
                                    <select
                                        value={grupoParticipante}
                                        onChange={(e) => setGrupoParticipante(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px 12px 40px',
                                            borderRadius: '12px',
                                            border: '1.5px solid #cbd5e1',
                                            outline: 'none',
                                            fontSize: '13.5px',
                                            fontWeight: '600',
                                            color: '#0f172a',
                                            backgroundColor: '#ffffff',
                                            boxSizing: 'border-box',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="">-- Selecciona tu aula / sección --</option>
                                        {cuestionario.gruposPermitidos.split(',').map(g => g.trim()).filter(Boolean).map(grp => (
                                            <option key={grp} value={grp}>{grp}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        value={grupoParticipante}
                                        onChange={(e) => setGrupoParticipante(e.target.value)}
                                        placeholder="Ej: 5to A, Aula 204"
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px 12px 40px',
                                            borderRadius: '12px',
                                            border: '1.5px solid #cbd5e1',
                                            outline: 'none',
                                            fontSize: '13.5px',
                                            color: '#0f172a',
                                            backgroundColor: '#ffffff',
                                            boxSizing: 'border-box'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#2563eb';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#cbd5e1';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* BOTONES DE RETORNO Y COMIENZO DEL EXAMEN */}
                        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                            <button
                                type="button"
                                onClick={() => setPaso(1)}
                                style={{
                                    backgroundColor: '#ffffff',
                                    color: '#475569',
                                    border: '1.5px solid #cbd5e1',
                                    padding: '13px 18px',
                                    borderRadius: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    fontSize: '13.5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                            >
                                <ArrowLeft size={16} /> Atrás
                            </button>

                            <button
                                type="submit"
                                disabled={validando || !nombreParticipante.trim()}
                                style={{
                                    flex: 1,
                                    background: nombreParticipante.trim()
                                        ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                                        : '#cbd5e1',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '13px 20px',
                                    borderRadius: '12px',
                                    fontWeight: '700',
                                    cursor: nombreParticipante.trim() && !validando ? 'pointer' : 'default',
                                    fontSize: '14.5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: nombreParticipante.trim()
                                        ? '0 6px 18px rgba(37, 99, 235, 0.35)'
                                        : 'none',
                                    transition: 'all 0.2s ease',
                                    transform: nombreParticipante.trim() && !validando ? 'translateY(-1px)' : 'none'
                                }}
                            >
                                {validando ? (
                                    <>Preparando examen...</>
                                ) : (
                                    <>
                                        Comenzar Evaluación <ArrowRight size={17} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
