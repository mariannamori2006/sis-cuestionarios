import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import logoNativa from '../images/logoNativa.jpeg';
import useResponsive from '../hooks/useResponsive';
import { User, KeyRound, ArrowRight, CheckCircle2, AlertCircle, HelpCircle, ArrowLeft, BookOpen, Clock, RotateCcw, Users } from 'lucide-react';
import { verificarDisponibilidadCuestionario } from '../services/cuestionarioService';

export default function ParticipanteLogin() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isMobile } = useResponsive();

    // Paso 1: Ingreso y validación obligatoria del código numérico por parte del alumno
    // Paso 2: Ingreso de nombre/apodo una vez validado el código
    const [paso, setPaso] = useState(1);
    const [codigoAcceso, setCodigoAcceso] = useState('');
    const [nombreParticipante, setNombreParticipante] = useState(sessionStorage.getItem('nombreParticipante') || '');
    const [grupoParticipante, setGrupoParticipante] = useState(sessionStorage.getItem('grupoParticipante') || '');

    const [cuestionario, setCuestionario] = useState(null);
    const [disponibilidad, setDisponibilidad] = useState(null);
    const [validando, setValidando] = useState(false);
    const [error, setError] = useState('');

    const verificarCodigo = async (codigoParaVerificar) => {
        const codigo = (codigoParaVerificar || codigoAcceso).trim();
        if (!codigo) {
            setError('Por favor, ingresa el código numérico del cuestionario.');
            return;
        }

        try {
            setValidando(true);
            setError('');

            const response = await axios.get(`http://localhost:8080/api/cuestionarios/resolver/${codigo}`);
            if (response.data && response.data.id) {
                // Verificar si tiene restricciones de ventana de fechas
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
                setPaso(2); // Avanzar al paso 2
            } else {
                setError('No se encontró ningún cuestionario activo con ese código.');
            }
        } catch (err) {
            console.error("Error al validar código:", err);
            setError('El código ingresado no existe o no se encuentra activo. Verifica los números con tu profesor.');
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
            setError('Por favor ingresa tu nombre o apodo para continuar.');
            return;
        }

        if (!cuestionario) {
            setError('Error de sesión. Por favor valida el código nuevamente.');
            setPaso(1);
            return;
        }

        try {
            setValidando(true);
            setError('');

            // Validar si este participante específico aún tiene intentos disponibles
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

        // Guardamos el nombre y grupo del alumno en sessionStorage
        sessionStorage.setItem('nombreParticipante', nombreParticipante.trim());
        sessionStorage.setItem('grupoParticipante', (grupoParticipante || '').trim());

        // Redirigimos a resolver el cuestionario
        const rutaDestino = cuestionario.codigoAcceso || cuestionario.id;
        navigate(`/resolver/${rutaDestino}`);
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            width: '100vw',
            background: 'radial-gradient(ellipse at top, #1e293b 0%, #090d16 100%)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: isMobile ? '16px 12px' : '24px',
            boxSizing: 'border-box'
        }}>
            <div className="animate-scale-up" style={{
                backgroundColor: '#ffffff',
                padding: isMobile ? '32px 22px' : '40px 36px',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '450px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)',
                boxSizing: 'border-box'
            }}>
                {/* Logo Institucional */}
                <div style={{ textAlign: 'center', marginBottom: '26px' }}>
                    <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ background: '#f8fafc', padding: '8px 16px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'inline-flex', alignItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                            <img src={logoNativa} alt="NativaTec" style={{ height: '34px', objectFit: 'contain' }} />
                        </div>
                    </div>
                    <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>Portal de Evaluaciones</h2>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                        {paso === 1
                            ? 'Ingresa el código numérico para unirte a tu examen'
                            : 'Identifícate para dar inicio a la evaluación'}
                    </p>
                </div>

                {/* Barra de progreso de pasos */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '26px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: paso === 1 ? '#2563eb' : '#10b981'
                    }}>
                        <span style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: paso === 1 ? '#2563eb' : '#10b981',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            boxShadow: paso === 1 ? '0 2px 8px rgba(37,99,235,0.4)' : 'none'
                        }}>
                            {paso > 1 ? '✓' : '1'}
                        </span>
                        <span>Código PIN</span>
                    </div>

                    <div style={{ width: '34px', height: '2px', backgroundColor: paso === 2 ? '#10b981' : '#e2e8f0' }} />

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: paso === 2 ? '#2563eb' : '#94a3b8'
                    }}>
                        <span style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: paso === 2 ? '#2563eb' : '#f1f5f9',
                            color: paso === 2 ? '#ffffff' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            boxShadow: paso === 2 ? '0 2px 8px rgba(37,99,235,0.4)' : 'none'
                        }}>
                            2
                        </span>
                        <span>Identificación</span>
                    </div>
                </div>

                {/* Mensaje de Error */}
                {error && (
                    <div className="animate-fade-in" style={{
                        backgroundColor: '#fee2e2',
                        color: '#991b1b',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        marginBottom: '20px',
                        border: '1px solid #fca5a5',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                    }}>
                        <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{error}</span>
                    </div>
                )}

                {/* PASO 1: VALIDACIÓN DE CÓDIGO NUMÉRICO */}
                {paso === 1 && (
                    <form onSubmit={handleValidarCodigo} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                Código PIN del Cuestionario
                            </label>
                            <div style={{ position: 'relative' }}>
                                <KeyRound size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={8}
                                    value={codigoAcceso}
                                    onChange={(e) => setCodigoAcceso(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="Ej: 582914"
                                    autoFocus
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '15px 16px 15px 48px',
                                        borderRadius: '14px',
                                        border: '2px solid #e2e8f0',
                                        outline: 'none',
                                        fontSize: '20px',
                                        fontWeight: '800',
                                        letterSpacing: '4px',
                                        color: '#0f172a',
                                        backgroundColor: '#f8fafc',
                                        boxSizing: 'border-box',
                                        transition: 'all 0.2s ease',
                                        textAlign: 'left'
                                    }}
                                />
                            </div>
                            <span style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', display: 'block' }}>
                                Solicita a tu profesor el código numérico de 6 dígitos.
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={validando || !codigoAcceso.trim()}
                            className="interactive-card"
                            style={{
                                background: codigoAcceso.trim() ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : '#cbd5e1',
                                color: '#ffffff',
                                border: 'none',
                                padding: '14px',
                                borderRadius: '14px',
                                fontWeight: '700',
                                cursor: codigoAcceso.trim() ? 'pointer' : 'default',
                                fontSize: '14px',
                                marginTop: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: codigoAcceso.trim() ? '0 4px 14px rgba(37, 99, 235, 0.35)' : 'none'
                            }}
                        >
                            {validando ? 'Verificando código...' : (
                                <>
                                    Continuar <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* PASO 2: INGRESO DE NOMBRE Y APODO */}
                {paso === 2 && cuestionario && (
                    <form onSubmit={handleComenzarExamen} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* Tarjeta de Cuestionario Verificado */}
                        <div style={{
                            backgroundColor: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: '14px',
                            padding: '14px 16px',
                            marginBottom: '4px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <span className="badge-pill badge-emerald">
                                    <CheckCircle2 size={12} /> PIN: {cuestionario.codigoAcceso || codigoAcceso}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setPaso(1)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#64748b',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    Cambiar
                                </button>
                            </div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{cuestionario.titulo}</h3>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                                {cuestionario.materia || 'General'} • {cuestionario.preguntas ? `${cuestionario.preguntas.length} preguntas` : ''}
                                {cuestionario.tiempoLimiteMinutos > 0 ? ` • ${cuestionario.tiempoLimiteMinutos} min` : ''}
                            </p>
                        </div>

                        {/* Información de disponibilidad e intentos */}
                        {disponibilidad && (
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '6px',
                                marginBottom: '2px'
                            }}>
                                <span className="badge-pill badge-purple">
                                    <RotateCcw size={12} /> {disponibilidad.limiteIntentos === 0 ? 'Intentos ilimitados' : `${disponibilidad.limiteIntentos} intento(s) máx.`}
                                </span>
                                {disponibilidad.fechaFin && (
                                    <span className="badge-pill badge-rose">
                                        <Clock size={12} /> Cierre programado
                                    </span>
                                )}
                            </div>
                        )}

                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                Tu Nombre y Apellido *
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    value={nombreParticipante}
                                    onChange={(e) => setNombreParticipante(e.target.value)}
                                    placeholder="Ej: Sofía Ramírez"
                                    autoFocus
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '13px 14px 13px 40px',
                                        borderRadius: '12px',
                                        border: '1px solid #cbd5e1',
                                        outline: 'none',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                            <span style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', display: 'block' }}>
                                Se registrará con tus respuestas para asentar tu calificación.
                            </span>
                        </div>

                        {/* GRUPO / SECCIÓN */}
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                Grupo o Sección (Opcional)
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Users size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                                {cuestionario?.gruposPermitidos ? (
                                    <select
                                        value={grupoParticipante}
                                        onChange={(e) => setGrupoParticipante(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '13px 14px 13px 40px',
                                            borderRadius: '12px',
                                            border: '1px solid #cbd5e1',
                                            outline: 'none',
                                            fontSize: '14px',
                                            backgroundColor: '#ffffff',
                                            boxSizing: 'border-box',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="">-- Selecciona tu grupo / sección --</option>
                                        {cuestionario.gruposPermitidos.split(',').map(g => g.trim()).filter(Boolean).map(grp => (
                                            <option key={grp} value={grp}>{grp}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        value={grupoParticipante}
                                        onChange={(e) => setGrupoParticipante(e.target.value)}
                                        placeholder="Ej: 5to A, Grupo 1, Sección B"
                                        style={{
                                            width: '100%',
                                            padding: '13px 14px 13px 40px',
                                            borderRadius: '12px',
                                            border: '1px solid #cbd5e1',
                                            outline: 'none',
                                            fontSize: '14px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                            <button
                                type="button"
                                onClick={() => setPaso(1)}
                                style={{
                                    backgroundColor: '#f1f5f9',
                                    color: '#475569',
                                    border: '1px solid #e2e8f0',
                                    padding: '13px 18px',
                                    borderRadius: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <ArrowLeft size={15} /> Atrás
                            </button>

                            <button
                                type="submit"
                                className="interactive-card"
                                style={{
                                    flex: 1,
                                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '13px',
                                    borderRadius: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                                }}
                            >
                                Iniciar Examen <ArrowRight size={16} />
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}