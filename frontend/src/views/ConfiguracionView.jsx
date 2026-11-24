import React, { useState, useEffect, useRef } from 'react';
import { getCurrentUser } from '../services/authService';
import { actualizarUsuario } from '../services/usuarioService';
import { obtenerCuestionarios, obtenerCuestionarioPorId, actualizarCuestionario } from '../services/cuestionarioService';
import PulsingLoader from '../components/common/PulsingLoader';
import {
    Check,
    Camera,
    AlertCircle,
    Sliders,
    User,
    ShieldAlert,
    Shuffle,
    Lightbulb,
    RotateCcw,
    Calendar,
    Users,
    Clock,
    KeyRound,
    Sparkles,
    Save,
    ChevronDown,
    FileText,
    CheckCircle2,
    Bell,
    Award
} from 'lucide-react';

const ToggleSwitch = ({ checked, onChange, activeColor = '#2563eb' }) => (
    <div
        role="switch"
        aria-checked={checked}
        onClick={(e) => {
            e.stopPropagation();
            onChange(!checked);
        }}
        style={{
            position: 'relative',
            width: '44px',
            height: '24px',
            borderRadius: '9999px',
            backgroundColor: checked ? activeColor : '#cbd5e1',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: checked ? `0 2px 8px ${activeColor}40` : 'none',
            flexShrink: 0,
            userSelect: 'none',
            display: 'inline-block'
        }}
    >
        <span
            style={{
                display: 'block',
                width: '18px',
                height: '18px',
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                position: 'absolute',
                top: '3px',
                left: checked ? '23px' : '3px',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.25)'
            }}
        />
    </div>
);

const formatDateTimeForInput = (dateVal) => {
    if (!dateVal) return '';
    try {
        if (Array.isArray(dateVal)) {
            const [y, m, d, h = 0, min = 0] = dateVal;
            const pad = (n) => String(n).padStart(2, '0');
            return `${y}-${pad(m)}-${pad(d)}T${pad(h)}:${pad(min)}`;
        }
        if (typeof dateVal === 'string') {
            return dateVal.substring(0, 16);
        }
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return '';
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
        return '';
    }
};

export default function ConfiguracionView({
    onUserUpdated,
    cuestionarios: cuestionariosProp = [],
    cuestionarioInicialId = null,
    onCuestionarioActualizado = null,
    tabInicial = null,
    modo = null // 'examenes' | 'perfil'
}) {
    const currentUser = getCurrentUser() || {};
    const [tabActiva, setTabActiva] = useState(modo || tabInicial || (cuestionarioInicialId ? 'examenes' : 'examenes'));
    const seccionActiva = modo || tabActiva;

    useEffect(() => {
        if (modo) {
            setTabActiva(modo);
        } else if (tabInicial) {
            setTabActiva(tabInicial);
        }
    }, [modo, tabInicial]);

    // -------------------------------------------------------------------------
    // 1. ESTADOS DEL PERFIL DEL PROFESOR
    // -------------------------------------------------------------------------
    const initialNombre = currentUser.nombre || '';
    const initialApellido = currentUser.apellido || '';
    const initialNombreCompleto = `${initialNombre} ${initialApellido}`.trim() || 'Profesor Nativatec';
    const initialEmail = currentUser.email || 'profesor@nativatec.edu';

    const savedPrefs = JSON.parse(localStorage.getItem('preferencias_profesor') || '{}');
    const defaultExamPrefs = JSON.parse(localStorage.getItem('configuracion_examenes_default') || '{}');

    const [nombreCompleto, setNombreCompleto] = useState(initialNombreCompleto);
    const [email, setEmail] = useState(initialEmail);
    const [institucion, setInstitucion] = useState(savedPrefs.institucion || currentUser.institucion || 'Instituto Nativatec');
    const [foto, setFoto] = useState(savedPrefs.foto || currentUser.foto || null);
    const fileInputRef = useRef(null);

    // -------------------------------------------------------------------------
    // 2. ESTADOS DE PARÁMETROS PREDETERMINADOS PARA EXÁMENES
    // -------------------------------------------------------------------------
    const [defaultModoSeguro, setDefaultModoSeguro] = useState(defaultExamPrefs.modoSeguro ?? false);
    const [defaultLimiteAdvertencias, setDefaultLimiteAdvertencias] = useState(defaultExamPrefs.limiteAdvertencias || 3);
    const [defaultOrdenAleatorio, setDefaultOrdenAleatorio] = useState(defaultExamPrefs.ordenAleatorio ?? false);
    const [defaultRetroalimentacion, setDefaultRetroalimentacion] = useState(defaultExamPrefs.mostrarRetroalimentacion ?? true);
    const [defaultLimiteIntentos, setDefaultLimiteIntentos] = useState(defaultExamPrefs.limiteIntentos ?? (savedPrefs.permitirReintentos ? 2 : 1));
    const [defaultTipoCalificacion, setDefaultTipoCalificacion] = useState(defaultExamPrefs.tipoCalificacionIntentos || 'MEJOR_NOTA');
    const [defaultMostrarCalificacion, setDefaultMostrarCalificacion] = useState(savedPrefs.mostrarCalificacion ?? true);
    const [defaultNotificaciones, setDefaultNotificaciones] = useState(savedPrefs.notificacionesEmail ?? true);

    // -------------------------------------------------------------------------
    // 3. ESTADOS PARA CONFIGURAR UN EXAMEN ESPECÍFICO
    // -------------------------------------------------------------------------
    const [listaCuestionarios, setListaCuestionarios] = useState(cuestionariosProp);
    const [cargandoLista, setCargandoLista] = useState(false);
    const [examenSeleccionadoId, setExamenSeleccionadoId] = useState(cuestionarioInicialId || '');
    const [desplegarExamenEspecifico, setDesplegarExamenEspecifico] = useState(Boolean(cuestionarioInicialId));
    const [cargandoDetalleExamen, setCargandoDetalleExamen] = useState(false);
    const [datosExamen, setDatosExamen] = useState(null);

    // Campos del examen específico seleccionado
    const [exModoSeguro, setExModoSeguro] = useState(false);
    const [exLimiteAdvertencias, setExLimiteAdvertencias] = useState(3);
    const [exOrdenAleatorio, setExOrdenAleatorio] = useState(false);
    const [exMostrarRetroalimentacion, setExMostrarRetroalimentacion] = useState(true);
    const [exProgramarFechas, setExProgramarFechas] = useState(false);
    const [exFechaInicio, setExFechaInicio] = useState('');
    const [exFechaFin, setExFechaFin] = useState('');
    const [exLimiteIntentos, setExLimiteIntentos] = useState(1);
    const [exTipoCalificacion, setExTipoCalificacion] = useState('MEJOR_NOTA');
    const [exGruposPermitidos, setExGruposPermitidos] = useState('');
    const [exTiempoLimiteMinutos, setExTiempoLimiteMinutos] = useState(0);

    // Feedbacks
    const [guardandoPerfil, setGuardandoPerfil] = useState(false);
    const [mensajeExitoPerfil, setMensajeExitoPerfil] = useState(false);
    const [mensajeErrorPerfil, setMensajeErrorPerfil] = useState('');

    const [guardandoDefault, setGuardandoDefault] = useState(false);
    const [mensajeExitoDefault, setMensajeExitoDefault] = useState(false);

    const [guardandoExamen, setGuardandoExamen] = useState(false);
    const [mensajeExitoExamen, setMensajeExitoExamen] = useState(false);
    const [mensajeErrorExamen, setMensajeErrorExamen] = useState('');

    // Cargar cuestionarios si la lista está vacía
    useEffect(() => {
        if (cuestionariosProp && cuestionariosProp.length > 0) {
            setListaCuestionarios(cuestionariosProp);
            if (!examenSeleccionadoId && cuestionariosProp.length > 0) {
                setExamenSeleccionadoId(cuestionariosProp[0].id);
            }
        } else {
            setCargandoLista(true);
            obtenerCuestionarios()
                .then(data => {
                    setListaCuestionarios(data || []);
                    if (!examenSeleccionadoId && data && data.length > 0) {
                        setExamenSeleccionadoId(data[0].id);
                    }
                })
                .catch(err => console.error("Error al cargar cuestionarios en Configuración:", err))
                .finally(() => setCargandoLista(false));
        }
    }, [cuestionariosProp]);

    // Si cambia cuestionarioInicialId externamente
    useEffect(() => {
        if (cuestionarioInicialId) {
            setExamenSeleccionadoId(cuestionarioInicialId);
            setTabActiva('examenes');
            setDesplegarExamenEspecifico(true);
        }
    }, [cuestionarioInicialId]);

    // Cargar detalles del examen cuando cambia el examen seleccionado
    useEffect(() => {
        if (!examenSeleccionadoId) {
            setDatosExamen(null);
            return;
        }

        setCargandoDetalleExamen(true);
        setMensajeExitoExamen(false);
        setMensajeErrorExamen('');

        obtenerCuestionarioPorId(examenSeleccionadoId)
            .then(c => {
                if (c) {
                    setDatosExamen(c);
                    setExModoSeguro(Boolean(c.modoSeguro));
                    setExLimiteAdvertencias(c.limiteAdvertencias || 3);
                    setExOrdenAleatorio(Boolean(c.ordenAleatorio));
                    setExMostrarRetroalimentacion(c.mostrarRetroalimentacion !== false);
                    setExProgramarFechas(Boolean(c.fechaInicio || c.fechaFin));
                    setExFechaInicio(formatDateTimeForInput(c.fechaInicio));
                    setExFechaFin(formatDateTimeForInput(c.fechaFin));
                    setExLimiteIntentos(c.limiteIntentos !== undefined && c.limiteIntentos !== null ? c.limiteIntentos : 1);
                    setExTipoCalificacion(c.tipoCalificacionIntentos || 'MEJOR_NOTA');
                    setExGruposPermitidos(c.gruposPermitidos || '');
                    setExTiempoLimiteMinutos(c.tiempoLimiteMinutos || 0);
                }
            })
            .catch(err => {
                console.error("Error al cargar detalle del cuestionario:", err);
                setMensajeErrorExamen("No se pudo cargar la información del examen seleccionado.");
            })
            .finally(() => setCargandoDetalleExamen(false));
    }, [examenSeleccionadoId]);

    // Calcular iniciales para el avatar
    const getInitials = (nombreStr) => {
        if (!nombreStr) return 'PR';
        const parts = nombreStr.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0].substring(0, 2).toUpperCase();
    };

    const initials = getInitials(nombreCompleto);

    // Manejar selección de foto de perfil
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Guardar perfil del profesor
    const handleGuardarPerfil = async () => {
        try {
            setGuardandoPerfil(true);
            setMensajeErrorPerfil('');
            setMensajeExitoPerfil(false);

            const partes = nombreCompleto.trim().split(/\s+/);
            const nuevoNombre = partes[0] || '';
            const nuevoApellido = partes.slice(1).join(' ') || '';

            if (currentUser.id) {
                try {
                    await actualizarUsuario(currentUser.id, {
                        ...currentUser,
                        nombre: nuevoNombre,
                        apellido: nuevoApellido,
                        email: email
                    });
                } catch (apiErr) {
                    console.warn("No se pudo actualizar en el servidor backend, guardando localmente:", apiErr);
                }
            }

            const updatedUser = {
                ...currentUser,
                nombre: nuevoNombre,
                apellido: nuevoApellido,
                email: email,
                institucion: institucion,
                foto: foto
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            const actualPrefs = JSON.parse(localStorage.getItem('preferencias_profesor') || '{}');
            localStorage.setItem('preferencias_profesor', JSON.stringify({
                ...actualPrefs,
                institucion,
                foto
            }));

            if (onUserUpdated) {
                onUserUpdated(updatedUser);
            }

            setMensajeExitoPerfil(true);
            setTimeout(() => setMensajeExitoPerfil(false), 3500);
        } catch (err) {
            console.error("Error al guardar perfil:", err);
            setMensajeErrorPerfil("Hubo un error al guardar los datos del perfil.");
        } finally {
            setGuardandoPerfil(false);
        }
    };

    // Guardar reglas predeterminadas para nuevos exámenes
    const handleGuardarDefault = () => {
        try {
            setGuardandoDefault(true);

            const nuevoDefault = {
                modoSeguro: defaultModoSeguro,
                limiteAdvertencias: defaultLimiteAdvertencias,
                ordenAleatorio: defaultOrdenAleatorio,
                mostrarRetroalimentacion: defaultRetroalimentacion,
                limiteIntentos: defaultLimiteIntentos,
                tipoCalificacionIntentos: defaultTipoCalificacion,
                mostrarCalificacion: defaultMostrarCalificacion,
                notificacionesEmail: defaultNotificaciones,
                permitirReintentos: defaultLimiteIntentos !== 1
            };

            localStorage.setItem('configuracion_examenes_default', JSON.stringify(nuevoDefault));

            // Actualizar también preferencias generales
            const prefsActuales = JSON.parse(localStorage.getItem('preferencias_profesor') || '{}');
            localStorage.setItem('preferencias_profesor', JSON.stringify({
                ...prefsActuales,
                notificacionesEmail: defaultNotificaciones,
                mostrarCalificacion: defaultMostrarCalificacion,
                permitirReintentos: defaultLimiteIntentos !== 1
            }));

            setMensajeExitoDefault(true);
            setTimeout(() => setMensajeExitoDefault(false), 3500);
        } catch (err) {
            console.error("Error al guardar configuración predeterminada:", err);
        } finally {
            setGuardandoDefault(false);
        }
    };

    // Guardar parámetros del examen específico seleccionado
    const handleGuardarExamen = async () => {
        if (!examenSeleccionadoId || !datosExamen) return;

        if (exProgramarFechas && exFechaInicio && exFechaFin && new Date(exFechaInicio) >= new Date(exFechaFin)) {
            setMensajeErrorExamen('La fecha de cierre debe ser posterior a la fecha y hora de inicio.');
            return;
        }

        try {
            setGuardandoExamen(true);
            setMensajeErrorExamen('');
            setMensajeExitoExamen(false);

            const payload = {
                titulo: datosExamen.titulo,
                descripcion: datosExamen.descripcion,
                codigoAcceso: datosExamen.codigoAcceso,
                tiempoLimiteMinutos: parseInt(exTiempoLimiteMinutos, 10) || 0,
                modoSeguro: Boolean(exModoSeguro),
                limiteAdvertencias: parseInt(exLimiteAdvertencias, 10) || 3,
                ordenAleatorio: Boolean(exOrdenAleatorio),
                mostrarRetroalimentacion: Boolean(exMostrarRetroalimentacion),
                fechaInicio: exProgramarFechas && exFechaInicio ? (exFechaInicio.length === 16 ? exFechaInicio + ':00' : exFechaInicio) : null,
                fechaFin: exProgramarFechas && exFechaFin ? (exFechaFin.length === 16 ? exFechaFin + ':00' : exFechaFin) : null,
                limiteIntentos: parseInt(exLimiteIntentos, 10),
                tipoCalificacionIntentos: exTipoCalificacion || 'MEJOR_NOTA',
                gruposPermitidos: exGruposPermitidos ? exGruposPermitidos.trim() : null
            };

            const resultado = await actualizarCuestionario(examenSeleccionadoId, payload);
            setDatosExamen(resultado);

            // Actualizar la lista local
            setListaCuestionarios(prev => prev.map(c => c.id === examenSeleccionadoId ? { ...c, ...resultado } : c));

            if (onCuestionarioActualizado) {
                onCuestionarioActualizado();
            }

            setMensajeExitoExamen(true);
            setTimeout(() => setMensajeExitoExamen(false), 3500);
        } catch (err) {
            console.error("Error al actualizar configuración del examen:", err);
            const msg = err.response?.data?.message || err.message || "Error al guardar los parámetros del examen.";
            setMensajeErrorExamen(msg);
        } finally {
            setGuardandoExamen(false);
        }
    };

    return (
        <div style={{ maxWidth: '1050px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* CABECERA DINÁMICA SEGÚN EL MODO */}
            <div>
                <h1 style={{ margin: '0 0 4px 0', fontSize: '26px', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.02em' }}>
                    {modo === 'perfil'
                        ? 'Mi Perfil y Cuenta'
                        : (modo === 'examenes' ? 'Configuración de Exámenes' : 'Configuración')}
                </h1>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b', fontWeight: '400' }}>
                    {modo === 'perfil'
                        ? 'Administra tus datos personales, correo institucional y credenciales de acceso'
                        : (modo === 'examenes'
                            ? 'Ajusta los parámetros de seguridad, reglas de evaluación y tiempo de los cuestionarios'
                            : 'Ajusta los parámetros de seguridad, reglas de evaluación de los exámenes y tu perfil institucional')}
                </p>
            </div>

            {/* PESTAÑAS PRINCIPALES DE CONFIGURACIÓN (Solo se muestran si no viene un modo fijo desde el sidebar) */}
            {!modo && (
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    borderBottom: '1px solid #e2e8f0',
                    marginBottom: '26px',
                    paddingBottom: '2px'
                }}>
                    <button
                        type="button"
                        onClick={() => setTabActiva('examenes')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 18px',
                            borderRadius: '10px 10px 0 0',
                            border: 'none',
                            borderBottom: tabActiva === 'examenes' ? '3px solid #2563eb' : '3px solid transparent',
                            backgroundColor: tabActiva === 'examenes' ? '#eff6ff' : 'transparent',
                            color: tabActiva === 'examenes' ? '#1d4ed8' : '#64748b',
                            fontWeight: tabActiva === 'examenes' ? '700' : '600',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Sliders size={17} color={tabActiva === 'examenes' ? '#1d4ed8' : '#64748b'} />
                        <span>Configuración de Exámenes</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setTabActiva('perfil')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 18px',
                            borderRadius: '10px 10px 0 0',
                            border: 'none',
                            borderBottom: tabActiva === 'perfil' ? '3px solid #2563eb' : '3px solid transparent',
                            backgroundColor: tabActiva === 'perfil' ? '#eff6ff' : 'transparent',
                            color: tabActiva === 'perfil' ? '#1d4ed8' : '#64748b',
                            fontWeight: tabActiva === 'perfil' ? '700' : '600',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <User size={17} color={tabActiva === 'perfil' ? '#1d4ed8' : '#64748b'} />
                        <span>Perfil del Profesor</span>
                    </button>
                </div>
            )}

            {/* ========================================================================= */}
            {/* PESTAÑA 1: CONFIGURACIÓN Y PARÁMETROS DE EXÁMENES                         */}
            {/* ========================================================================= */}
            {seccionActiva === 'examenes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

                    {/* TARJETA A: CONFIGURACIÓN POR EXAMEN ESPECÍFICO (DESLIZANTE / DESPLEGABLE) */}
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '14px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        overflow: 'hidden',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                        {/* CABECERA DESLIZANTE CLICABLE */}
                        <div
                            onClick={() => setDesplegarExamenEspecifico(!desplegarExamenEspecifico)}
                            role="button"
                            aria-expanded={desplegarExamenEspecifico}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '18px 24px',
                                cursor: 'pointer',
                                userSelect: 'none',
                                backgroundColor: desplegarExamenEspecifico ? '#f8fafc' : '#ffffff',
                                borderBottom: desplegarExamenEspecifico ? '1px solid #e2e8f0' : 'none',
                                transition: 'background-color 0.2s ease'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                                <div style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '10px',
                                    backgroundColor: '#eff6ff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Sliders size={18} color="#2563eb" />
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>

                                        {/*datosExamen && (
                                            <span style={{
                                                fontSize: '11.5px',
                                                fontWeight: '700',
                                                backgroundColor: '#f1f5f9',
                                                color: '#1e293b',
                                                padding: '2px 8px',
                                                borderRadius: '6px',
                                                maxWidth: '300px',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: 'inline-block'
                                            }}>
                                                {datosExamen.titulo}
                                            </span>
                                        )*/}
                                    </div>
                                    <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                                        Configuración por Examen Específico
                                    </h2>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    backgroundColor: desplegarExamenEspecifico ? '#eff6ff' : '#f1f5f9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transform: desplegarExamenEspecifico ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.25s ease'
                                }}>
                                    <ChevronDown size={18} color={desplegarExamenEspecifico ? '#2563eb' : '#475569'} />
                                </div>
                            </div>
                        </div>

                        {/* CONTENIDO DESLIZANTE QUE SE DESPLIEGA */}
                        {desplegarExamenEspecifico && (
                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                                            Selección y parámetros del cuestionario
                                        </div>
                                        <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                                            Elige el examen cuyos parámetros deseas editar y guardar
                                        </div>
                                    </div>

                                    {/* SELECTOR DE CUESTIONARIO */}
                                    <div style={{ minWidth: '260px' }}>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                                            Seleccionar Examen
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <select
                                                value={examenSeleccionadoId}
                                                onChange={(e) => setExamenSeleccionadoId(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 36px 10px 14px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #cbd5e1',
                                                    backgroundColor: '#f8fafc',
                                                    color: '#0f172a',
                                                    fontSize: '13.5px',
                                                    fontWeight: '600',
                                                    outline: 'none',
                                                    cursor: 'pointer',
                                                    appearance: 'none',
                                                    boxSizing: 'border-box'
                                                }}
                                            >
                                                {listaCuestionarios && listaCuestionarios.length > 0 ? (
                                                    listaCuestionarios.map(c => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.titulo} {c.codigoAcceso ? `(Cód: ${c.codigoAcceso})` : ''}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <option value="">No hay exámenes creados</option>
                                                )}
                                            </select>
                                            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                                                <ChevronDown size={16} color="#2563eb" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ALERTA DE ÉXITO O ERROR DEL EXAMEN ESPECÍFICO */}
                                {mensajeExitoExamen && (
                                    <div style={{
                                        backgroundColor: '#ecfdf5',
                                        color: '#065f46',
                                        border: '1px solid #a7f3d0',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        marginBottom: '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        fontSize: '13.5px',
                                        fontWeight: '600'
                                    }}>
                                        <CheckCircle2 size={18} color="#10b981" />
                                        <span>¡Parámetros del examen actualizados y guardados exitosamente!</span>
                                    </div>
                                )}

                                {mensajeErrorExamen && (
                                    <div style={{
                                        backgroundColor: '#fef2f2',
                                        color: '#991b1b',
                                        border: '1px solid #fecaca',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        marginBottom: '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        fontSize: '13.5px'
                                    }}>
                                        <AlertCircle size={18} color="#dc2626" />
                                        <span>{mensajeErrorExamen}</span>
                                    </div>
                                )}

                                {/* CONTENIDO DEL EXAMEN SELECCIONADO */}
                                {cargandoDetalleExamen ? (
                                    <div style={{ padding: '50px 20px', textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                                        <PulsingLoader size="md" color="primary" text="Cargando configuración del examen..." textPosition="bottom" />
                                    </div>
                                ) : datosExamen ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                                        {/* RESUMEN SUPERIOR DEL EXAMEN SELECCIONADO */}
                                        <div style={{
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            padding: '14px 18px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: '12px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '38px',
                                                    height: '38px',
                                                    borderRadius: '10px',
                                                    backgroundColor: '#eff6ff',
                                                    color: '#2563eb',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: '700'
                                                }}>
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                                                        {datosExamen.titulo}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                                        {datosExamen.preguntas?.length || 0} preguntas registradas
                                                    </div>
                                                </div>
                                            </div>

                                            {datosExamen.codigoAcceso && (
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    backgroundColor: '#ffffff',
                                                    border: '1px solid #cbd5e1',
                                                    padding: '6px 14px',
                                                    borderRadius: '10px',
                                                    fontSize: '13px'
                                                }}>
                                                    <KeyRound size={15} color="#2563eb" />
                                                    <span style={{ color: '#475569', fontWeight: '500' }}>Código de Acceso:</span>
                                                    <strong style={{ color: '#0f172a', letterSpacing: '0.5px' }}>{datosExamen.codigoAcceso}</strong>
                                                </div>
                                            )}
                                        </div>

                                        {/* GRILLA DE PARÁMETROS DEL EXAMEN */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                            gap: '14px'
                                        }}>
                                            {/* 1. MODO SEGURO ANTI-COPIA */}
                                            <div style={{
                                                backgroundColor: '#ffffff',
                                                border: exModoSeguro ? '1.5px solid #93c5fd' : '1px solid #e2e8f0',
                                                borderRadius: '12px',
                                                padding: '14px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                gap: '10px'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{
                                                            width: '34px',
                                                            height: '34px',
                                                            borderRadius: '8px',
                                                            backgroundColor: exModoSeguro ? '#eff6ff' : '#f1f5f9',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <ShieldAlert size={17} color={exModoSeguro ? '#2563eb' : '#64748b'} />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>
                                                                Modo seguro (Anti-copia)
                                                            </div>
                                                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                                Supervisa cambio de pestaña
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ToggleSwitch
                                                        checked={exModoSeguro}
                                                        onChange={setExModoSeguro}
                                                        activeColor="#2563eb"
                                                    />
                                                </div>

                                                {exModoSeguro && (
                                                    <div style={{
                                                        paddingTop: '8px',
                                                        borderTop: '1px solid #f1f5f9',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        gap: '8px'
                                                    }}>
                                                        <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#475569' }}>
                                                            Tolerancia de avisos:
                                                        </span>
                                                        <select
                                                            value={exLimiteAdvertencias}
                                                            onChange={(e) => setExLimiteAdvertencias(Number(e.target.value))}
                                                            style={{
                                                                padding: '4px 8px',
                                                                borderRadius: '6px',
                                                                border: '1px solid #cbd5e1',
                                                                fontSize: '11.5px',
                                                                fontWeight: '600',
                                                                backgroundColor: '#f8fafc',
                                                                color: '#0f172a',
                                                                outline: 'none'
                                                            }}
                                                        >
                                                            <option value={1}>1 advertencia (Estricto)</option>
                                                            <option value={2}>2 advertencias</option>
                                                            <option value={3}>3 advertencias (Recomendado)</option>
                                                            <option value={5}>5 advertencias (Flexible)</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </div>

                                            {/* 2. LÍMITE DE INTENTOS */}
                                            <div style={{
                                                backgroundColor: '#ffffff',
                                                border: exLimiteIntentos !== 1 ? '1.5px solid #93c5fd' : '1px solid #e2e8f0',
                                                borderRadius: '12px',
                                                padding: '14px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                gap: '10px'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{
                                                            width: '34px',
                                                            height: '34px',
                                                            borderRadius: '8px',
                                                            backgroundColor: '#f1f5f9',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <RotateCcw size={17} color="#64748b" />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>
                                                                Límite de intentos
                                                            </div>
                                                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                                Evaluación formal o práctica
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <select
                                                        value={exLimiteIntentos}
                                                        onChange={(e) => setExLimiteIntentos(Number(e.target.value))}
                                                        style={{
                                                            padding: '5px 8px',
                                                            borderRadius: '6px',
                                                            border: '1px solid #cbd5e1',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            backgroundColor: '#f8fafc',
                                                            color: '#0f172a',
                                                            outline: 'none',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <option value={1}>1 intento</option>
                                                        <option value={2}>2 intentos</option>
                                                        <option value={3}>3 intentos</option>
                                                        <option value={5}>5 intentos</option>
                                                        <option value={0}>Ilimitados</option>
                                                    </select>
                                                </div>

                                                {exLimiteIntentos !== 1 && (
                                                    <div style={{
                                                        paddingTop: '8px',
                                                        borderTop: '1px solid #f1f5f9',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        gap: '8px'
                                                    }}>
                                                        <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#475569' }}>
                                                            Criterio de nota:
                                                        </span>
                                                        <select
                                                            value={exTipoCalificacion}
                                                            onChange={(e) => setExTipoCalificacion(e.target.value)}
                                                            style={{
                                                                padding: '4px 8px',
                                                                borderRadius: '6px',
                                                                border: '1px solid #cbd5e1',
                                                                fontSize: '11.5px',
                                                                fontWeight: '600',
                                                                backgroundColor: '#ffffff',
                                                                color: '#0f172a',
                                                                outline: 'none'
                                                            }}
                                                        >
                                                            <option value="MEJOR_NOTA">Nota más alta</option>
                                                            <option value="ULTIMO_INTENTO">Último intento</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </div>

                                            {/* 3. PREGUNTAS ALEATORIAS */}
                                            <div style={{
                                                backgroundColor: '#ffffff',
                                                border: exOrdenAleatorio ? '1.5px solid #93c5fd' : '1px solid #e2e8f0',
                                                borderRadius: '12px',
                                                padding: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        width: '34px',
                                                        height: '34px',
                                                        borderRadius: '8px',
                                                        backgroundColor: exOrdenAleatorio ? '#eff6ff' : '#f1f5f9',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Shuffle size={17} color={exOrdenAleatorio ? '#2563eb' : '#64748b'} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>
                                                            Preguntas aleatorias
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                            Orden distinto para cada alumno
                                                        </div>
                                                    </div>
                                                </div>
                                                <ToggleSwitch
                                                    checked={exOrdenAleatorio}
                                                    onChange={setExOrdenAleatorio}
                                                    activeColor="#2563eb"
                                                />
                                            </div>

                                            {/* 4. RETROALIMENTACIÓN */}
                                            <div style={{
                                                backgroundColor: '#ffffff',
                                                border: exMostrarRetroalimentacion ? '1.5px solid #93c5fd' : '1px solid #e2e8f0',
                                                borderRadius: '12px',
                                                padding: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        width: '34px',
                                                        height: '34px',
                                                        borderRadius: '8px',
                                                        backgroundColor: exMostrarRetroalimentacion ? '#eff6ff' : '#f1f5f9',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Lightbulb size={17} color={exMostrarRetroalimentacion ? '#2563eb' : '#64748b'} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>
                                                            Retroalimentación
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                            Muestra explicaciones al finalizar
                                                        </div>
                                                    </div>
                                                </div>
                                                <ToggleSwitch
                                                    checked={exMostrarRetroalimentacion}
                                                    onChange={setExMostrarRetroalimentacion}
                                                    activeColor="#2563eb"
                                                />
                                            </div>

                                            {/* 5. TIEMPO LÍMITE */}
                                            <div style={{
                                                backgroundColor: '#ffffff',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '12px',
                                                padding: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        width: '34px',
                                                        height: '34px',
                                                        borderRadius: '8px',
                                                        backgroundColor: '#f1f5f9',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Clock size={17} color="#64748b" />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>
                                                            Tiempo límite
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                            Duración máxima del examen
                                                        </div>
                                                    </div>
                                                </div>
                                                <select
                                                    value={exTiempoLimiteMinutos}
                                                    onChange={(e) => setExTiempoLimiteMinutos(Number(e.target.value))}
                                                    style={{
                                                        padding: '5px 8px',
                                                        borderRadius: '6px',
                                                        border: '1px solid #cbd5e1',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        backgroundColor: '#f8fafc',
                                                        color: '#0f172a',
                                                        outline: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value={0}>Sin límite</option>
                                                    <option value={10}>10 min</option>
                                                    <option value={15}>15 min</option>
                                                    <option value={20}>20 min</option>
                                                    <option value={30}>30 min</option>
                                                    <option value={45}>45 min</option>
                                                    <option value={60}>60 min</option>
                                                    <option value={90}>90 min</option>
                                                    <option value={120}>120 min</option>
                                                </select>
                                            </div>

                                            {/* 6. GRUPOS PERMITIDOS */}
                                            <div style={{
                                                backgroundColor: '#ffffff',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '12px',
                                                padding: '14px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '8px'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Users size={16} color="#64748b" />
                                                    <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>
                                                        Grupos o secciones (Opcional)
                                                    </span>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={exGruposPermitidos}
                                                    onChange={(e) => setExGruposPermitidos(e.target.value)}
                                                    placeholder="Ej: 5to A, 5to B, Aula 102"
                                                    style={{
                                                        width: '100%',
                                                        padding: '6px 10px',
                                                        borderRadius: '6px',
                                                        border: '1px solid #cbd5e1',
                                                        fontSize: '12px',
                                                        outline: 'none',
                                                        boxSizing: 'border-box'
                                                    }}
                                                />
                                            </div>

                                            {/* 7. VENTANA DE DISPONIBILIDAD (OCUPA TODO EL ANCHO) */}
                                            <div style={{
                                                gridColumn: '1 / -1',
                                                backgroundColor: '#ffffff',
                                                border: exProgramarFechas ? '1.5px solid #93c5fd' : '1px solid #e2e8f0',
                                                borderRadius: '12px',
                                                padding: '14px'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{
                                                            width: '34px',
                                                            height: '34px',
                                                            borderRadius: '8px',
                                                            backgroundColor: exProgramarFechas ? '#eff6ff' : '#f1f5f9',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <Calendar size={17} color={exProgramarFechas ? '#2563eb' : '#64748b'} />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>
                                                                Programar ventana de disponibilidad
                                                            </div>
                                                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                                Apertura y cierre automático del examen según fecha y hora
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ToggleSwitch
                                                        checked={exProgramarFechas}
                                                        onChange={setExProgramarFechas}
                                                        activeColor="#2563eb"
                                                    />
                                                </div>

                                                {exProgramarFechas && (
                                                    <div style={{
                                                        marginTop: '12px',
                                                        paddingTop: '12px',
                                                        borderTop: '1px solid #e2e8f0',
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                                        gap: '12px'
                                                    }}>
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                                                Fecha y hora de inicio:
                                                            </label>
                                                            <input
                                                                type="datetime-local"
                                                                value={exFechaInicio}
                                                                onChange={(e) => setExFechaInicio(e.target.value)}
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '7px 10px',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid #cbd5e1',
                                                                    fontSize: '12px',
                                                                    outline: 'none',
                                                                    boxSizing: 'border-box'
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                                                Fecha y hora de cierre:
                                                            </label>
                                                            <input
                                                                type="datetime-local"
                                                                value={exFechaFin}
                                                                onChange={(e) => setExFechaFin(e.target.value)}
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '7px 10px',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid #cbd5e1',
                                                                    fontSize: '12px',
                                                                    outline: 'none',
                                                                    boxSizing: 'border-box'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* BOTÓN GUARDAR CAMBIOS DE ESTE EXAMEN */}
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                                            <button
                                                type="button"
                                                onClick={handleGuardarExamen}
                                                disabled={guardandoExamen}
                                                style={{
                                                    background: '#0f172a',
                                                    color: '#ffffff',
                                                    border: 'none',
                                                    padding: '10px 22px',
                                                    borderRadius: '8px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: guardandoExamen ? 'not-allowed' : 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    opacity: guardandoExamen ? 0.7 : 1,
                                                    transition: 'all 0.15s ease'
                                                }}
                                                onMouseEnter={(e) => { if (!guardandoExamen) e.currentTarget.style.backgroundColor = '#1e293b'; }}
                                                onMouseLeave={(e) => { if (!guardandoExamen) e.currentTarget.style.backgroundColor = '#0f172a'; }}
                                            >
                                                {guardandoExamen ? (
                                                    <PulsingLoader size="sm" color="white" text="Guardando..." />
                                                ) : (
                                                    <>
                                                        <Save size={15} />
                                                        <span>Guardar Parámetros de este Examen</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{
                                        padding: '36px',
                                        textAlign: 'center',
                                        backgroundColor: '#f8fafc',
                                        borderRadius: '12px',
                                        border: '1px dashed #cbd5e1',
                                        color: '#64748b'
                                    }}>
                                        <FileText size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                                        <div style={{ fontSize: '14px', fontWeight: '600' }}>No hay cuestionarios seleccionados</div>
                                        <div style={{ fontSize: '12px', marginTop: '4px' }}>Crea tu primer examen en el menú Cuestionarios para configurar sus reglas específicas.</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* TARJETA B: REGLAS PREDETERMINADAS PARA NUEVOS EXÁMENES */}
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '18px',
                        border: '1px solid #e2e8f0',
                        padding: '26px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}>
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.6px',
                                    backgroundColor: '#f1f5f9',
                                    color: '#475569',
                                    padding: '3px 8px',
                                    borderRadius: '6px'
                                }}>
                                    Plantilla Global
                                </span>
                            </div>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                                Reglas Predeterminadas para Exámenes
                            </h2>
                            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                                Estos parámetros se asignarán de forma automática a todos los nuevos cuestionarios que crees
                            </p>
                        </div>

                        {mensajeExitoDefault && (
                            <div style={{
                                backgroundColor: '#ecfdf5',
                                color: '#065f46',
                                border: '1px solid #a7f3d0',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                marginBottom: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '13.5px',
                                fontWeight: '600'
                            }}>
                                <CheckCircle2 size={18} color="#10b981" />
                                <span>¡Reglas predeterminadas guardadas correctamente!</span>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            {/* REGLA 1: MODO SEGURO */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                                        Activar Modo Seguro (Anti-copia) por defecto
                                    </div>
                                    <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                                        Supervisa el cambio de pestaña en evaluaciones formales
                                    </div>
                                </div>
                                <ToggleSwitch
                                    checked={defaultModoSeguro}
                                    onChange={setDefaultModoSeguro}
                                    activeColor="#10b981"
                                />
                            </div>

                            {/* REGLA 2: PREGUNTAS ALEATORIAS */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                                        Preguntas en orden aleatorio por defecto
                                    </div>
                                    <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                                        Desordena las preguntas para cada alumno al responder
                                    </div>
                                </div>
                                <ToggleSwitch
                                    checked={defaultOrdenAleatorio}
                                    onChange={setDefaultOrdenAleatorio}
                                    activeColor="#10b981"
                                />
                            </div>

                            {/* REGLA 3: RETROALIMENTACIÓN */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                                        Retroalimentación explicativa al finalizar
                                    </div>
                                    <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                                        El alumno verá la justificación y soluciones al entregar
                                    </div>
                                </div>
                                <ToggleSwitch
                                    checked={defaultRetroalimentacion}
                                    onChange={setDefaultRetroalimentacion}
                                    activeColor="#10b981"
                                />
                            </div>

                            {/* REGLA 4: MOSTRAR CALIFICACIÓN */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                                        Mostrar calificación al alumno al finalizar
                                    </div>
                                    <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                                        El alumno conocerá su puntaje de inmediato
                                    </div>
                                </div>
                                <ToggleSwitch
                                    checked={defaultMostrarCalificacion}
                                    onChange={setDefaultMostrarCalificacion}
                                    activeColor="#10b981"
                                />
                            </div>

                            {/* REGLA 5: NOTIFICACIONES POR CORREO */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                                        Notificaciones por correo al recibir respuestas
                                    </div>
                                    <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                                        Recibe un aviso cada vez que un alumno entrega su examen
                                    </div>
                                </div>
                                <ToggleSwitch
                                    checked={defaultNotificaciones}
                                    onChange={setDefaultNotificaciones}
                                    activeColor="#10b981"
                                />
                            </div>

                            {/* REGLA 6: INTENTOS POR DEFECTO */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                                        Límite de intentos por defecto
                                    </div>
                                    <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                                        Número de oportunidades que tendrá el alumno
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <select
                                        value={defaultLimiteIntentos}
                                        onChange={(e) => setDefaultLimiteIntentos(Number(e.target.value))}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            backgroundColor: '#f8fafc',
                                            color: '#0f172a',
                                            outline: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value={1}>1 intento (Examen formal)</option>
                                        <option value={2}>2 intentos</option>
                                        <option value={3}>3 intentos</option>
                                        <option value={5}>5 intentos</option>
                                        <option value={0}>Ilimitados (Modo práctica)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* BOTÓN GUARDAR PREDETERMINADOS */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                            <button
                                type="button"
                                onClick={handleGuardarDefault}
                                disabled={guardandoDefault}
                                style={{
                                    background: '#0f172a',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '10px 22px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: guardandoDefault ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    opacity: guardandoDefault ? 0.7 : 1,
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => { if (!guardandoDefault) e.currentTarget.style.backgroundColor = '#1e293b'; }}
                                onMouseLeave={(e) => { if (!guardandoDefault) e.currentTarget.style.backgroundColor = '#0f172a'; }}
                            >
                                {guardandoDefault ? (
                                    <PulsingLoader size="sm" color="white" text="Guardando..." />
                                ) : (
                                    <>
                                        <Save size={15} />
                                        <span>Guardar Reglas Predeterminadas</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* PESTAÑA 2: PERFIL DEL PROFESOR                                            */}
            {/* ========================================================================= */}
            {seccionActiva === 'perfil' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {mensajeExitoPerfil && (
                        <div style={{
                            backgroundColor: '#ecfdf5',
                            color: '#065f46',
                            border: '1px solid #a7f3d0',
                            padding: '12px 18px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}>
                            <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Check size={14} strokeWidth={3} />
                            </div>
                            <span>Perfil actualizado y guardado correctamente.</span>
                        </div>
                    )}

                    {mensajeErrorPerfil && (
                        <div style={{
                            backgroundColor: '#fef2f2',
                            color: '#991b1b',
                            border: '1px solid #fecaca',
                            padding: '12px 18px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '14px'
                        }}>
                            <AlertCircle size={18} color="#dc2626" />
                            <span>{mensajeErrorPerfil}</span>
                        </div>
                    )}

                    <div style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        padding: '28px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}>
                        <h2 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                            Datos del Docente
                        </h2>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                            {foto ? (
                                <img
                                    src={foto}
                                    alt="Foto de perfil"
                                    style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '16px',
                                        objectFit: 'cover',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '16px',
                                    backgroundColor: '#2563eb',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '22px',
                                    fontWeight: '700',
                                    letterSpacing: '1px',
                                    flexShrink: 0
                                }}>
                                    {initials}
                                </div>
                            )}

                            <div>
                                <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', lineHeight: '1.2' }}>
                                    {nombreCompleto || 'Pablo Reyes'}
                                </div>
                                <div style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 6px 0' }}>
                                    {email || 'pablo.reyes@nativatec.edu'}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: 0,
                                        fontSize: '13px',
                                        color: '#2563eb',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        textDecoration: 'none',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                    onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                                >
                                    <Camera size={14} /> Cambiar foto de perfil
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #f1f5f9', margin: '0 0 24px 0' }} />

                        {/* CAMPOS DE FORMULARIO */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: '#64748b',
                                    letterSpacing: '0.6px',
                                    textTransform: 'uppercase',
                                    marginBottom: '8px'
                                }}>
                                    NOMBRE COMPLETO
                                </label>
                                <input
                                    type="text"
                                    value={nombreCompleto}
                                    onChange={(e) => setNombreCompleto(e.target.value)}
                                    placeholder="Pablo Reyes"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '14px',
                                        color: '#0f172a',
                                        boxSizing: 'border-box',
                                        outline: 'none',
                                        backgroundColor: '#ffffff'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: '#64748b',
                                    letterSpacing: '0.6px',
                                    textTransform: 'uppercase',
                                    marginBottom: '8px'
                                }}>
                                    CORREO ELECTRÓNICO
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="pablo.reyes@nativatec.edu"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '14px',
                                        color: '#0f172a',
                                        boxSizing: 'border-box',
                                        outline: 'none',
                                        backgroundColor: '#ffffff'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '11px',
                                fontWeight: '700',
                                color: '#64748b',
                                letterSpacing: '0.6px',
                                textTransform: 'uppercase',
                                marginBottom: '8px'
                            }}>
                                INSTITUCIÓN
                            </label>
                            <input
                                type="text"
                                value={institucion}
                                onChange={(e) => setInstitucion(e.target.value)}
                                placeholder="Instituto Nativatec"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '14px',
                                    color: '#0f172a',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    backgroundColor: '#ffffff'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '28px' }}>
                            <button
                                type="button"
                                onClick={handleGuardarPerfil}
                                disabled={guardandoPerfil}
                                style={{
                                    background: '#0f172a',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '10px 22px',
                                    borderRadius: '8px',
                                    fontSize: '13.5px',
                                    fontWeight: '600',
                                    cursor: guardandoPerfil ? 'not-allowed' : 'pointer',
                                    opacity: guardandoPerfil ? 0.7 : 1,
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => { if (!guardandoPerfil) e.currentTarget.style.backgroundColor = '#1e293b'; }}
                                onMouseLeave={(e) => { if (!guardandoPerfil) e.currentTarget.style.backgroundColor = '#0f172a'; }}
                            >
                                {guardandoPerfil ? (
                                    <PulsingLoader size="sm" color="white" text="Guardando perfil..." />
                                ) : (
                                    'Guardar Perfil'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
