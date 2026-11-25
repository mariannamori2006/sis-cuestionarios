import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { validarCodigoEvaluacionV3, iniciarIntentoEvaluacionV3 } from '../services/v3Service';
import useResponsive from '../hooks/useResponsive';
import logoNativa from '../images/logoNativa.jpeg';
import {
    KeyRound,
    ArrowRight,
    ArrowLeft,
    User,
    Users,
    Clock,
    BookOpen,
    ShieldAlert,
    CheckCircle2,
    AlertCircle,
    FileQuestion,
    Sparkles,
    RotateCcw
} from 'lucide-react';

const obtenerDeviceToken = () => {
    const key = 'nativatec_v3_device_token';
    let token = localStorage.getItem(key);
    if (!token) {
        token = typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem(key, token);
    }
    return token;
};

export default function UnirseEvaluacionV3() {
    const navigate = useNavigate();
    const { isMobile } = useResponsive();
    const inputPinRef = useRef(null);

    const [paso, setPaso] = useState(1); // 1 = Código numérico, 2 = Nombres y Apellidos
    const [codigoNumerico, setCodigoNumerico] = useState('');
    const [sesionInfo, setSesionInfo] = useState(null);

    const [nombres, setNombres] = useState(() => sessionStorage.getItem('v3_nombres') || '');
    const [apellidos, setApellidos] = useState(() => sessionStorage.getItem('v3_apellidos') || '');
    const [seccionId, setSeccionId] = useState('');
    const [seccionTexto, setSeccionTexto] = useState('');

    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (paso === 1) {
            setTimeout(() => inputPinRef.current?.focus(), 120);
        }
    }, [paso]);

    const handleCodigoChange = (val) => {
        const soloDigitos = val.replace(/\D/g, '').slice(0, 6);
        setCodigoNumerico(soloDigitos);
        if (error) setError('');
    };

    const handleValidarCodigo = async (e) => {
        e.preventDefault();
        if (codigoNumerico.length < 6) {
            setError('Ingresa los 6 dígitos numéricos proporcionados por tu docente.');
            return;
        }
        try {
            setCargando(true);
            setError('');
            const info = await validarCodigoEvaluacionV3(codigoNumerico);
            setSesionInfo(info);
            if (info.seccionFijaId) {
                setSeccionId(info.seccionFijaId);
            } else if (info.seccionesDisponibles?.length === 1) {
                setSeccionId(info.seccionesDisponibles[0].id);
            } else {
                setSeccionId('');
            }
            setPaso(2);
        } catch (err) {
            const msg = err.response?.data?.message || 'El código no existe o la sesión no está abierta en este momento.';
            setError(msg);
        } finally {
            setCargando(false);
        }
    };

    const handleIniciarEvaluacion = async (e) => {
        e.preventDefault();
        if (!nombres.trim() || !apellidos.trim()) {
            setError('Por favor ingresa tus nombres y apellidos completos.');
            return;
        }
        if (sesionInfo?.pedirSeccion && !sesionInfo.seccionFijaId && sesionInfo.seccionesDisponibles?.length > 0 && !seccionId) {
            setError('Selecciona tu sección o grupo para continuar.');
            return;
        }

        try {
            setCargando(true);
            setError('');
            const deviceToken = obtenerDeviceToken();

            const intento = await iniciarIntentoEvaluacionV3({
                codigoNumerico,
                nombres: nombres.trim(),
                apellidos: apellidos.trim(),
                seccionId: seccionId || null,
                seccionTexto: seccionTexto.trim() || null,
                deviceToken
            });

            sessionStorage.setItem('v3_nombres', nombres.trim());
            sessionStorage.setItem('v3_apellidos', apellidos.trim());
            sessionStorage.setItem(`v3_intento_${intento.intentoId}`, JSON.stringify(intento));

            navigate(`/resolver-v3/${intento.intentoId}`);
        } catch (err) {
            const msg = err.response?.data?.message || 'No se pudo iniciar la evaluación. Verifica tus datos o consulta con tu docente.';
            setError(msg);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100vw',
            background: 'radial-gradient(ellipse at 50% 15%, #1e293b 0%, #090e17 100%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: isMobile ? '16px 12px' : '28px',
            boxSizing: 'border-box',
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Orbes de fondo */}
            <div style={{
                position: 'absolute', top: '6%', right: '10%', width: '320px', height: '320px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.28) 0%, transparent 70%)',
                filter: 'blur(55px)', pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute', bottom: '8%', left: '8%', width: '360px', height: '360px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, transparent 70%)',
                filter: 'blur(65px)', pointerEvents: 'none'
            }} />

            <div style={{
                width: '100%',
                maxWidth: '470px',
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                padding: isMobile ? '24px 18px' : '34px 32px',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                position: 'relative',
                zIndex: 2,
                boxSizing: 'border-box'
            }}>
                {/* Header marca + indicador de paso */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                            src={logoNativa}
                            alt="NativaTec"
                            style={{ width: '34px', height: '34px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                        />
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>Portal del Alumno</div>
                            <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '600' }}>Acceso directo sin contraseña</div>
                        </div>
                    </div>
                    <span style={{
                        fontSize: '11.5px',
                        fontWeight: '700',
                        padding: '5px 10px',
                        borderRadius: '999px',
                        backgroundColor: paso === 1 ? '#eff6ff' : '#ecfdf5',
                        color: paso === 1 ? '#2563eb' : '#059669',
                        border: `1px solid ${paso === 1 ? '#bfdbfe' : '#a7f3d0'}`
                    }}>
                        Paso {paso} de 2
                    </span>
                </div>

                {error && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#b91c1c',
                        borderRadius: '12px',
                        padding: '11px 13px',
                        fontSize: '13px',
                        fontWeight: '600',
                        marginBottom: '18px'
                    }}>
                        <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
                        <span>{error}</span>
                    </div>
                )}

                {paso === 1 ? (
                    <form onSubmit={handleValidarCodigo}>
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <div style={{
                                width: '52px', height: '52px', borderRadius: '16px',
                                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                                color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '12px', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)'
                            }}>
                                <KeyRound size={24} />
                            </div>
                            <h1 style={{ margin: '0 0 6px 0', fontSize: '21px', fontWeight: '800', color: '#0f172a' }}>
                                Ingresa el código numérico
                            </h1>
                            <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>
                                Escribe los 6 dígitos que indicó tu docente para acceder a la evaluación.
                            </p>
                        </div>

                        {/* Casillas visuales vinculadas a un input numérico accesible */}
                        <div
                            onClick={() => inputPinRef.current?.focus()}
                            style={{ position: 'relative', marginBottom: '22px', cursor: 'text' }}
                        >
                            <input
                                ref={inputPinRef}
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                value={codigoNumerico}
                                onChange={(e) => handleCodigoChange(e.target.value)}
                                aria-label="Código numérico de 6 dígitos"
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    opacity: 0,
                                    width: '100%',
                                    height: '100%',
                                    cursor: 'text',
                                    zIndex: 3
                                }}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: isMobile ? '6px' : '10px' }}>
                                {[0, 1, 2, 3, 4, 5].map((idx) => {
                                    const digito = codigoNumerico[idx] || '';
                                    const activo = codigoNumerico.length === idx;
                                    return (
                                        <div
                                            key={idx}
                                            style={{
                                                height: isMobile ? '54px' : '62px',
                                                borderRadius: '14px',
                                                border: activo ? '2px solid #2563eb' : digito ? '2px solid #0f172a' : '1.5px solid #cbd5e1',
                                                backgroundColor: digito ? '#f8fafc' : '#ffffff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: isMobile ? '24px' : '28px',
                                                fontWeight: '800',
                                                fontFamily: 'monospace',
                                                color: '#0f172a',
                                                boxShadow: activo ? '0 0 0 4px rgba(37, 99, 235, 0.12)' : 'none',
                                                transition: 'all 0.15s ease'
                                            }}
                                        >
                                            {digito || <span style={{ color: '#cbd5e1', fontSize: '18px' }}>•</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={cargando || codigoNumerico.length < 6}
                            style={{
                                width: '100%',
                                padding: '14px 18px',
                                borderRadius: '14px',
                                border: 'none',
                                background: codigoNumerico.length === 6
                                    ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                                    : '#cbd5e1',
                                color: '#ffffff',
                                fontSize: '15px',
                                fontWeight: '700',
                                cursor: codigoNumerico.length === 6 && !cargando ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: codigoNumerico.length === 6 ? '0 8px 20px rgba(37, 99, 235, 0.3)' : 'none'
                            }}
                        >
                            <span>{cargando ? 'Verificando código...' : 'Continuar'}</span>
                            {!cargando && <ArrowRight size={18} />}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleIniciarEvaluacion}>
                        {/* Ficha confirmada de la evaluación */}
                        <div style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '16px',
                            padding: '14px 16px',
                            marginBottom: '18px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                                <div>
                                    <span style={{
                                        display: 'inline-block',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        color: '#2563eb',
                                        backgroundColor: '#dbeafe',
                                        padding: '2px 8px',
                                        borderRadius: '999px',
                                        marginBottom: '5px'
                                    }}>
                                        {sesionInfo?.cursoNombre || 'Evaluación'}
                                    </span>
                                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                                        {sesionInfo?.tituloEvaluacion}
                                    </h2>
                                </div>
                                <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '800', color: '#475569', backgroundColor: '#e2e8f0', padding: '4px 8px', borderRadius: '8px' }}>
                                    #{codigoNumerico}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#475569', fontWeight: '600' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <User size={14} color="#64748b" /> {sesionInfo?.docenteNombre || 'Docente'}
                                </span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <FileQuestion size={14} color="#64748b" /> {sesionInfo?.totalPreguntas || 0} preguntas
                                </span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={14} color="#64748b" /> {sesionInfo?.tiempoLimiteMinutos > 0 ? `${sesionInfo.tiempoLimiteMinutos} min` : 'Sin límite'}
                                </span>
                                {sesionInfo?.modoSeguro && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#b45309' }}>
                                        <ShieldAlert size={14} /> Modo seguro ({sesionInfo.limiteAdvertencias} avisos)
                                    </span>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                                    Nombres *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Juan Carlos"
                                    value={nombres}
                                    onChange={(e) => setNombres(e.target.value)}
                                    style={{
                                        width: '100%', padding: '12px 14px', borderRadius: '12px',
                                        border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                                    Apellidos *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Pérez Gómez"
                                    value={apellidos}
                                    onChange={(e) => setApellidos(e.target.value)}
                                    style={{
                                        width: '100%', padding: '12px 14px', borderRadius: '12px',
                                        border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {sesionInfo?.pedirSeccion && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                                        Sección / Grupo
                                    </label>
                                    {sesionInfo.seccionFijaNombre ? (
                                        <div style={{
                                            padding: '11px 14px', borderRadius: '12px', backgroundColor: '#f1f5f9',
                                            border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '700', color: '#0f172a',
                                            display: 'flex', alignItems: 'center', gap: '8px'
                                        }}>
                                            <Users size={16} color="#2563eb" />
                                            <span>{sesionInfo.seccionFijaNombre}</span>
                                        </div>
                                    ) : sesionInfo.seccionesDisponibles?.length > 0 ? (
                                        <select
                                            value={seccionId}
                                            onChange={(e) => setSeccionId(e.target.value)}
                                            required
                                            style={{
                                                width: '100%', padding: '12px 14px', borderRadius: '12px',
                                                border: '1.5px solid #cbd5e1', fontSize: '14px', backgroundColor: '#ffffff',
                                                outline: 'none', boxSizing: 'border-box'
                                            }}
                                        >
                                            <option value="">Selecciona tu sección...</option>
                                            {sesionInfo.seccionesDisponibles.map(sec => (
                                                <option key={sec.id} value={sec.id}>{sec.nombre}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            placeholder="Ej: 5to A (opcional)"
                                            value={seccionTexto}
                                            onChange={(e) => setSeccionTexto(e.target.value)}
                                            style={{
                                                width: '100%', padding: '12px 14px', borderRadius: '12px',
                                                border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setPaso(1);
                                    setError('');
                                }}
                                style={{
                                    padding: '13px 16px',
                                    borderRadius: '14px',
                                    border: '1.5px solid #e2e8f0',
                                    backgroundColor: '#ffffff',
                                    color: '#475569',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <ArrowLeft size={16} /> Código
                            </button>
                            <button
                                type="submit"
                                disabled={cargando}
                                style={{
                                    flex: 1,
                                    padding: '13px 18px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: '#ffffff',
                                    fontSize: '15px',
                                    fontWeight: '700',
                                    cursor: cargando ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.28)'
                                }}
                            >
                                <span>{cargando ? 'Ingresando...' : 'Comenzar evaluación'}</span>
                                {!cargando && <Sparkles size={17} />}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

