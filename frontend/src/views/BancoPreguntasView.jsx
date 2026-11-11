import React, { useState, useEffect } from 'react';
import useResponsive from '../hooks/useResponsive';
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
    Upload,
    AlertTriangle
} from 'lucide-react';
import AlertaModal from '../components/modals/AlertaModal';

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
    const { isMobile } = useResponsive();
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

    // Estado para Alerta Modal estilizada
    const [alerta, setAlerta] = useState({
        isOpen: false,
        tipo: 'warning',
        titulo: '',
        mensaje: '',
        sugerencia: '',
        textoBoton: 'Entendido'
    });

    const mostrarAlerta = (titulo, mensaje, tipo = 'warning', sugerencia = '', textoBoton = 'Entendido') => {
        setAlerta({
            isOpen: true,
            tipo,
            titulo,
            mensaje,
            sugerencia,
            textoBoton
        });
    };

    const cerrarAlerta = () => {
        setAlerta(prev => ({ ...prev, isOpen: false }));
    };

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
            // Deduplicar por materia y enunciado para garantizar que nunca se repitan en pantalla
            const mapaUnicos = new Map();
            (lista || []).forEach(item => {
                const clave = `${(item.materia || '').trim().toLowerCase()}:::${(item.enunciado || item.textoPregunta || '').trim().toLowerCase()}`;
                if (!mapaUnicos.has(clave)) {
                    mapaUnicos.set(clave, item);
                }
            });
            setPreguntas(Array.from(mapaUnicos.values()));
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
            setErrorModal('La imagen no debe superar los 5 MB de tamaño.');
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

        // Validar que no se duplique localmente en el banco
        const enunciadoNorm = formEnunciado.trim().toLowerCase();
        const materiaNorm = (formMateria.trim() || 'General').toLowerCase();
        const yaExiste = preguntas.some(p => {
            if (preguntaEditando && (p.id === preguntaEditando.id)) return false;
            const pTexto = (p.enunciado || p.textoPregunta || '').trim().toLowerCase();
            const pMat = (p.materia || 'General').trim().toLowerCase();
            return pTexto === enunciadoNorm && pMat === materiaNorm;
        });

        if (yaExiste) {
            setErrorModal(`Ya existe una pregunta idéntica en el banco registrada para la materia "${formMateria.trim() || 'General'}".`);
            return;
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
            mostrarAlerta(
                'No se pudo eliminar',
                'Ocurrió un error al intentar eliminar la pregunta del banco. Por favor intenta de nuevo.',
                'error'
            );
        }
    };

    // Estadísticas rápidas del banco
    const totalFaciles = preguntas.filter(p => p.dificultad === 'FACIL').length;
    const totalMedias = preguntas.filter(p => p.dificultad === 'MEDIA').length;
    const totalDificiles = preguntas.filter(p => p.dificultad === 'DIFICIL').length;

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '18px 14px' : '32px 40px', backgroundColor: '#f8fafc' }}>
            {/* ENCABEZADO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '10px', borderRadius: '14px', boxShadow: '0 2px 6px rgba(37,99,235,0.15)' }}>
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                                Banco Centralizado de Preguntas
                            </h1>
                            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0', fontWeight: '500' }}>
                                Repositorio para catalogar, almacenar y reutilizar preguntas por materia y nivel de dificultad.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={abrirCrearModal}
                    className="interactive-card"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                        color: '#ffffff',
                        padding: '11px 20px',
                        borderRadius: '12px',
                        border: 'none',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                    }}
                >
                    <Plus size={18} /> Nueva Pregunta en el Banco
                </button>
            </div>

            {/* TARJETAS RESUMEN */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '18px', marginBottom: '26px' }}>
                <div className="interactive-card" style={{ background: '#ffffff', borderRadius: '18px', padding: '20px 22px', border: '1px solid #e2e8f0', borderTop: '4px solid #2563eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ background: '#eff6ff', color: '#2563eb', padding: '10px', borderRadius: '12px' }}>
                        <Layers size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total en Banco</div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>{preguntas.length}</div>
                    </div>
                </div>

                <div className="interactive-card" style={{ background: '#ffffff', borderRadius: '18px', padding: '20px 22px', border: '1px solid #e2e8f0', borderTop: '4px solid #10b981', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ background: '#ecfdf5', color: '#059669', padding: '10px', borderRadius: '12px' }}>
                        <CheckCircle2 size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nivel Fácil</div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: '#059669', letterSpacing: '-0.5px' }}>{totalFaciles}</div>
                    </div>
                </div>

                <div className="interactive-card" style={{ background: '#ffffff', borderRadius: '18px', padding: '20px 22px', border: '1px solid #e2e8f0', borderTop: '4px solid #f59e0b', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ background: '#fffbeb', color: '#d97706', padding: '10px', borderRadius: '12px' }}>
                        <Sparkles size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nivel Medio</div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: '#d97706', letterSpacing: '-0.5px' }}>{totalMedias}</div>
                    </div>
                </div>

                <div className="interactive-card" style={{ background: '#ffffff', borderRadius: '18px', padding: '20px 22px', border: '1px solid #e2e8f0', borderTop: '4px solid #f43f5e', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ background: '#fff1f2', color: '#e11d48', padding: '10px', borderRadius: '12px' }}>
                        <Award size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nivel Difícil</div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: '#e11d48', letterSpacing: '-0.5px' }}>{totalDificiles}</div>
                    </div>
                </div>
            </div>

            {/* FILTROS Y BÚSQUEDA */}
            <div style={{ background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '18px 22px', marginBottom: '26px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <form onSubmit={handleBuscar} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Búsqueda por texto */}
                    <div style={{ flex: '1 1 240px', position: 'relative' }}>
                        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Buscar por pregunta, tema o contenido..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '11px 16px 11px 40px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                fontSize: '13px',
                                outline: 'none',
                                color: '#0f172a',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                boxSizing: 'border-box'
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
                                padding: '11px 14px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                fontSize: '13px',
                                backgroundColor: '#ffffff',
                                color: '#0f172a',
                                outline: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                            }}
                        >
                            <option value="">Todas las materias</option>
                            {Array.from(new Set([...materias, ...MATERIAS_SUGERIDAS])).map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tabs de Dificultad */}
                    <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
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
                                        fontWeight: activa ? '700' : '500',
                                        fontSize: '12px',
                                        padding: '7px 12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        boxShadow: activa ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    {d.label}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="submit"
                        className="interactive-card"
                        style={{
                            padding: '11px 18px',
                            background: '#0f172a',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: '700',
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
                                className="interactive-card"
                                style={{
                                    background: '#ffffff',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    borderLeft: `4px solid ${difInfo.key === 'FACIL' ? '#10b981' : difInfo.key === 'MEDIA' ? '#f59e0b' : '#f43f5e'}`,
                                    padding: '22px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '14px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {/* HEADER DE TARJETA */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        {/* Chip Materia */}
                                        <span className="badge-pill badge-blue">
                                            {p.materia || 'General'}
                                        </span>

                                        {/* Chip Tema si existe */}
                                        {p.tema && (
                                            <span className="badge-pill badge-slate">
                                                {p.tema}
                                            </span>
                                        )}

                                        {/* Chip Dificultad */}
                                        <span className={`badge-pill ${difInfo.key === 'FACIL' ? 'badge-emerald' : difInfo.key === 'MEDIA' ? 'badge-amber' : 'badge-rose'}`}>
                                            ● {difInfo.label}
                                        </span>

                                        {/* Chip Tipo */}
                                        <span style={{ background: '#f8fafc', color: '#475569', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                            {p.tipo === 'VERDADERO_FALSO' ? 'Verdadero / Falso' : p.tipo === 'RESPUESTA_CORTA' ? 'Respuesta escrita' : 'Opción múltiple'}
                                        </span>

                                        {/* Chip Ponderación */}
                                        <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontSize: '11px', fontWeight: '800', padding: '3px 9px', borderRadius: '6px' }}>
                                            {puntosVal.toFixed(1)} pts
                                        </span>
                                    </div>

                                    {/* Acciones */}
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => abrirEditarModal(p)}
                                            style={{
                                                background: '#eff6ff',
                                                border: '1px solid #bfdbfe',
                                                borderRadius: '8px',
                                                padding: '6px 12px',
                                                color: '#1d4ed8',
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                transition: 'all 0.15s ease'
                                            }}
                                            title="Editar pregunta"
                                        >
                                            <Edit3 size={13} /> Editar
                                        </button>
                                        <button
                                            onClick={() => handleEliminar(p.id)}
                                            style={{
                                                background: '#fff1f2',
                                                border: '1px solid #fecdd3',
                                                borderRadius: '8px',
                                                padding: '6px 10px',
                                                color: '#e11d48',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                transition: 'all 0.15s ease'
                                            }}
                                            title="Eliminar del banco"
                                        >
                                            <Trash2 size={13} />
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
                <div 
                    onClick={() => setModalAbierto(false)}
                    style={{
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
                    }}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '16px',
                            width: '100%',
                            maxWidth: '750px',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            overflow: 'hidden'
                        }}
                    >
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
                                <div style={{
                                    background: '#fff1f2',
                                    border: '1px solid #fecdd3',
                                    color: '#be123c',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    boxShadow: '0 2px 6px rgba(225, 29, 72, 0.06)'
                                }}>
                                    <AlertTriangle size={18} color="#e11d48" style={{ flexShrink: 0 }} />
                                    <span>{errorModal}</span>
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

            {/* Modal de Alerta Moderna */}
            <AlertaModal
                isOpen={alerta.isOpen}
                onClose={cerrarAlerta}
                tipo={alerta.tipo}
                titulo={alerta.titulo}
                mensaje={alerta.mensaje}
                sugerencia={alerta.sugerencia}
                textoBoton={alerta.textoBoton}
            />
        </div>
    );
}

