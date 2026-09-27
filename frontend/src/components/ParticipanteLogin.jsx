import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import logoNativa from '../images/logoNativa.jpeg';
import { User, KeyRound, ArrowRight, CheckCircle2, AlertCircle, HelpCircle, ArrowLeft, BookOpen } from 'lucide-react';

export default function ParticipanteLogin() {
    const navigate = useNavigate();
    const location = useLocation();

    // Paso 1: Ingreso y validación de código numérico
    // Paso 2: Ingreso de nombre/apodo
    const [paso, setPaso] = useState(1);
    const [codigoAcceso, setCodigoAcceso] = useState('');
    const [nombreParticipante, setNombreParticipante] = useState(sessionStorage.getItem('nombreParticipante') || '');

    const [cuestionario, setCuestionario] = useState(null);
    const [validando, setValidando] = useState(false);
    const [error, setError] = useState('');

    // Si viene con un parámetro en la URL (?codigo=123456)
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const codeParam = queryParams.get('codigo');
        if (codeParam) {
            const limpio = codeParam.trim();
            setCodigoAcceso(limpio);
            verificarCodigo(limpio);
        }
    }, [location.search]);

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

    const handleComenzarExamen = (e) => {
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

        // Guardamos el nombre del alumno en sessionStorage
        sessionStorage.setItem('nombreParticipante', nombreParticipante.trim());

        // Redirigimos a resolver el cuestionario
        const rutaDestino = cuestionario.codigoAcceso || cuestionario.id;
        navigate(`/resolver/${rutaDestino}`);
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            width: '100vw',
            backgroundColor: '#0f172a',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
            padding: '20px',
            boxSizing: 'border-box'
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                padding: '36px',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '430px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
            }}>
                {/* Logo Institucional */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'center' }}>
                        <img src={logoNativa} alt="NativaTec" style={{ height: '42px', objectFit: 'contain' }} />
                    </div>
                    <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', color: '#0f172a' }}>Portal de Evaluaciones</h2>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                        {paso === 1
                            ? 'Ingresa el código numérico para unirte a la evaluación'
                            : 'Identifícate para comenzar el examen'}
                    </p>
                </div>

                {/* Barra de progreso de pasos */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
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
                            fontSize: '11px'
                        }}>
                            {paso > 1 ? '✓' : '1'}
                        </span>
                        <span>Código</span>
                    </div>

                    <div style={{ width: '30px', height: '2px', backgroundColor: paso === 2 ? '#10b981' : '#e2e8f0' }} />

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
                            fontSize: '11px'
                        }}>
                            2
                        </span>
                        <span>Nombre</span>
                    </div>
                </div>

                {/* Mensaje de Error */}
                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2',
                        color: '#991b1b',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        marginBottom: '18px',
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
                    <form onSubmit={handleValidarCodigo} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                                CÓDIGO DEL CUESTIONARIO (6 NÚMEROS)
                            </label>
                            <div style={{ position: 'relative' }}>
                                <KeyRound size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
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
                                        padding: '14px 14px 14px 44px',
                                        borderRadius: '10px',
                                        border: '2px solid #cbd5e1',
                                        outline: 'none',
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        letterSpacing: '3px',
                                        color: '#0f172a',
                                        backgroundColor: '#f8fafc',
                                        boxSizing: 'border-box',
                                        transition: 'border-color 0.2s'
                                    }}
                                />
                            </div>
                            <span style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', display: 'block' }}>
                                Ingresa el código numérico que tu profesor te compartió.
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={validando || !codigoAcceso.trim()}
                            style={{
                                backgroundColor: codigoAcceso.trim() ? '#0f172a' : '#94a3b8',
                                color: '#ffffff',
                                border: 'none',
                                padding: '14px',
                                borderRadius: '10px',
                                fontWeight: '600',
                                cursor: codigoAcceso.trim() ? 'pointer' : 'default',
                                fontSize: '14px',
                                marginTop: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'background-color 0.2s'
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
                            borderRadius: '12px',
                            padding: '14px 16px',
                            marginBottom: '4px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: '#15803d',
                                    backgroundColor: '#dcfce7',
                                    padding: '3px 8px',
                                    borderRadius: '12px'
                                }}>
                                    <CheckCircle2 size={13} /> Código: {cuestionario.codigoAcceso || codigoAcceso}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setPaso(1)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#64748b',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    Cambiar
                                </button>
                            </div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#0f172a' }}>{cuestionario.titulo}</h3>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                                {cuestionario.descripcion || 'Evaluación académica'} • {cuestionario.preguntas ? `${cuestionario.preguntas.length} preguntas` : ''}
                            </p>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                                TU NOMBRE O APODO *
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
                                        padding: '12px 14px 12px 40px',
                                        borderRadius: '10px',
                                        border: '1px solid #cbd5e1',
                                        outline: 'none',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                            <span style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', display: 'block' }}>
                                Tu nombre se registrará junto con tus respuestas para calificar la evaluación.
                            </span>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                            <button
                                type="button"
                                onClick={() => setPaso(1)}
                                style={{
                                    backgroundColor: '#f1f5f9',
                                    color: '#475569',
                                    border: 'none',
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    fontWeight: '600',
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
                                style={{
                                    flex: 1,
                                    backgroundColor: '#10b981',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                Acceder al Cuestionario <ArrowRight size={16} />
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}