import React, { useState, useEffect } from 'react';
import {
    listarCursosV3,
    crearCursoV3,
    actualizarCursoV3,
    agregarSeccionV3,
    desactivarSeccionV3
} from '../services/v3Service';
import useResponsive from '../hooks/useResponsive';
import {
    BookOpen,
    Plus,
    Users,
    Trash2,
    Check,
    X,
    Edit3,
    Layers,
    AlertCircle
} from 'lucide-react';

const COLORES_CURSO = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export default function CursosSeccionesView() {
    const { isMobile } = useResponsive();
    const [cursos, setCursos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    // Formulario nuevo curso
    const [mostrarCrear, setMostrarCrear] = useState(false);
    const [nombre, setNombre] = useState('');
    const [codigoCurso, setCodigoCurso] = useState('');
    const [periodoAcademico, setPeriodoAcademico] = useState('2026-II');
    const [colorHex, setColorHex] = useState('#3b82f6');
    const [seccionesTexto, setSeccionesTexto] = useState('5to A, 5to B');
    const [guardando, setGuardando] = useState(false);

    // Agregar sección rápida por curso
    const [nuevaSeccionPorCurso, setNuevaSeccionPorCurso] = useState({});
    const [editandoCursoId, setEditandoCursoId] = useState(null);
    const [editNombre, setEditNombre] = useState('');

    const cargarCursos = async () => {
        try {
            setCargando(true);
            const data = await listarCursosV3(true);
            setCursos(data);
        } catch (err) {
            setError('No se pudieron cargar los cursos.');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarCursos();
    }, []);

    const handleCrearCurso = async (e) => {
        e.preventDefault();
        if (!nombre.trim()) return;
        try {
            setGuardando(true);
            setError('');
            const seccionesIniciales = seccionesTexto
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);

            await crearCursoV3({
                nombre: nombre.trim(),
                codigoCurso: codigoCurso.trim() || null,
                periodoAcademico: periodoAcademico.trim() || null,
                colorHex,
                seccionesIniciales
            });

            setNombre('');
            setCodigoCurso('');
            setSeccionesTexto('');
            setMostrarCrear(false);
            await cargarCursos();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al crear el curso.');
        } finally {
            setGuardando(false);
        }
    };

    const handleAgregarSeccion = async (cursoId) => {
        const val = (nuevaSeccionPorCurso[cursoId] || '').trim();
        if (!val) return;
        try {
            setError('');
            await agregarSeccionV3(cursoId, val);
            setNuevaSeccionPorCurso((prev) => ({ ...prev, [cursoId]: '' }));
            await cargarCursos();
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo agregar la sección.');
        }
    };

    const handleDesactivarSeccion = async (cursoId, seccionId) => {
        try {
            setError('');
            await desactivarSeccionV3(cursoId, seccionId);
            await cargarCursos();
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo eliminar la sección.');
        }
    };

    const handleGuardarNombreCurso = async (cursoId) => {
        if (!editNombre.trim()) return;
        try {
            await actualizarCursoV3(cursoId, { nombre: editNombre.trim() });
            setEditandoCursoId(null);
            await cargarCursos();
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo actualizar el curso.');
        }
    };

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '12px',
                marginBottom: '22px'
            }}>
                <div>
                    <h1 style={{ margin: '0 0 4px 0', fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: '#0f172a' }}>
                        Cursos y Secciones
                    </h1>
                    <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>
                        Organiza tus materias y salones reales para ordenar actas de notas y elegir sección al compartir sesiones.
                    </p>
                </div>

                <button
                    onClick={() => setMostrarCrear((v) => !v)}
                    style={{
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        padding: '11px 18px',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '13.5px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Plus size={17} /> {mostrarCrear ? 'Cancelar' : 'Nuevo Curso'}
                </button>
            </div>

            {error && (
                <div style={{
                    backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
                    borderRadius: '12px', padding: '11px 14px', marginBottom: '16px', fontSize: '13px', fontWeight: '600',
                    display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <AlertCircle size={17} /> {error}
                </div>
            )}

            {mostrarCrear && (
                <form onSubmit={handleCrearCurso} style={{
                    backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0',
                    marginBottom: '22px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                }}>
                    <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                        Registrar nuevo curso
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr',
                        gap: '12px',
                        marginBottom: '12px'
                    }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                                Nombre del curso *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Ej: Matemática Aplicada"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                                Código (opcional)
                            </label>
                            <input
                                type="text"
                                placeholder="Ej: MAT-501"
                                value={codigoCurso}
                                onChange={(e) => setCodigoCurso(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                                Periodo
                            </label>
                            <input
                                type="text"
                                placeholder="Ej: 2026-II"
                                value={periodoAcademico}
                                onChange={(e) => setPeriodoAcademico(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
                        gap: '12px',
                        alignItems: 'end',
                        marginBottom: '16px'
                    }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                                Secciones iniciales (separadas por coma)
                            </label>
                            <input
                                type="text"
                                placeholder="Ej: 5to A, 5to B, 5to C"
                                value={seccionesTexto}
                                onChange={(e) => setSeccionesTexto(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                                Color identificador
                            </label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', height: '38px' }}>
                                {COLORES_CURSO.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColorHex(c)}
                                        style={{
                                            width: '26px', height: '26px', borderRadius: '50%', backgroundColor: c,
                                            border: colorHex === c ? '3px solid #0f172a' : '2px solid #ffffff',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.2)', cursor: 'pointer'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={guardando}
                        style={{
                            backgroundColor: '#10b981', color: '#ffffff', border: 'none',
                            padding: '10px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer'
                        }}
                    >
                        {guardando ? 'Guardando...' : 'Guardar Curso'}
                    </button>
                </form>
            )}

            {cargando ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Cargando cursos...</div>
            ) : cursos.length === 0 ? (
                <div style={{
                    backgroundColor: '#ffffff', borderRadius: '16px', padding: '42px 20px', textAlign: 'center',
                    border: '1px dashed #cbd5e1'
                }}>
                    <Layers size={38} color="#94a3b8" style={{ marginBottom: '10px' }} />
                    <h3 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '17px', fontWeight: '700' }}>
                        Aún no tienes cursos registrados
                    </h3>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '13.5px' }}>
                        Crea un curso con tus secciones (ej. 5to A, 5to B) para organizar tus sesiones de evaluación.
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: '16px'
                }}>
                    {cursos.map((curso) => (
                        <div key={curso.id} style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '16px',
                            padding: '18px 20px',
                            border: '1px solid #e2e8f0',
                            borderTop: `4px solid ${curso.colorHex || '#3b82f6'}`,
                            boxShadow: '0 4px 10px rgba(15, 23, 42, 0.03)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                                {editandoCursoId === curso.id ? (
                                    <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                                        <input
                                            type="text"
                                            value={editNombre}
                                            onChange={(e) => setEditNombre(e.target.value)}
                                            style={{ flex: 1, padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                                        />
                                        <button onClick={() => handleGuardarNombreCurso(curso.id)} style={{ border: 'none', background: '#10b981', color: '#fff', borderRadius: '8px', padding: '6px 8px', cursor: 'pointer' }}>
                                            <Check size={14} />
                                        </button>
                                        <button onClick={() => setEditandoCursoId(null)} style={{ border: 'none', background: '#f1f5f9', color: '#475569', borderRadius: '8px', padding: '6px 8px', cursor: 'pointer' }}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <BookOpen size={16} color={curso.colorHex || '#3b82f6'} />
                                            <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: '800', color: '#0f172a' }}>
                                                {curso.nombre}
                                            </h3>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                                            {[curso.codigoCurso, curso.periodoAcademico].filter(Boolean).join(' · ') || 'Sin periodo asignado'}
                                        </div>
                                    </div>
                                )}

                                {editandoCursoId !== curso.id && (
                                    <button
                                        onClick={() => {
                                            setEditandoCursoId(curso.id);
                                            setEditNombre(curso.nombre);
                                        }}
                                        title="Editar nombre"
                                        style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#64748b' }}
                                    >
                                        <Edit3 size={14} />
                                    </button>
                                )}
                            </div>

                            <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Users size={13} /> Secciones ({curso.secciones?.length || 0})
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                                {(curso.secciones || []).map((sec) => (
                                    <span key={sec.id} style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                        backgroundColor: '#f1f5f9', color: '#0f172a', borderRadius: '999px',
                                        padding: '4px 10px', fontSize: '12.5px', fontWeight: '600', border: '1px solid #e2e8f0'
                                    }}>
                                        {sec.nombre}
                                        <button
                                            onClick={() => handleDesactivarSeccion(curso.id, sec.id)}
                                            title="Quitar sección"
                                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex' }}
                                        >
                                            <X size={13} />
                                        </button>
                                    </span>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '6px' }}>
                                <input
                                    type="text"
                                    placeholder="Nueva sección (ej. 5to C)"
                                    value={nuevaSeccionPorCurso[curso.id] || ''}
                                    onChange={(e) => setNuevaSeccionPorCurso((prev) => ({ ...prev, [curso.id]: e.target.value }))}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAgregarSeccion(curso.id);
                                        }
                                    }}
                                    style={{
                                        flex: 1, padding: '8px 10px', borderRadius: '8px',
                                        border: '1px solid #cbd5e1', fontSize: '12.5px', outline: 'none'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleAgregarSeccion(curso.id)}
                                    style={{
                                        backgroundColor: '#0f172a', color: '#ffffff', border: 'none',
                                        borderRadius: '8px', padding: '8px 12px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer'
                                    }}
                                >
                                    Añadir
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

