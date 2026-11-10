import React, { useState, useEffect, useRef } from 'react';
import { getCurrentUser } from '../services/authService';
import { actualizarUsuario } from '../services/usuarioService';
import { Check, Camera, AlertCircle } from 'lucide-react';

export default function ConfiguracionView({ onUserUpdated }) {
    const currentUser = getCurrentUser() || {};

    // Obtener valores iniciales
    const initialNombre = currentUser.nombre || '';
    const initialApellido = currentUser.apellido || '';
    const initialNombreCompleto = `${initialNombre} ${initialApellido}`.trim() || 'Pablo Reyes';
    const initialEmail = currentUser.email || 'pablo.reyes@nativatec.edu';
    
    // Cargar preferencias guardadas en localStorage si existen
    const savedPrefs = JSON.parse(localStorage.getItem('preferencias_profesor') || '{}');
    const initialInstitucion = savedPrefs.institucion || currentUser.institucion || 'Instituto Nativatec';
    const initialNotificaciones = savedPrefs.notificacionesEmail ?? true;
    const initialMostrarCalificacion = savedPrefs.mostrarCalificacion ?? false;
    const initialPermitirReintentos = savedPrefs.permitirReintentos ?? false;
    const initialFoto = savedPrefs.foto || currentUser.foto || null;

    // Estados del formulario
    const [nombreCompleto, setNombreCompleto] = useState(initialNombreCompleto);
    const [email, setEmail] = useState(initialEmail);
    const [institucion, setInstitucion] = useState(initialInstitucion);
    const [foto, setFoto] = useState(initialFoto);

    // Estados de preferencias (Toggles)
    const [notificaciones, setNotificaciones] = useState(initialNotificaciones);
    const [mostrarCalificacion, setMostrarCalificacion] = useState(initialMostrarCalificacion);
    const [permitirReintentos, setPermitirReintentos] = useState(initialPermitirReintentos);

    // Estados de feedback
    const [guardando, setGuardando] = useState(false);
    const [mensajeExito, setMensajeExito] = useState(false);
    const [mensajeError, setMensajeError] = useState('');

    const fileInputRef = useRef(null);

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

    // Guardar cambios
    const handleGuardarCambios = async () => {
        try {
            setGuardando(true);
            setMensajeError('');
            setMensajeExito(false);

            // Separar nombre y apellido
            const partes = nombreCompleto.trim().split(/\s+/);
            const nuevoNombre = partes[0] || '';
            const nuevoApellido = partes.slice(1).join(' ') || '';

            // 1. Guardar en Base de Datos si el usuario tiene ID
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

            // 2. Guardar en localStorage
            const updatedUser = {
                ...currentUser,
                nombre: nuevoNombre,
                apellido: nuevoApellido,
                email: email,
                institucion: institucion,
                foto: foto
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            const nuevasPrefs = {
                institucion,
                foto,
                notificacionesEmail: notificaciones,
                mostrarCalificacion: mostrarCalificacion,
                permitirReintentos: permitirReintentos
            };
            localStorage.setItem('preferencias_profesor', JSON.stringify(nuevasPrefs));

            // 3. Notificar al componente principal para refrescar el Sidebar / Header
            if (onUserUpdated) {
                onUserUpdated(updatedUser);
            }

            setMensajeExito(true);
            setTimeout(() => {
                setMensajeExito(false);
            }, 3500);

        } catch (err) {
            console.error("Error al guardar cambios:", err);
            setMensajeError("Hubo un error al guardar la configuración.");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', maxWidth: '880px' }}>
            {/* CABECERA */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', color: '#0f172a', fontWeight: '700' }}>
                    Configuración
                </h1>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    Gestiona tu perfil y preferencias de la plataforma
                </p>
            </div>

            {/* MENSAJE DE ÉXITO */}
            {mensajeExito && (
                <div style={{
                    backgroundColor: '#ecfdf5',
                    color: '#065f46',
                    border: '1px solid #a7f3d0',
                    padding: '12px 18px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px',
                    fontWeight: '500',
                    animation: 'fadeIn 0.3s ease'
                }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={14} strokeWidth={3} />
                    </div>
                    <span>Cambios guardados correctamente.</span>
                </div>
            )}

            {/* MENSAJE DE ERROR */}
            {mensajeError && (
                <div style={{
                    backgroundColor: '#fef2f2',
                    color: '#991b1b',
                    border: '1px solid #fecaca',
                    padding: '12px 18px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px'
                }}>
                    <AlertCircle size={18} color="#dc2626" />
                    <span>{mensajeError}</span>
                </div>
            )}

            {/* TARJETA 1: PERFIL DEL PROFESOR */}
            <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '28px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                marginBottom: '24px'
            }}>
                <h2 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                    Perfil del profesor
                </h2>

                {/* BLOQUE AVATAR + DATOS BÁSICOS */}
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
                                fontWeight: '500',
                                cursor: 'pointer',
                                textDecoration: 'none',
                                display: 'inline-block'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                        >
                            Cambiar foto
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
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
                                backgroundColor: '#ffffff',
                                transition: 'border-color 0.2s, box-shadow 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#2563eb';
                                e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e2e8f0';
                                e.target.style.boxShadow = 'none';
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
                                backgroundColor: '#ffffff',
                                transition: 'border-color 0.2s, box-shadow 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#2563eb';
                                e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e2e8f0';
                                e.target.style.boxShadow = 'none';
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
                            backgroundColor: '#ffffff',
                            transition: 'border-color 0.2s, box-shadow 0.2s'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#2563eb';
                            e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>
            </div>

            {/* TARJETA 2: PREFERENCIAS */}
            <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '28px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                marginBottom: '28px'
            }}>
                <h2 style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                    Preferencias
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    {/* PREFERENCIA 1 */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                                Notificaciones por correo al recibir respuestas
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                                Recibe un aviso cada vez que un alumno entrega su examen
                            </div>
                        </div>

                        {/* TOGGLE SWITCH */}
                        <div
                            onClick={() => setNotificaciones(!notificaciones)}
                            style={{
                                width: '48px',
                                height: '26px',
                                borderRadius: '14px',
                                backgroundColor: notificaciones ? '#10b981' : '#e2e8f0',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'background-color 0.25s ease',
                                flexShrink: 0
                            }}
                        >
                            <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: '#ffffff',
                                position: 'absolute',
                                top: '3px',
                                left: notificaciones ? '25px' : '3px',
                                transition: 'left 0.25s ease',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                            }} />
                        </div>
                    </div>

                    {/* PREFERENCIA 2 */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                                Mostrar calificación al alumno al finalizar
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                                El alumno verá su puntuación al entregar
                            </div>
                        </div>

                        {/* TOGGLE SWITCH */}
                        <div
                            onClick={() => setMostrarCalificacion(!mostrarCalificacion)}
                            style={{
                                width: '48px',
                                height: '26px',
                                borderRadius: '14px',
                                backgroundColor: mostrarCalificacion ? '#10b981' : '#e2e8f0',
                                border: mostrarCalificacion ? 'none' : '1.5px solid #334155',
                                boxSizing: 'border-box',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease',
                                flexShrink: 0
                            }}
                        >
                            <div style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                backgroundColor: mostrarCalificacion ? '#ffffff' : '#ffffff',
                                position: 'absolute',
                                top: mostrarCalificacion ? '3px' : '2px',
                                left: mostrarCalificacion ? '25px' : '3px',
                                transition: 'left 0.25s ease',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                            }} />
                        </div>
                    </div>

                    {/* PREFERENCIA 3 */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                                Permitir reintentos del examen
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                                Los alumnos pueden realizar el examen más de una vez
                            </div>
                        </div>

                        {/* TOGGLE SWITCH */}
                        <div
                            onClick={() => setPermitirReintentos(!permitirReintentos)}
                            style={{
                                width: '48px',
                                height: '26px',
                                borderRadius: '14px',
                                backgroundColor: permitirReintentos ? '#10b981' : '#cbd5e1',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'background-color 0.25s ease',
                                flexShrink: 0
                            }}
                        >
                            <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: '#ffffff',
                                position: 'absolute',
                                top: '3px',
                                left: permitirReintentos ? '25px' : '3px',
                                transition: 'left 0.25s ease',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                            }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTÓN GUARDAR CAMBIOS */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
                <button
                    type="button"
                    onClick={handleGuardarCambios}
                    disabled={guardando}
                    style={{
                        backgroundColor: '#1e3a8a',
                        color: '#ffffff',
                        border: 'none',
                        padding: '12px 28px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: guardando ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s, transform 0.1s',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        opacity: guardando ? 0.7 : 1
                    }}
                    onMouseOver={(e) => {
                        if (!guardando) e.currentTarget.style.backgroundColor = '#1e293b';
                    }}
                    onMouseOut={(e) => {
                        if (!guardando) e.currentTarget.style.backgroundColor = '#1e3a8a';
                    }}
                >
                    {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
            </div>
        </div>
    );
}
