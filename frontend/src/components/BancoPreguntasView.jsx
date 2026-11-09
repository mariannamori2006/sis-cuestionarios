import React, { useState, useEffect } from 'react';
import {
    obtenerPreguntasBanco,
    obtenerMateriasBanco,
    crearPreguntaBanco,
    actualizarPreguntaBanco,
    eliminarPreguntaBanco
} from '../services/bancoPreguntaService';
import {
    BookOpen,
    Plus,
    Search,
    Filter,
    Edit3,
    Trash2,
    CheckCircle2,
    XCircle,
    HelpCircle,
    Sparkles,
    Image as ImageIcon,
    Tag,
    Layers,
    Award,
    Check,
    X,
    Upload
} from 'lucide-react';

const DIFICULTADES = [
    { key: 'TODAS', label: 'Todas las dificultades', color: '#64748b', bg: '#f1f5f9' },
    { key: 'FACIL', label: 'Fácil', color: '#16a34a', bg: '#dcfce7', border: '#86efac' },
    { key: 'MEDIA', label: 'Media', color: '#d97706', bg: '#fef3c7', border: '#fcd34d' },
    { key: 'DIFICIL', label: 'Difícil', color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' }
];

const MATERIAS_SUGERIDAS = [
    'General',
    'Matemáticas',
    'Historia',
    'Informática',
    'Ciencias',
    'Literatura',
    'Física',
    'Química',
    'Inglés'
];

export default function BancoPreguntasView() {
    const [preguntas, setPreguntas] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [filtroMateria, setFiltroMateria] = useState('');
    const [filtroDificultad, setFiltroDificultad] = useState('TODAS');
    const [busqueda, setBusqueda] = useState('');

    // Modal de creación / edición
    const [modalAbierto, setModalAbierto] = useState(false);
    const [preguntaEditando, setPreguntaEditando] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [errorModal, setErrorModal] = useState('');

    // Formulario modal
    const [formMateria, setFormMateria] = useState('Informática');
    const [formTema, setFormTema] = useState('');
    const [formDificultad, setFormDificultad] = useState('MEDIA');
    const [formTipo, setFormTipo] = useState('OPCION_MULTIPLE');
    const [formEnunciado, setFormEnunciado] = useState('');
    const [formPuntos, setFormPuntos] = useState(4.0);
    const [formImagenUrl, setFormImagenUrl] = useState('');
    const [formExplicacion, setFormExplicacion] = useState('');
    const [formOpciones, setFormOpciones] = useState([
        { texto: '', correcta: true },
        { texto: '', correcta: false },
        { texto: '', correcta: false },
        { texto: '', correcta: false }
    ]);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const [lista, mats] = await Promise.all([
                obtenerPreguntasBanco({
                    materia: filtroMateria,
                    dificultad: filtroDificultad === 'TODAS' ? null : filtroDificultad,
                    buscar: busqueda
                }),
                obtenerMateriasBanco()
            ]);
            setPreguntas(lista);
            setMaterias(mats || []);
        } catch (err) {
            console.error('Error al cargar preguntas del banco:', err);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, [filtroMateria, filtroDificultad]);

    const handleBuscar = (e) => {
        e.preventDefault();
        cargarDatos();
    };

    const abrirCrearModal = () => {
        setPreguntaEditando(null);
        setFormMateria(filtroMateria || 'Informática');
        setFormTema('');
        setFormDificultad('MEDIA');
        setFormTipo('OPCION_MULTIPLE');
        setFormEnunciado('');
        setFormPuntos(4.0);
        setFormImagenUrl('');
        setFormExplicacion('');
        setFormOpciones([
            { texto: '', correcta: true },
            { texto: '', correcta: false },
            { texto: '', correcta: false },
            { texto: '', correcta: false }
        ]);
        setErrorModal('');
        setModalAbierto(true);
    };

    const abrirEditarModal = (p) => {
        setPreguntaEditando(p);
        setFormMateria(p.materia || 'General');
        setFormTema(p.tema || '');
        setFormDificultad(p.dificultad || 'MEDIA');
        setFormTipo(p.tipo || 'OPCION_MULTIPLE');
        setFormEnunciado(p.enunciado || p.textoPregunta || '');
        setFormPuntos(p.puntos !== undefined && p.puntos !== null ? p.puntos : 4.0);
        setFormImagenUrl(p.imagenUrl || '');
        setFormExplicacion(p.explicacion || '');

        if (p.opciones && p.opciones.length > 0) {
            setFormOpciones(p.opciones.map(o => ({
                id: o.id,
                texto: o.texto || o.textoOpcion || '',
                correcta: Boolean(o.correcta || o.esCorrecta)
            })));
        } else if (p.tipo === 'VERDADERO_FALSO') {
            setFormOpciones([
                { texto: 'Verdadero', correcta: true },
                { texto: 'Falso', correcta: false }
            ]);
        } else {
            setFormOpciones([
                { texto: '', correcta: true },
                { texto: '', correcta: false },
                { texto: '', correcta: false },
                { texto: '', correcta: false }
            ]);
        }

        setErrorModal('');
        setModalAbierto(true);
    };

    const handleTipoChange = (nuevoTipo) => {
        setFormTipo(nuevoTipo);
        if (nuevoTipo === 'VERDADERO_FALSO') {
            setFormOpciones([
                { texto: 'Verdadero', correcta: true },
                { texto: 'Falso', correcta: false }
            ]);
        } else if (nuevoTipo === 'RESPUESTA_CORTA') {
            setFormOpciones([
                { texto: '', correcta: true }
            ]);
        } else {
            setFormOpciones([
                { texto: '', correcta: true },
                { texto: '', correcta: false },
                { texto: '', correcta: false },
                { texto: '', correcta: false }
            ]);
        }
    };

    const handleOpcionChange = (idx, texto) => {
        const nuevas = [...formOpciones];
        nuevas[idx].texto = texto;
        setFormOpciones(nuevas);
    };

    const handleSeleccionarCorrecta = (idx) => {
        const nuevas = formOpciones.map((op, i) => ({
            ...op,
            correcta: i === idx
        }));
        setFormOpciones(nuevas);
    };

    const agregarOpcion = () => {
        if (formOpciones.length >= 6) return;
        setFormOpciones([...formOpciones, { texto: '', correcta: false }]);
    };

    const eliminarOpcion = (idx) => {
        if (formOpciones.length <= 2) return;
        const nuevas = formOpciones.filter((_, i) => i !== idx);
        if (!nuevas.some(op => op.correcta) && nuevas.length > 0) {
            nuevas[0].correcta = true;
        }
        setFormOpciones(nuevas);
    };

    const handleSubirImagen = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('La imagen no debe superar los 5 MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            setFormImagenUrl(ev.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleGuardarPregunta = async (e) => {
        e.preventDefault();
        if (!formEnunciado.trim()) {
            setErrorModal('El enunciado de la pregunta es obligatorio.');
            return;
        }
        if (formTipo !== 'RESPUESTA_CORTA') {
            const tienenTexto = formOpciones.every(o => o.texto && o.texto.trim() !== '');
            if (!tienenTexto) {
                setErrorModal('Todas las opciones de respuesta deben tener texto.');
                return;
            }
            const tieneCorrecta = formOpciones.some(o => o.correcta);
            if (!tieneCorrecta) {
                setErrorModal('Debes marcar al menos una opción como respuesta correcta.');
                return;
            }
        }

        const payload = {
            materia: formMateria.trim() || 'General',
            tema: formTema.trim() || null,
            dificultad: formDificultad,
            tipo: formTipo,
            enunciado: formEnunciado.trim(),
            puntos: parseFloat(formPuntos) || 4.0,
            imagenUrl: formImagenUrl && formImagenUrl.trim() !== '' ? formImagenUrl.trim() : null,
            explicacion: formExplicacion && formExplicacion.trim() !== '' ? formExplicacion.trim() : null,
            opciones: formOpciones.map(o => ({
                id: o.id || null,
                texto: o.texto.trim(),
                correcta: Boolean(o.correcta)
            }))
        };

        try {
            setGuardando(true);
            setErrorModal('');
            if (preguntaEditando?.id) {
                await actualizarPreguntaBanco(preguntaEditando.id, payload);
            } else {
                await crearPreguntaBanco(payload);
            }
            setModalAbierto(false);
            cargarDatos();
        } catch (err) {
            console.error('Error al guardar en el banco:', err);
            setErrorModal(err.response?.data?.message || 'Error al guardar la pregunta en el banco.');
        } finally {
            setGuardando(false);
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta pregunta del banco? Esta acción no se puede deshacer.')) {
            return;
        }
        try {
            await eliminarPreguntaBanco(id);
            cargarDatos();
        } catch (err) {
            console.error('Error al eliminar pregunta:', err);
            alert('No se pudo eliminar la pregunta.');
        }
    };

    // Estadísticas rápidas del banco
    const totalFaciles = preguntas.filter(p => p.dificultad === 'FACIL').length;
    const totalMedias = preguntas.filter(p => p.dificultad === 'MEDIA').length;
    const totalDificiles = preguntas.filter(p => p.dificultad === 'DIFICIL').length;

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', backgroundColor: '#f8fafc' }}>
            {/* ENCABEZADO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '8px', borderRadius: '10px' }}>
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                                Banco Centralizado de Preguntas
                            </h1>
                            <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>
                                Repositorio para guardar, catalogar y reutilizar preguntas por materia y nivel de dificultad.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={abrirCrearModal}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        padding: '10px 18px',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                >
                    <Plus size={18} /> Nueva Pregunta en el Banco
                </button>
            </div>

            {/* TARJETAS RESUMEN */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ background: '#f1f5f9', color: '#475569', padding: '10px', borderRadius: '10px' }}>
                        <Layers size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Total en Banco</div>
                        <div style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>{preguntas.length}</div>
                    </div>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px', borderRadius: '10px' }}>
                        <CheckCircle2 size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Nivel Fácil</div>
                        <div style={{ fontSize: '22px', fontWeight: '700', color: '#16a34a' }}>{totalFaciles}</div>
                    </div>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ background: '#fef3c7', color: '#d97706', padding: '10px', borderRadius: '10px' }}>
                        <Sparkles size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Nivel Medio</div>
                        <div style={{ fontSize: '22px', fontWeight: '700', color: '#d97706' }}>{totalMedias}</div>
                    </div>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '10px' }}>
                        <Award size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Nivel Difícil</div>
                        <div style={{ fontSize: '22px', fontWeight: '700', color: '#dc2626' }}>{totalDificiles}</div>
                    </div>
                </div>
            </div>

            {/* FILTROS Y BÚSQUEDA */}
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px 20px', marginBottom: '24px' }}>
                <form onSubmit={handleBuscar} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Búsqueda por texto */}
                    <div style={{ flex: '1 1 240px', position: 'relative' }}>
                        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Buscar por pregunta, tema o contenido..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '9px 12px 9px 36px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Filtro por Materia */}
                    <div style={{ minWidth: '180px' }}>
                        <select
                            value={filtroMateria}
                            onChange={(e) => setFiltroMateria(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '9px 12px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontSize: '14px',
                                backgroundColor: '#ffffff',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="">Todas las materias</option>
                            {Array.from(new Set([...materias, ...MATERIAS_SUGERIDAS])).map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tabs de Dificultad */}
                    <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                        {DIFICULTADES.map((d) => {
                            const activa = filtroDificultad === d.key;
                            return (
                                <button
                                    type="button"
                                    key={d.key}
                                    onClick={() => setFiltroDificultad(d.key)}
                                    style={{
                                        border: 'none',
                                        background: activa ? '#ffffff' : 'transparent',
                                        color: activa ? (d.color !== '#64748b' ? d.color : '#0f172a') : '#64748b',
                                        fontWeight: activa ? '600' : '500',
                                        fontSize: '13px',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        boxShadow: activa ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    {d.label}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="submit"
                        style={{
                            padding: '9px 16px',
                            background: '#0f172a',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Filtrar
                    </button>
                </form>
            </div>

            {/* LISTADO DE PREGUNTAS */}
            {cargando ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
                    <div style={{ fontSize: '15px', fontWeight: '500' }}>Cargando banco de preguntas...</div>
                </div>
            ) : preguntas.length === 0 ? (
                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1', padding: '60px 20px', textAlign: 'center' }}>
                    <BookOpen size={48} color="#94a3b8" style={{ marginBottom: '12px' }} />
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: '0 0 6px 0' }}>
                        No se encontraron preguntas en el banco
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
                        Agrega preguntas frecuentes o exámenes anteriores para reutilizarlas en cualquier momento.
                    </p>
                    <button
                        onClick={abrirCrearModal}
                        style={{
                            padding: '8px 16px',
                            background: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Crear primera pregunta
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                    {preguntas.map((p, idx) => {
                        const difInfo = DIFICULTADES.find(d => d.key === p.dificultad) || DIFICULTADES[2];
                        const puntosVal = p.puntos !== undefined && p.puntos !== null ? p.puntos : (p.puntosDefecto || 4.0);

                        return (
                            <div
                                key={p.id || idx}
                                style={{
                                    background: '#ffffff',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    padding: '20px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '14px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {/* HEADER DE TARJETA */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        {/* Chip Materia */}
                                        <span style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                                            {p.materia || 'General'}
                                        </span>

                                        {/* Chip Tema si existe */}
                                        {p.tema && (
                                            <span style={{ background: '#f8fafc', color: '#475569', fontSize: '12px', fontWeight: '500', padding: '3px 10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                                {p.tema}
                                            </span>
                                        )}

                                        {/* Chip Dificultad */}
                                        <span style={{ background: difInfo.bg, color: difInfo.color, border: `1px solid ${difInfo.border || difInfo.color}`, fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '12px' }}>
                                            ● {difInfo.label}
                                        </span>

                                        {/* Chip Tipo */}
                                        <span style={{ background: '#f1f5f9', color: '#334155', fontSize: '12px', fontWeight: '500', padding: '3px 8px', borderRadius: '6px' }}>
                                            {p.tipo === 'VERDADERO_FALSO' ? 'Verdadero/Falso' : p.tipo === 'RESPUESTA_CORTA' ? 'Respuesta escrita' : 'Opción múltiple'}
                                        </span>

                                        {/* Chip Ponderación */}
                                        <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontSize: '12px', fontWeight: '700', padding: '3px 9px', borderRadius: '6px' }}>
                                            {puntosVal.toFixed(1)} pts
                                        </span>
                                    </div>

                                    {/* Acciones */}
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => abrirEditarModal(p)}
                                            style={{
                                                background: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '6px',
                                                padding: '6px 10px',
                                                color: '#334155',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                            title="Editar pregunta"
                                        >
                                            <Edit3 size={14} /> Editar
                                        </button>
                                        <button
                                            onClick={() => handleEliminar(p.id)}
                                            style={{
                                                background: '#fef2f2',
                                                border: '1px solid #fecaca',
                                                borderRadius: '6px',
                                                padding: '6px 10px',
                                                color: '#dc2626',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                            title="Eliminar del banco"
                                        >
                                            <Trash2 size={14} /> Eliminar
                                        </button>
                                    </div>
                                </div>

                                {/* ENUNCIADO DE LA PREGUNTA */}
                                <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', lineHeight: '1.5' }}>
                                    {p.enunciado || p.textoPregunta}
                                </div>

                                {/* IMAGEN SI TIENE */}
                                {p.imagenUrl && (
                                    <div style={{ maxWidth: '300px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                        <img src={p.imagenUrl} alt="Pregunta" style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', backgroundColor: '#f8fafc' }} />
                                    </div>
                                )}

                                {/* OPCIONES */}
                                {p.opciones && p.opciones.length > 0 && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px', marginTop: '4px' }}>
                                        {p.opciones.map((op, oIdx) => {
                                            const esCorrecta = Boolean(op.correcta || op.esCorrecta);
                                            return (
                                                <div
                                                    key={op.id || oIdx}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        padding: '10px 14px',
                                                        borderRadius: '8px',
                                                        fontSize: '13px',
                                                        background: esCorrecta ? '#f0fdf4' : '#f8fafc',
                                                        border: `1px solid ${esCorrecta ? '#86efac' : '#e2e8f0'}`,
                                                        color: esCorrecta ? '#15803d' : '#334155',
                                                        fontWeight: esCorrecta ? '600' : '400'
                                                    }}
                                                >
                                                    {esCorrecta ? (
                                                        <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                                                    ) : (
                                                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #cbd5e1', flexShrink: 0 }} />
                                                    )}
                                                    <span style={{ wordBreak: 'break-word' }}>{op.texto || op.textoOpcion}</span>
                                                    {esCorrecta && (
                                                        <span style={{ marginLeft: 'auto', fontSize: '11px', background: '#dcfce7', color: '#16a34a', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                                                            Correcta
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* EXPLICACIÓN / RETROALIMENTACIÓN */}
                                {p.explicacion && (
                                    <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 14px', borderLeft: '3px solid #3b82f6', fontSize: '13px', color: '#475569' }}>
                                        <span style={{ fontWeight: '600', color: '#1d4ed8' }}>💡 Retroalimentación explicativa: </span>
                                        {p.explicacion}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL CREAR / EDITAR PREGUNTA */}
            {modalAbierto && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    backdropFilter: 'blur(3px)',
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '750px',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        overflow: 'hidden'
                    }}>
                        {/* HEADER MODAL */}
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                                    {preguntaEditando ? 'Editar Pregunta del Banco' : 'Nueva Pregunta en el Banco'}
                                </h3>
                                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                                    Configura los metadatos de materia, nivel de dificultad y ponderación vigesimal.
                                </p>
                            </div>
                            <button
                                onClick={() => setModalAbierto(false)}
                                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px', borderRadius: '8px' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* BODY MODAL */}
                        <form onSubmit={handleGuardarPregunta} style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            {errorModal && (
                                <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                                    {errorModal}
                                </div>
                            )}

                            {/* FILA: MATERIA, TEMA, DIFICULTAD, PUNTOS */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                                        Materia *
                                    </label>
                                    <input
                                        type="text"
                                        list="lista-materias-banco"
                                        value={formMateria}
                                        onChange={(e) => setFormMateria(e.target.value)}
                                        placeholder="Ej. Matemáticas"
                                        required
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                                    />
                                    <datalist id="lista-materias-banco">
                                        {Array.from(new Set([...materias, ...MATERIAS_SUGERIDAS])).map(m => (
                                            <option key={m} value={m} />
                                        ))}
                                    </datalist>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                                        Tema específico
                                    </label>
                                    <input
                                        type="text"
                                        value={formTema}
                                        onChange={(e) => setFormTema(e.target.value)}
                                        placeholder="Ej. Álgebra, Redes"
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                                        Dificultad *
                                    </label>
                                    <select
                                        value={formDificultad}
                                        onChange={(e) => setFormDificultad(e.target.value)}
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff', boxSizing: 'border-box' }}
                                    >
                                        <option value="FACIL">🟢 Fácil</option>
                                        <option value="MEDIA">🟡 Media</option>
                                        <option value="DIFICIL">🔴 Difícil</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                                        Puntaje defecto (pts) *
                                    </label>
                                    <input
                                        type="number"
                                        min="0.5"
                                        max="20"
                                        step="0.5"
                                        value={formPuntos}
                                        onChange={(e) => setFormPuntos(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600', color: '#047857', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>

                            {/* TIPO DE PREGUNTA */}
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                                    Tipo de Pregunta
                                </label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {[
                                        { key: 'OPCION_MULTIPLE', label: 'Opción múltiple' },
                                        { key: 'VERDADERO_FALSO', label: 'Verdadero / Falso' },
                                        { key: 'RESPUESTA_CORTA', label: 'Respuesta escrita' }
                                    ].map(t => (
                                        <button
                                            type="button"
                                            key={t.key}
                                            onClick={() => handleTipoChange(t.key)}
                                            style={{
                                                padding: '7px 14px',
                                                borderRadius: '8px',
                                                border: `1px solid ${formTipo === t.key ? '#3b82f6' : '#cbd5e1'}`,
                                                background: formTipo === t.key ? '#eff6ff' : '#ffffff',
                                                color: formTipo === t.key ? '#1d4ed8' : '#475569',
                                                fontWeight: formTipo === t.key ? '600' : '500',
                                                fontSize: '13px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ENUNCIADO */}
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                                    Enunciado de la Pregunta *
                                </label>
                                <textarea
                                    value={formEnunciado}
                                    onChange={(e) => setFormEnunciado(e.target.value)}
                                    placeholder="Escribe claramente la pregunta o problema a plantear..."
                                    rows={3}
                                    required
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                                />
                            </div>

                            {/* IMAGEN OPCIONAL */}
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                                    Imagen de apoyo (Opcional)
                                </label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        value={formImagenUrl}
                                        onChange={(e) => setFormImagenUrl(e.target.value)}
                                        placeholder="URL de la imagen (https://...)"
                                        style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                                    />
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '12px', fontWeight: '600', color: '#334155', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                        <Upload size={14} /> Subir archivo
                                        <input type="file" accept="image/*" onChange={handleSubirImagen} style={{ display: 'none' }} />
                                    </label>
                                    {formImagenUrl && (
                                        <button
                                            type="button"
                                            onClick={() => setFormImagenUrl('')}
                                            style={{ background: '#fee2e2', border: 'none', color: '#dc2626', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                                            title="Quitar imagen"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                                {formImagenUrl && (
                                    <div style={{ marginTop: '8px', maxWidth: '180px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                        <img src={formImagenUrl} alt="Vista previa" style={{ width: '100%', maxHeight: '100px', objectFit: 'contain' }} />
                                    </div>
                                )}
                            </div>

                            {/* OPCIONES DE RESPUESTA */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', margin: 0 }}>
                                        Opciones de Respuesta
                                    </label>
                                    {formTipo === 'OPCION_MULTIPLE' && formOpciones.length < 6 && (
                                        <button
                                            type="button"
                                            onClick={agregarOpcion}
                                            style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        >
                                            <Plus size={14} /> Agregar otra opción
                                        </button>
                                    )}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {formOpciones.map((op, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input
                                                type="radio"
                                                name="opcion-correcta-banco"
                                                checked={Boolean(op.correcta)}
                                                onChange={() => handleSeleccionarCorrecta(idx)}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#16a34a' }}
                                                title="Marcar como respuesta correcta"
                                            />
                                            <input
                                                type="text"
                                                value={op.texto}
                                                onChange={(e) => handleOpcionChange(idx, e.target.value)}
                                                placeholder={formTipo === 'RESPUESTA_CORTA' ? 'Respuesta esperada de referencia...' : `Opción ${idx + 1}...`}
                                                required={formTipo !== 'RESPUESTA_CORTA'}
                                                style={{
                                                    flex: 1,
                                                    padding: '8px 12px',
                                                    borderRadius: '8px',
                                                    border: `1px solid ${op.correcta ? '#86efac' : '#cbd5e1'}`,
                                                    background: op.correcta ? '#f0fdf4' : '#ffffff',
                                                    fontSize: '13px',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                            {formTipo === 'OPCION_MULTIPLE' && formOpciones.length > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => eliminarOpcion(idx)}
                                                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                                                    title="Eliminar opción"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* EXPLICACIÓN PEDAGÓGICA */}
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                                    Retroalimentación Pedagógica / Explicación
                                </label>
                                <textarea
                                    value={formExplicacion}
                                    onChange={(e) => setFormExplicacion(e.target.value)}
                                    placeholder="Explica el por qué de la respuesta correcta para que el estudiante aprenda al revisar sus resultados..."
                                    rows={2}
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                                />
                            </div>

                            {/* FOOTER MODAL */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', marginTop: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => setModalAbierto(false)}
                                    style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardando}
                                    style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#ffffff', fontSize: '13px', fontWeight: '600', cursor: guardando ? 'not-allowed' : 'pointer' }}
                                >
                                    {guardando ? 'Guardando...' : preguntaEditando ? 'Actualizar Pregunta' : 'Guardar en Banco'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

