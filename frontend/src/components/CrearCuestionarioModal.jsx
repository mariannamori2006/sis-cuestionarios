import React, { useState, useEffect } from 'react';
import { crearCuestionario, actualizarCuestionario } from '../services/cuestionarioService';
import { X, UploadCloud, Download, Plus, Trash2, CheckCircle2, Type, CheckSquare } from 'lucide-react';

export default function CrearCuestionarioModal({ isOpen, onClose, onCuestionarioCreado, cuestionarioAEditar = null }) {
    const [tabActiva, setTabActiva] = useState('manual'); // 'manual' o 'importar'

    // Campos del cuestionario
    const [titulo, setTitulo] = useState('');
    const [materia, setMateria] = useState('Matemáticas');
    const [descripcion, setDescripcion] = useState('');

    // Lista de preguntas para la creación/edición manual
    const [preguntas, setPreguntas] = useState([
        {
            enunciado: '',
            tipo: 'Opción múltiple',
            opciones: [
                { texto: '', correcta: true },
                { texto: '', correcta: false },
                { texto: '', correcta: false },
                { texto: '', correcta: false }
            ]
        }
    ]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const esModoEdicion = Boolean(cuestionarioAEditar && cuestionarioAEditar.id);

    // Precargar información cuando se abre para editar o resetear cuando se abre para crear
    useEffect(() => {
        if (!isOpen) return;

        if (cuestionarioAEditar) {
            setTitulo(cuestionarioAEditar.titulo || '');

            // Extraer materia si viene formateada como "[Materia] Descripción"
            const descOriginal = cuestionarioAEditar.descripcion || '';
            const matchMateria = descOriginal.match(/^\[(.*?)\]\s*(.*)$/);
            if (matchMateria) {
                setMateria(matchMateria[1]);
                setDescripcion(matchMateria[2]);
            } else {
                setMateria('Matemáticas');
                setDescripcion(descOriginal);
            }

            // Precargar preguntas con sus tipos y opciones
            if (cuestionarioAEditar.preguntas && cuestionarioAEditar.preguntas.length > 0) {
                const preguntasPrecargadas = cuestionarioAEditar.preguntas.map((p) => {
                    const tipoRaw = p.tipo || 'OPCION_MULTIPLE';
                    let tipoModal = 'Opción múltiple';
                    if (tipoRaw === 'VERDADERO_FALSO' || tipoRaw === 'Verdadero/Falso') {
                        tipoModal = 'Verdadero/Falso';
                    } else if (tipoRaw === 'RESPUESTA_CORTA' || tipoRaw === 'Respuesta escrita') {
                        tipoModal = 'Respuesta escrita';
                    }

                    let opcionesModal = [];
                    if (tipoModal === 'Verdadero/Falso') {
                        const opc = p.opciones || [];
                        const opcVerdadero = opc.find(o => (o.texto || o.textoOpcion || '').toLowerCase().includes('verdadero'));
                        const opcFalso = opc.find(o => (o.texto || o.textoOpcion || '').toLowerCase().includes('falso'));
                        opcionesModal = [
                            { texto: 'Verdadero', correcta: opcVerdadero ? Boolean(opcVerdadero.correcta ?? opcVerdadero.esCorrecta) : true },
                            { texto: 'Falso', correcta: opcFalso ? Boolean(opcFalso.correcta ?? opcFalso.esCorrecta) : false }
                        ];
                    } else if (tipoModal === 'Respuesta escrita') {
                        const opc = p.opciones || [];
                        opcionesModal = [
                            { texto: opc[0]?.texto || opc[0]?.textoOpcion || '', correcta: true }
                        ];
                    } else {
                        opcionesModal = (p.opciones && p.opciones.length > 0)
                            ? p.opciones.map(o => ({
                                texto: o.texto || o.textoOpcion || '',
                                correcta: Boolean(o.correcta ?? o.esCorrecta)
                            }))
                            : [
                                { texto: '', correcta: true },
                                { texto: '', correcta: false },
                                { texto: '', correcta: false },
                                { texto: '', correcta: false }
                            ];
                    }

                    return {
                        enunciado: p.enunciado || p.textoPregunta || '',
                        tipo: tipoModal,
                        opciones: opcionesModal
                    };
                });
                setPreguntas(preguntasPrecargadas);
            } else {
                setPreguntas([
                    {
                        enunciado: '',
                        tipo: 'Opción múltiple',
                        opciones: [
                            { texto: '', correcta: true },
                            { texto: '', correcta: false },
                            { texto: '', correcta: false },
                            { texto: '', correcta: false }
                        ]
                    }
                ]);
            }
        } else {
            // Valores limpios por defecto para nuevo cuestionario
            setTitulo('');
            setMateria('Matemáticas');
            setDescripcion('');
            setPreguntas([
                {
                    enunciado: '',
                    tipo: 'Opción múltiple',
                    opciones: [
                        { texto: '', correcta: true },
                        { texto: '', correcta: false },
                        { texto: '', correcta: false },
                        { texto: '', correcta: false }
                    ]
                }
            ]);
        }
        setError('');
    }, [isOpen, cuestionarioAEditar]);

    if (!isOpen) return null;

    // Manejar cambio de tipo de pregunta y adaptar automáticamente las opciones
    const handleTipoPreguntaChange = (pIndex, nuevoTipo) => {
        const nuevasPreguntas = [...preguntas];
        nuevasPreguntas[pIndex].tipo = nuevoTipo;

        if (nuevoTipo === 'Verdadero/Falso') {
            nuevasPreguntas[pIndex].opciones = [
                { texto: 'Verdadero', correcta: true },
                { texto: 'Falso', correcta: false }
            ];
        } else if (nuevoTipo === 'Respuesta escrita') {
            nuevasPreguntas[pIndex].opciones = [
                { texto: '', correcta: true }
            ];
        } else {
            // Opción múltiple por defecto (4 opciones)
            nuevasPreguntas[pIndex].opciones = [
                { texto: '', correcta: true },
                { texto: '', correcta: false },
                { texto: '', correcta: false },
                { texto: '', correcta: false }
            ];
        }

        setPreguntas(nuevasPreguntas);
    };

    // Manejar cambios en el enunciado de las preguntas
    const handlePreguntaChange = (index, value) => {
        const nuevasPreguntas = [...preguntas];
        nuevasPreguntas[index].enunciado = value;
        setPreguntas(nuevasPreguntas);
    };

    // Manejar cambios en las opciones de una pregunta
    const handleOpcionChange = (pIndex, oIndex, texto) => {
        const nuevasPreguntas = [...preguntas];
        nuevasPreguntas[pIndex].opciones[oIndex].texto = texto;
        setPreguntas(nuevasPreguntas);
    };

    // Marcar opción correcta
    const handleSeleccionarCorrecta = (pIndex, oIndex) => {
        const nuevasPreguntas = [...preguntas];
        nuevasPreguntas[pIndex].opciones.forEach((op, idx) => {
            op.correcta = (idx === oIndex);
        });
        setPreguntas(nuevasPreguntas);
    };

    // Añadir nueva pregunta
    const agregarPregunta = () => {
        setPreguntas([...preguntas, {
            enunciado: '',
            tipo: 'Opción múltiple',
            opciones: [
                { texto: '', correcta: true },
                { texto: '', correcta: false },
                { texto: '', correcta: false },
                { texto: '', correcta: false }
            ]
        }]);
    };

    // Eliminar una pregunta
    const eliminarPregunta = (indexAEliminar) => {
        if (preguntas.length <= 1) return;
        setPreguntas(preguntas.filter((_, idx) => idx !== indexAEliminar));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!titulo.trim()) {
            setError('El título del cuestionario es obligatorio.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const preguntasFormateadas = preguntas.map((p, index) => {
                let tipoEnum = 'OPCION_MULTIPLE';
                let opcionesFormateadas = [];

                if (p.tipo === 'Verdadero/Falso') {
                    tipoEnum = 'VERDADERO_FALSO';
                    opcionesFormateadas = [
                        { texto: 'Verdadero', correcta: Boolean(p.opciones[0]?.correcta) },
                        { texto: 'Falso', correcta: Boolean(p.opciones[1]?.correcta) }
                    ];
                } else if (p.tipo === 'Respuesta escrita') {
                    tipoEnum = 'RESPUESTA_CORTA';
                    const respuestaEsperada = p.opciones?.[0]?.texto || '';
                    opcionesFormateadas = [
                        { texto: respuestaEsperada.trim(), correcta: true }
                    ];
                } else {
                    tipoEnum = 'OPCION_MULTIPLE';
                    opcionesFormateadas = (p.opciones || []).map(o => ({
                        texto: o.texto,
                        correcta: Boolean(o.correcta)
                    }));
                }

                return {
                    enunciado: p.enunciado,
                    tipo: tipoEnum,
                    orden: index + 1,
                    opciones: opcionesFormateadas
                };
            });

            const cuestionarioData = {
                titulo: titulo.trim(),
                descripcion: `[${materia}] ${descripcion.trim()}`,
                codigoAcceso: cuestionarioAEditar?.codigoAcceso,
                preguntas: preguntasFormateadas
            };

            let resultadoCuestionario;
            if (esModoEdicion) {
                resultadoCuestionario = await actualizarCuestionario(cuestionarioAEditar.id, cuestionarioData);
            } else {
                resultadoCuestionario = await crearCuestionario(cuestionarioData);
            }

            // Notificar y cerrar
            if (onCuestionarioCreado) {
                onCuestionarioCreado(resultadoCuestionario);
            }
            onClose();
        } catch (err) {
            console.error('Error al guardar el cuestionario:', err);
            const msg = err.response?.data?.message || err.message || 'Hubo un error al guardar el cuestionario en la base de datos.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const esFormularioValido = titulo.trim().length > 0;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '680px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column'
            }}>

                {/* ENCABEZADO DEL MODAL */}
                <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>
                            {esModoEdicion ? 'Editar cuestionario' : 'Nuevo cuestionario'}
                        </h2>
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                            {esModoEdicion
                                ? 'Modifica y actualiza las preguntas y configuración de tu examen'
                                : 'Crea y configura tu examen con preguntas personalizadas'}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* PESTAÑAS (Creación manual / Importar archivo) */}
                <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 24px', backgroundColor: '#f8fafc' }}>
                    <button
                        type="button"
                        onClick={() => setTabActiva('manual')}
                        style={{
                            padding: '14px 20px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: tabActiva === 'manual' ? '2px solid #0f172a' : '2px solid transparent',
                            fontWeight: '600',
                            fontSize: '14px',
                            color: tabActiva === 'manual' ? '#0f172a' : '#64748b',
                            cursor: 'pointer'
                        }}
                    >
                        Creación manual
                    </button>
                    <button
                        type="button"
                        onClick={() => setTabActiva('importar')}
                        style={{
                            padding: '14px 20px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: tabActiva === 'importar' ? '2px solid #0f172a' : '2px solid transparent',
                            fontWeight: '600',
                            fontSize: '14px',
                            color: tabActiva === 'importar' ? '#0f172a' : '#64748b',
                            cursor: 'pointer'
                        }}
                    >
                        Importar archivo
                    </button>
                </div>

                {error && (
                    <div style={{ margin: '20px 24px 0 24px', backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '8px', fontSize: '13px' }}>
                        {error}
                    </div>
                )}

                {/* CONTENIDO DEL MODAL */}
                <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {tabActiva === 'manual' ? (
                        <>
                            {/* TÍTULO */}
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                    TÍTULO DEL CUESTIONARIO *
                                </label>
                                <input
                                    type="text"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    placeholder="Ej: Álgebra Lineal — Unidad 3"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        outline: 'none',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* MATERIA Y DESCRIPCIÓN */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                        MATERIA
                                    </label>
                                    <select
                                        value={materia}
                                        onChange={(e) => setMateria(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            outline: 'none',
                                            fontSize: '14px',
                                            backgroundColor: '#fff',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <option value="Matemáticas">Matemáticas</option>
                                        <option value="Historia">Historia</option>
                                        <option value="Biología">Biología</option>
                                        <option value="Informática">Informática</option>
                                        <option value="Física">Física</option>
                                        <option value="Química">Química</option>
                                        <option value="Comunicación">Comunicación</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                        DESCRIPCIÓN
                                    </label>
                                    <input
                                        type="text"
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        placeholder="Breve descripción o indicaciones..."
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            outline: 'none',
                                            fontSize: '14px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* PREGUNTAS */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>
                                        Preguntas del examen ({preguntas.length})
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                                        Formatos: Opción Múltiple, V/F o Respuesta Escrita
                                    </span>
                                </div>

                                {preguntas.map((pregunta, pIndex) => (
                                    <div key={pIndex} style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        backgroundColor: '#f8fafc',
                                        marginBottom: '16px',
                                        position: 'relative'
                                    }}>
                                        {/* Barra superior de la pregunta */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <div style={{ backgroundColor: '#0f172a', color: '#fff', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                                    {pIndex + 1}
                                                </div>
                                                <select
                                                    value={pregunta.tipo}
                                                    onChange={(e) => handleTipoPreguntaChange(pIndex, e.target.value)}
                                                    style={{
                                                        padding: '7px 12px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #cbd5e1',
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                        backgroundColor: '#fff',
                                                        color: '#0f172a',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value="Opción múltiple">Opción múltiple</option>
                                                    <option value="Verdadero/Falso">Verdadero / Falso</option>
                                                    <option value="Respuesta escrita">Respuesta escrita</option>
                                                </select>
                                            </div>

                                            {preguntas.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => eliminarPregunta(pIndex)}
                                                    title="Eliminar pregunta"
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#ef4444',
                                                        cursor: 'pointer',
                                                        padding: '4px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        borderRadius: '6px'
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>

                                        {/* ENUNCIADO DE LA PREGUNTA */}
                                        <input
                                            type="text"
                                            value={pregunta.enunciado}
                                            onChange={(e) => handlePreguntaChange(pIndex, e.target.value)}
                                            placeholder={`Escribe el enunciado de la pregunta ${pIndex + 1}...`}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '11px 14px',
                                                borderRadius: '8px',
                                                border: '1px solid #cbd5e1',
                                                fontSize: '14px',
                                                backgroundColor: '#fff',
                                                marginBottom: '14px',
                                                boxSizing: 'border-box'
                                            }}
                                        />

                                        {/* TIPO 1: OPCIÓN MÚLTIPLE */}
                                        {pregunta.tipo === 'Opción múltiple' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    Marca el radio verde en la respuesta correcta:
                                                </span>
                                                {pregunta.opciones.map((opcion, oIndex) => {
                                                    const letra = String.fromCharCode(65 + oIndex); // A, B, C, D
                                                    return (
                                                        <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <input
                                                                type="radio"
                                                                name={`correcta_${pIndex}`}
                                                                checked={opcion.correcta}
                                                                onChange={() => handleSeleccionarCorrecta(pIndex, oIndex)}
                                                                title="Marcar como respuesta correcta"
                                                                style={{ cursor: 'pointer', accentColor: '#059669', width: '18px', height: '18px' }}
                                                            />
                                                            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b', width: '15px' }}>{letra}</span>
                                                            <input
                                                                type="text"
                                                                value={opcion.texto}
                                                                onChange={(e) => handleOpcionChange(pIndex, oIndex, e.target.value)}
                                                                placeholder={`Opción ${letra}...`}
                                                                required
                                                                style={{
                                                                    flex: 1,
                                                                    padding: '8px 12px',
                                                                    borderRadius: '6px',
                                                                    border: opcion.correcta ? '1px solid #10b981' : '1px solid #cbd5e1',
                                                                    backgroundColor: opcion.correcta ? '#f0fdf4' : '#fff',
                                                                    fontSize: '13px',
                                                                    boxSizing: 'border-box'
                                                                }}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* TIPO 2: VERDADERO / FALSO */}
                                        {pregunta.tipo === 'Verdadero/Falso' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    Selecciona cuál es la respuesta correcta:
                                                </span>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                    <div
                                                        onClick={() => handleSeleccionarCorrecta(pIndex, 0)}
                                                        style={{
                                                            border: pregunta.opciones[0]?.correcta ? '2px solid #10b981' : '1px solid #cbd5e1',
                                                            backgroundColor: pregunta.opciones[0]?.correcta ? '#f0fdf4' : '#ffffff',
                                                            borderRadius: '10px',
                                                            padding: '12px 16px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <input
                                                                type="radio"
                                                                name={`vf_${pIndex}`}
                                                                checked={Boolean(pregunta.opciones[0]?.correcta)}
                                                                onChange={() => handleSeleccionarCorrecta(pIndex, 0)}
                                                                style={{ cursor: 'pointer', accentColor: '#10b981', width: '18px', height: '18px' }}
                                                            />
                                                            <span style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>Verdadero</span>
                                                        </div>
                                                        {pregunta.opciones[0]?.correcta && (
                                                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#15803d', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>
                                                                Correcta
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div
                                                        onClick={() => handleSeleccionarCorrecta(pIndex, 1)}
                                                        style={{
                                                            border: pregunta.opciones[1]?.correcta ? '2px solid #10b981' : '1px solid #cbd5e1',
                                                            backgroundColor: pregunta.opciones[1]?.correcta ? '#f0fdf4' : '#ffffff',
                                                            borderRadius: '10px',
                                                            padding: '12px 16px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <input
                                                                type="radio"
                                                                name={`vf_${pIndex}`}
                                                                checked={Boolean(pregunta.opciones[1]?.correcta)}
                                                                onChange={() => handleSeleccionarCorrecta(pIndex, 1)}
                                                                style={{ cursor: 'pointer', accentColor: '#10b981', width: '18px', height: '18px' }}
                                                            />
                                                            <span style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>Falso</span>
                                                        </div>
                                                        {pregunta.opciones[1]?.correcta && (
                                                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#15803d', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>
                                                                Correcta
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* TIPO 3: RESPUESTA ESCRITA */}
                                        {pregunta.tipo === 'Respuesta escrita' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Type size={15} color="#3b82f6" />
                                                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                                                        PAUTA O CRITERIOS DE CALIFICACIÓN (OPCIONAL)
                                                    </label>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={pregunta.opciones[0]?.texto || ''}
                                                    onChange={(e) => handleOpcionChange(pIndex, 0, e.target.value)}
                                                    placeholder="Ej: Criterios clave: justificación clara, conceptos principales..."
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 14px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #cbd5e1',
                                                        backgroundColor: '#ffffff',
                                                        fontSize: '13px',
                                                        boxSizing: 'border-box'
                                                    }}
                                                />
                                                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #dbeafe', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', color: '#1e40af', lineHeight: '1.4' }}>
                                                    ℹ️ <strong>Revisión manual por el profesor:</strong> El alumno escribirá su respuesta en un campo de texto libre. La calificación no se asigna de forma automática, sino que podrás leer la respuesta del alumno y asignarle su nota correspondiente.
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Botón Añadir Pregunta */}
                                <button
                                    type="button"
                                    onClick={agregarPregunta}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        border: '2px dashed #cbd5e1',
                                        borderRadius: '12px',
                                        backgroundColor: '#ffffff',
                                        color: '#475569',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        textAlign: 'center',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <Plus size={18} /> Añadir otra pregunta
                                </button>
                            </div>
                        </>
                    ) : (
                        /* PESTAÑA IMPORTAR ARCHIVO */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
                            <div style={{
                                border: '2px dashed #cbd5e1',
                                borderRadius: '12px',
                                padding: '40px 20px',
                                textAlign: 'center',
                                backgroundColor: '#f8fafc',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}>
                                <UploadCloud size={40} color="#3b82f6" style={{ marginBottom: '12px' }} />
                                <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>Arrastra tu archivo aquí</div>
                                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>o haz clic para seleccionar</div>
                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Excel (.xlsx, .xls) o CSV</div>
                            </div>

                            <button
                                type="button"
                                onClick={() => alert('Descargando plantilla de ejemplo...')}
                                style={{
                                    alignSelf: 'flex-start',
                                    backgroundColor: '#f1f5f9',
                                    border: '1px solid #cbd5e1',
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#334155',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Download size={15} /> Descargar plantilla de ejemplo
                            </button>

                            <div style={{ backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '10px', fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                                <strong>Formato esperado:</strong>
                                <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px' }}>
                                    <li>Columna A: Tipo (multiple / truefalse / short)</li>
                                    <li>Columna B: Texto de la pregunta</li>
                                    <li>Columnas C-F: Opciones (para opción múltiple)</li>
                                    <li>Columna G: Respuesta correcta</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* BOTONES INFERIORES */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '10px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                backgroundColor: '#f1f5f9',
                                color: '#334155',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '13px'
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !esFormularioValido}
                            style={{
                                backgroundColor: esFormularioValido ? '#0f172a' : '#94a3b8',
                                color: '#ffffff',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: esFormularioValido ? 'pointer' : 'default',
                                fontSize: '13px',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Guardando...' : 'Guardar cuestionario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}