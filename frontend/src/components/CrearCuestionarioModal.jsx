import React, { useState, useEffect, useRef } from 'react';
import { crearCuestionario, actualizarCuestionario } from '../services/cuestionarioService';
import { descargarPlantillaExcel, procesarArchivoPreguntas } from '../services/excelService';
import { X, UploadCloud, Download, Plus, Trash2, CheckCircle2, Type, CheckSquare, Shuffle, AlertCircle, Image as ImageIcon, Link2 } from 'lucide-react';

export default function CrearCuestionarioModal({ isOpen, onClose, onCuestionarioCreado, cuestionarioAEditar = null }) {
    const [tabActiva, setTabActiva] = useState('manual'); // 'manual' o 'importar'

    // Campos del cuestionario
    const [titulo, setTitulo] = useState('');
    const [materia, setMateria] = useState('Matemáticas');
    const [descripcion, setDescripcion] = useState('');
    const [tiempoLimiteMinutos, setTiempoLimiteMinutos] = useState(0);
    const [ordenAleatorio, setOrdenAleatorio] = useState(false);

    // Estados para la importación de archivos Excel / CSV
    const [arrastrando, setArrastrando] = useState(false);
    const [cargandoImportacion, setCargandoImportacion] = useState(false);
    const [errorImportacion, setErrorImportacion] = useState('');
    const [resumenImportacion, setResumenImportacion] = useState(null);
    const [preguntasImportadasPendientes, setPreguntasImportadasPendientes] = useState([]);
    const fileInputRef = useRef(null);

    // Lista de preguntas para la creación/edición manual
    const [preguntas, setPreguntas] = useState([
        {
            enunciado: '',
            tipo: 'Opción múltiple',
            imagenUrl: '',
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
            setTiempoLimiteMinutos(cuestionarioAEditar.tiempoLimiteMinutos || 0);
            setOrdenAleatorio(Boolean(cuestionarioAEditar.ordenAleatorio));

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
                        imagenUrl: p.imagenUrl || p.imagen_url || '',
                        opciones: opcionesModal
                    };
                });
                setPreguntas(preguntasPrecargadas);
            } else {
                setPreguntas([
                    {
                        enunciado: '',
                        tipo: 'Opción múltiple',
                        imagenUrl: '',
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
            setTiempoLimiteMinutos(0);
            setOrdenAleatorio(false);
            setResumenImportacion(null);
            setPreguntasImportadasPendientes([]);
            setErrorImportacion('');
            setPreguntas([
                {
                    enunciado: '',
                    tipo: 'Opción múltiple',
                    imagenUrl: '',
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

    // Manejar selección y lectura de archivo para importar
    const handleProcesarArchivo = async (file) => {
        if (!file) return;
        try {
            setCargandoImportacion(true);
            setErrorImportacion('');
            setResumenImportacion(null);

            const resultado = await procesarArchivoPreguntas(file);
            setPreguntasImportadasPendientes(resultado.preguntas);
            setResumenImportacion({
                ...resultado.resumen,
                nombreArchivo: file.name
            });
        } catch (err) {
            console.error("Error al procesar archivo:", err);
            setErrorImportacion(err.message || "Error al procesar el archivo.");
        } finally {
            setCargandoImportacion(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleProcesarArchivo(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setArrastrando(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleProcesarArchivo(file);
        }
    };

    const aplicarPreguntasImportadas = (reemplazarExistentes) => {
        if (!preguntasImportadasPendientes || preguntasImportadasPendientes.length === 0) return;

        if (reemplazarExistentes) {
            setPreguntas(preguntasImportadasPendientes);
        } else {
            // Añadir al final ignorando la plantilla vacía si solo había una pregunta sin enunciado
            const preguntasValidasActuales = preguntas.filter(p => p.enunciado && p.enunciado.trim() !== '');
            setPreguntas([...preguntasValidasActuales, ...preguntasImportadasPendientes]);
        }

        // Cambiar a la pestaña manual para que el profesor vea y edite las preguntas importadas
        setTabActiva('manual');
    };

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

    // Actualizar imagenUrl de una pregunta (por URL directa o Base64)
    const handleImagenChange = (pIndex, url) => {
        const nuevasPreguntas = [...preguntas];
        nuevasPreguntas[pIndex].imagenUrl = url;
        setPreguntas(nuevasPreguntas);
    };

    // Subir imagen local convirtiéndola a Base64 dataURL
    const handleSubirImagenLocal = (pIndex, file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, JPEG, WEBP, GIF, SVG).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('La imagen no debe superar los 5 MB de tamaño.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            handleImagenChange(pIndex, e.target.result);
        };
        reader.readAsDataURL(file);
    };

    // Añadir nueva pregunta
    const agregarPregunta = () => {
        setPreguntas([...preguntas, {
            enunciado: '',
            tipo: 'Opción múltiple',
            imagenUrl: '',
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
                    imagenUrl: p.imagenUrl && p.imagenUrl.trim() !== '' ? p.imagenUrl.trim() : null,
                    opciones: opcionesFormateadas
                };
            });

            const cuestionarioData = {
                titulo: titulo.trim(),
                descripcion: `[${materia}] ${descripcion.trim()}`,
                codigoAcceso: cuestionarioAEditar?.codigoAcceso,
                tiempoLimiteMinutos: parseInt(tiempoLimiteMinutos, 10) || 0,
                ordenAleatorio: Boolean(ordenAleatorio),
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

                            {/* MATERIA Y TEMPORIZADOR */}
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
                                        ⏱️ LÍMITE DE TIEMPO (TEMPORIZADOR)
                                    </label>
                                    <select
                                        value={tiempoLimiteMinutos}
                                        onChange={(e) => setTiempoLimiteMinutos(Number(e.target.value))}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            outline: 'none',
                                            fontSize: '14px',
                                            backgroundColor: '#fff',
                                            boxSizing: 'border-box',
                                            fontWeight: tiempoLimiteMinutos > 0 ? '600' : 'normal',
                                            color: tiempoLimiteMinutos > 0 ? '#1d4ed8' : '#0f172a'
                                        }}
                                    >
                                        <option value={0}>Sin límite de tiempo</option>
                                        <option value={5}>5 minutos (Evaluación rápida)</option>
                                        <option value={10}>10 minutos</option>
                                        <option value={15}>15 minutos</option>
                                        <option value={20}>20 minutos</option>
                                        <option value={30}>30 minutos</option>
                                        <option value={45}>45 minutos</option>
                                        <option value={60}>60 minutos (1 hora)</option>
                                        <option value={90}>90 minutos (1h 30m)</option>
                                        <option value={120}>120 minutos (2 horas)</option>
                                    </select>
                                </div>
                            </div>

                            {/* PREGUNTAS EN ORDEN ALEATORIO */}
                            <div
                                onClick={() => setOrdenAleatorio(!ordenAleatorio)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px 16px',
                                    backgroundColor: ordenAleatorio ? '#eff6ff' : '#f8fafc',
                                    border: ordenAleatorio ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        backgroundColor: ordenAleatorio ? '#dbeafe' : '#e2e8f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Shuffle size={18} color={ordenAleatorio ? '#1d4ed8' : '#64748b'} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: '700', color: ordenAleatorio ? '#1e40af' : '#1e293b' }}>
                                            Preguntas en orden aleatorio
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                                            Cada alumno recibirá las preguntas en un orden distinto al iniciar el examen
                                        </div>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={ordenAleatorio}
                                    onChange={(e) => setOrdenAleatorio(e.target.checked)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
                                />
                            </div>

                            {/* DESCRIPCIÓN */}
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                    DESCRIPCIÓN O INDICACIONES
                                </label>
                                <input
                                    type="text"
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    placeholder="Breve descripción o indicaciones para el alumno..."
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
                                                marginBottom: '10px',
                                                boxSizing: 'border-box'
                                            }}
                                        />

                                        {/* SECCIÓN DE IMAGEN / DIAGRAMA DE LA PREGUNTA */}
                                        <div style={{
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            padding: '10px 14px',
                                            marginBottom: '14px'
                                        }}>
                                            {pregunta.imagenUrl ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <ImageIcon size={14} /> Imagen o diagrama ilustrativo
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleImagenChange(pIndex, '')}
                                                            style={{
                                                                background: 'transparent',
                                                                border: 'none',
                                                                color: '#ef4444',
                                                                cursor: 'pointer',
                                                                fontSize: '11px',
                                                                fontWeight: '600',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            }}
                                                        >
                                                            <Trash2 size={13} /> Quitar imagen
                                                        </button>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
                                                        <img
                                                            src={pregunta.imagenUrl}
                                                            alt="Vista previa"
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                            style={{
                                                                maxHeight: '90px',
                                                                maxWidth: '150px',
                                                                objectFit: 'contain',
                                                                borderRadius: '4px',
                                                                backgroundColor: '#fff',
                                                                border: '1px solid #e2e8f0'
                                                            }}
                                                        />
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <input
                                                                type="text"
                                                                value={pregunta.imagenUrl.startsWith('data:') ? 'Imagen local cargada desde tu equipo' : pregunta.imagenUrl}
                                                                onChange={(e) => handleImagenChange(pIndex, e.target.value)}
                                                                readOnly={pregunta.imagenUrl.startsWith('data:')}
                                                                placeholder="URL de la imagen..."
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '6px 10px',
                                                                    fontSize: '12px',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid #cbd5e1',
                                                                    outline: 'none',
                                                                    color: '#475569',
                                                                    boxSizing: 'border-box'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                                                        <ImageIcon size={15} color="#94a3b8" />
                                                        <span>¿Adjuntar imagen, gráfico o diagrama a este enunciado?</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <label style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '5px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            color: '#2563eb',
                                                            backgroundColor: '#eff6ff',
                                                            padding: '5px 10px',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            border: '1px solid #bfdbfe'
                                                        }}>
                                                            📁 Subir imagen
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                style={{ display: 'none' }}
                                                                onChange={(e) => {
                                                                    const f = e.target.files?.[0];
                                                                    if (f) handleSubirImagenLocal(pIndex, f);
                                                                }}
                                                            />
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const url = prompt('Pega el enlace / URL web de la imagen (ej: https://...):');
                                                                if (url && url.trim()) {
                                                                    handleImagenChange(pIndex, url.trim());
                                                                }
                                                            }}
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '5px',
                                                                fontSize: '12px',
                                                                fontWeight: '600',
                                                                color: '#475569',
                                                                backgroundColor: '#f1f5f9',
                                                                padding: '5px 10px',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                border: '1px solid #cbd5e1'
                                                            }}
                                                        >
                                                            <Link2 size={13} /> Enlace URL
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

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
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />

                            {/* ZONA DE ARRASTRE Y SELECCIÓN */}
                            <div
                                onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
                                onDragLeave={() => setArrastrando(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                style={{
                                    border: arrastrando ? '2px dashed #2563eb' : '2px dashed #cbd5e1',
                                    borderRadius: '14px',
                                    padding: '36px 20px',
                                    textAlign: 'center',
                                    backgroundColor: arrastrando ? '#eff6ff' : '#f8fafc',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: arrastrando ? '0 4px 12px rgba(37, 99, 235, 0.1)' : 'none'
                                }}
                            >
                                <UploadCloud size={44} color={arrastrando ? '#2563eb' : '#3b82f6'} style={{ marginBottom: '12px' }} />
                                <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                                    {cargandoImportacion ? 'Leyendo y validando archivo...' : 'Arrastra tu archivo aquí o haz clic para seleccionarlo'}
                                </div>
                                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
                                    Formatos compatibles: Libros de Excel (.xlsx, .xls) o archivos CSV (.csv)
                                </div>
                                <span style={{
                                    fontSize: '12px',
                                    color: '#1d4ed8',
                                    backgroundColor: '#dbeafe',
                                    padding: '6px 14px',
                                    borderRadius: '20px',
                                    fontWeight: '600',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    📁 Seleccionar desde mi dispositivo
                                </span>
                            </div>

                            {/* ALERTA DE ERROR EN IMPORTACIÓN */}
                            {errorImportacion && (
                                <div style={{
                                    backgroundColor: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    color: '#991b1b',
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <AlertCircle size={20} color="#dc2626" />
                                    <span>{errorImportacion}</span>
                                </div>
                            )}

                            {/* RESULTADO Y CONFIRMACIÓN DE IMPORTACIÓN */}
                            {resumenImportacion && (
                                <div style={{
                                    backgroundColor: '#f0fdf4',
                                    border: '1px solid #bbf7d0',
                                    borderRadius: '12px',
                                    padding: '18px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: '700', fontSize: '14px' }}>
                                        <CheckCircle2 size={20} color="#16a34a" />
                                        <span>¡Se procesaron {resumenImportacion.total} preguntas de "{resumenImportacion.nombreArchivo}"!</span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '12px' }}>
                                        <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>
                                            🔘 {resumenImportacion.multiples} Opción múltiple
                                        </span>
                                        <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>
                                            ⚖️ {resumenImportacion.verdaderoFalso} Verdadero/Falso
                                        </span>
                                        <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>
                                            ✍️ {resumenImportacion.escritas} Respuesta escrita
                                        </span>
                                        {resumenImportacion.conImagenes > 0 && (
                                            <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>
                                                🖼️ {resumenImportacion.conImagenes} con imagen
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                                        <button
                                            type="button"
                                            onClick={() => aplicarPreguntasImportadas(true)}
                                            style={{
                                                backgroundColor: '#16a34a',
                                                color: '#ffffff',
                                                border: 'none',
                                                padding: '10px 16px',
                                                borderRadius: '8px',
                                                fontWeight: '600',
                                                fontSize: '13px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <CheckSquare size={16} /> Reemplazar preguntas ({resumenImportacion.total})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => aplicarPreguntasImportadas(false)}
                                            style={{
                                                backgroundColor: '#ffffff',
                                                color: '#16a34a',
                                                border: '1px solid #16a34a',
                                                padding: '10px 16px',
                                                borderRadius: '8px',
                                                fontWeight: '600',
                                                fontSize: '13px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <Plus size={16} /> Añadir a las existentes (+{resumenImportacion.total})
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* BOTÓN DESCARGAR PLANTILLA EXCEL */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <button
                                    type="button"
                                    onClick={descargarPlantillaExcel}
                                    style={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #cbd5e1',
                                        padding: '10px 16px',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#334155',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <Download size={16} color="#059669" /> Descargar plantilla de ejemplo (.xlsx)
                                </button>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>
                                    Incluye ejemplos y hoja de instrucciones
                                </span>
                            </div>

                            {/* GUÍA DE COLUMNAS */}
                            <div style={{ backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '10px', fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                                <strong style={{ color: '#0f172a' }}>Columnas de la plantilla Excel:</strong>
                                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <li><strong>Columna A (Tipo):</strong> <code>multiple</code>, <code>truefalse</code>, o <code>short</code>.</li>
                                    <li><strong>Columna B (Pregunta):</strong> Texto del enunciado.</li>
                                    <li><strong>Columnas C a F:</strong> Alternativas (A, B, C, D) para opción múltiple.</li>
                                    <li><strong>Columna G (Respuesta correcta):</strong> Letra (A, B, C, D), texto de la opción o "Verdadero"/"Falso".</li>
                                    <li><strong>Columna H (URL Imagen - Opcional):</strong> Enlace web directo (https://...) a foto, gráfico o diagrama ilustrativo.</li>
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