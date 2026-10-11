import * as XLSX from 'xlsx';

/**
 * Genera y descarga una plantilla modelo de Excel (.xlsx) para que el profesor
 * cargue preguntas masivamente con el formato esperado.
 */
export const descargarPlantillaExcel = () => {
    const wb = XLSX.utils.book_new();

    const headers = [
        "Tipo",
        "Pregunta / Enunciado",
        "Opción A",
        "Opción B",
        "Opción C",
        "Opción D",
        "Respuesta Correcta"
    ];

    const ejemplos = [
        [
            "multiple",
            "¿Cuál es la capital del Perú?",
            "Cusco",
            "Lima",
            "Arequipa",
            "Trujillo",
            "B"
        ],
        [
            "truefalse",
            "¿El agua hierve a 100 grados Celsius a nivel del mar?",
            "Verdadero",
            "Falso",
            "",
            "",
            "Verdadero"
        ],
        [
            "multiple",
            "¿Cuánto es 15 x 6?",
            "80",
            "85",
            "90",
            "95",
            "C"
        ],
        [
            "short",
            "¿Cuál es el planeta más grande del sistema solar?",
            "Júpiter",
            "",
            "",
            "",
            "Júpiter"
        ],
        [
            "truefalse",
            "¿La fotosíntesis es realizada por los animales?",
            "Verdadero",
            "Falso",
            "",
            "",
            "Falso"
        ]
    ];

    const data = [headers, ...ejemplos];
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Ajustar anchos de columnas
    ws['!cols'] = [
        { wch: 14 }, // Tipo
        { wch: 45 }, // Pregunta
        { wch: 20 }, // Opción A
        { wch: 20 }, // Opción B
        { wch: 20 }, // Opción C
        { wch: 20 }, // Opción D
        { wch: 22 }  // Respuesta Correcta
    ];

    // Añadir hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, "Preguntas");

    // Hoja secundaria con instrucciones
    const instrucciones = [
        ["INSTRUCCIONES PARA LLENAR LA PLANTILLA DE CUESTIONARIOS"],
        [""],
        ["1. Columna 'Tipo': Escribe uno de estos valores:"],
        ["   - 'multiple': Pregunta de opción múltiple con 4 alternativas (A, B, C, D)."],
        ["   - 'truefalse': Pregunta de Verdadero o Falso."],
        ["   - 'short': Pregunta con respuesta corta / escrita para revisión."],
        [""],
        ["2. Columna 'Pregunta / Enunciado': Texto de la pregunta."],
        [""],
        ["3. Columnas 'Opción A' hasta 'Opción D':"],
        ["   - Para 'multiple': Escribe las 4 opciones."],
        ["   - Para 'truefalse': Puedes dejarlas vacías o escribir Verdadero y Falso."],
        ["   - Para 'short': Escribe la respuesta esperada o criterio clave en Opción A."],
        [""],
        ["4. Columna 'Respuesta Correcta':"],
        ["   - Para 'multiple': Indica la letra (A, B, C, D) o el número (1, 2, 3, 4) o el texto exacto."],
        ["   - Para 'truefalse': Escribe 'Verdadero' o 'Falso' (también 'V' o 'F')."],
        ["   - Para 'short': Escribe la respuesta modelo."]
    ];
    const wsInstrucciones = XLSX.utils.aoa_to_sheet(instrucciones);
    wsInstrucciones['!cols'] = [{ wch: 75 }];
    XLSX.utils.book_append_sheet(wb, wsInstrucciones, "Instrucciones");

    // Descargar archivo
    XLSX.writeFile(wb, "plantilla_preguntas_cuestionario.xlsx");
};

/**
 * Procesa un archivo cargado (.xlsx, .xls o .csv) y extrae las preguntas normalizadas.
 * @param {File} file Archivo seleccionado por el usuario.
 * @returns {Promise<{preguntas: Array, total: number, resumen: Object}>}
 */
export const procesarArchivoPreguntas = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject(new Error("No se ha seleccionado ningún archivo."));
        }

        const extension = file.name.split('.').pop().toLowerCase();
        if (!['xlsx', 'xls', 'csv'].includes(extension)) {
            return reject(new Error("Formato no soportado. Por favor sube un archivo Excel (.xlsx, .xls) o CSV (.csv)."));
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                    return reject(new Error("El archivo no contiene ninguna hoja válida."));
                }

                // Usamos la primera hoja
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

                if (!rawRows || rawRows.length === 0) {
                    return reject(new Error("El archivo está vacío."));
                }

                // Filtrar filas completamente vacías
                const rows = rawRows.filter(r => Array.isArray(r) && r.some(cell => String(cell).trim() !== ''));

                if (rows.length === 0) {
                    return reject(new Error("No se encontraron filas con contenido en el archivo."));
                }

                // Detectar si la primera fila es encabezado
                let startIndex = 0;
                const primeraFila = rows[0].map(c => String(c).toLowerCase().trim());
                if (
                    primeraFila.some(c => c.includes('tipo') || c.includes('pregunta') || c.includes('enunciado') || c.includes('opci'))
                ) {
                    startIndex = 1;
                }

                const preguntasProcesadas = [];

                for (let i = startIndex; i < rows.length; i++) {
                    const row = rows[i];
                    const rawTipo = String(row[0] || '').toLowerCase().trim();
                    const enunciado = String(row[1] || '').trim();

                    // Si no tiene enunciado, saltar
                    if (!enunciado) continue;

                    const opcA = String(row[2] || '').trim();
                    const opcB = String(row[3] || '').trim();
                    const opcC = String(row[4] || '').trim();
                    const opcD = String(row[5] || '').trim();
                    const rawCorrecta = String(row[6] || '').trim();

                    // Determinar tipo de pregunta
                    let tipo = 'Opción múltiple';
                    if (
                        rawTipo.includes('true') ||
                        rawTipo.includes('verdadero') ||
                        rawTipo.includes('falso') ||
                        rawTipo.includes('vf')
                    ) {
                        tipo = 'Verdadero/Falso';
                    } else if (
                        rawTipo.includes('short') ||
                        rawTipo.includes('corta') ||
                        rawTipo.includes('escrita') ||
                        rawTipo.includes('abierta')
                    ) {
                        tipo = 'Respuesta escrita';
                    } else {
                        tipo = 'Opción múltiple';
                    }

                    // Construir opciones según el tipo
                    let opciones = [];

                    if (tipo === 'Verdadero/Falso') {
                        const esVerdadera =
                            rawCorrecta.toLowerCase().startsWith('v') ||
                            rawCorrecta.toLowerCase().startsWith('t') ||
                            rawCorrecta === '1' ||
                            rawCorrecta.toLowerCase().includes('verdad');

                        opciones = [
                            { texto: 'Verdadero', correcta: esVerdadera },
                            { texto: 'Falso', correcta: !esVerdadera }
                        ];
                    } else if (tipo === 'Respuesta escrita') {
                        // Para respuesta escrita, la pauta es la respuesta esperada
                        const pauta = rawCorrecta || opcA || 'Respuesta abierta';
                        opciones = [
                            { texto: pauta, correcta: true }
                        ];
                    } else {
                        // Opción múltiple
                        const opsTexto = [opcA, opcB, opcC, opcD];
                        // Rellenar si faltan opciones
                        while (opsTexto.length < 4) opsTexto.push('');

                        // Determinar índice correcto (A=0, B=1, C=2, D=3 o 1=0, 2=1, etc. o match con texto)
                        let indiceCorrecto = 0;
                        const corrUpper = rawCorrecta.toUpperCase();

                        if (corrUpper === 'A' || corrUpper === '1') indiceCorrecto = 0;
                        else if (corrUpper === 'B' || corrUpper === '2') indiceCorrecto = 1;
                        else if (corrUpper === 'C' || corrUpper === '3') indiceCorrecto = 2;
                        else if (corrUpper === 'D' || corrUpper === '4') indiceCorrecto = 3;
                        else {
                            const indexMatch = opsTexto.findIndex(t => t.toLowerCase() === rawCorrecta.toLowerCase() && t !== '');
                            if (indexMatch !== -1) {
                                indiceCorrecto = indexMatch;
                            }
                        }

                        opciones = opsTexto.map((texto, idx) => ({
                            texto: texto || `Opción ${idx + 1}`,
                            correcta: idx === indiceCorrecto
                        }));
                    }

                    preguntasProcesadas.push({
                        enunciado,
                        tipo,
                        opciones
                    });
                }

                if (preguntasProcesadas.length === 0) {
                    return reject(new Error("No se pudo extraer ninguna pregunta válida. Asegúrate de que las filas tengan enunciado."));
                }

                const resumen = {
                    total: preguntasProcesadas.length,
                    multiples: preguntasProcesadas.filter(p => p.tipo === 'Opción múltiple').length,
                    verdaderoFalso: preguntasProcesadas.filter(p => p.tipo === 'Verdadero/Falso').length,
                    escritas: preguntasProcesadas.filter(p => p.tipo === 'Respuesta escrita').length
                };

                resolve({
                    preguntas: preguntasProcesadas,
                    total: preguntasProcesadas.length,
                    resumen
                });
            } catch (err) {
                console.error("Error al procesar archivo Excel/CSV:", err);
                reject(new Error("Error al leer el archivo. Verifica que tenga un formato de tabla válido."));
            }
        };

        reader.onerror = () => {
            reject(new Error("Hubo un error al leer el archivo desde tu dispositivo."));
        };

        reader.readAsArrayBuffer(file);
    });
};

/**
 * Genera un archivo Excel (.xlsx) con el consolidado de calificaciones y notas de un cuestionario.
 * @param {Object} cuestionario Objeto con datos del cuestionario.
 * @param {Object} auditoriaData Datos de auditoría con la lista de intentos y notas.
 */
export const exportarNotasExcel = (cuestionario, auditoriaData) => {
    try {
        const titulo = auditoriaData?.titulo || cuestionario?.titulo || 'Cuestionario';
        const materia = auditoriaData?.materia || 'General';
        const intentos = auditoriaData?.intentos || [];
        const totalAlumnos = auditoriaData?.totalParticipantes ?? intentos.length;
        const promedio = auditoriaData?.promedio ?? (cuestionario?.promedioCalificacion || 0.0);

        const wb = XLSX.utils.book_new();

        // 1. Filas de información y encabezado
        const encabezado = [
            ["SISTEMA DE GESTIÓN Y EVALUACIÓN DE CUESTIONARIOS — NATIVATEC"],
            ["REPORTE OFICIAL DE CALIFICACIONES"],
            [""],
            ["Cuestionario:", titulo],
            ["Materia:", materia],
            ["Código de acceso:", cuestionario?.codigoAcceso || '—'],
            ["Fecha de reporte:", new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })],
            ["Total alumnos evaluados:", totalAlumnos],
            ["Promedio general del grupo:", `${Number(promedio).toFixed(2)} / 20`],
            [""]
        ];

        // 2. Columnas de la tabla de estudiantes
        const columnasTabla = [
            "N°",
            "Estudiante / Participante",
            "Nota (/20)",
            "Nota (/100)",
            "Estado",
            "Fecha de envío",
            "Hora",
            "Observaciones"
        ];

        // 3. Filas de datos
        const filasDatos = intentos.map((intento, index) => {
            const nota20 = intento.calificacion != null ? Number(intento.calificacion) : 0;
            const nota100 = (nota20 * 5).toFixed(0);
            const aprobado = nota20 >= 11;
            const estado = intento.tienePreguntasEscritas && intento.calificacion == null
                ? "EN REVISIÓN"
                : (aprobado ? "APROBADO" : "DESAPROBADO");

            const observaciones = intento.tienePreguntasEscritas
                ? "Incluye preguntas de respuesta escrita"
                : "Calificación automática";

            return [
                index + 1,
                intento.nombreAlumno || "Anónimo",
                nota20.toFixed(1),
                nota100,
                estado,
                intento.fecha || "—",
                intento.hora || "—",
                observaciones
            ];
        });

        // Ensamblar matriz de datos completa
        const hojaMatriz = [
            ...encabezado,
            columnasTabla,
            ...filasDatos
        ];

        const ws = XLSX.utils.aoa_to_sheet(hojaMatriz);

        // Anchos de columna optimizados
        ws['!cols'] = [
            { wch: 6 },  // N°
            { wch: 32 }, // Nombre
            { wch: 14 }, // Nota /20
            { wch: 14 }, // Nota /100
            { wch: 16 }, // Estado
            { wch: 16 }, // Fecha
            { wch: 12 }, // Hora
            { wch: 36 }  // Observaciones
        ];

        XLSX.utils.book_append_sheet(wb, ws, "Calificaciones");

        // Nombre de archivo seguro
        const nombreArchivoLimpio = titulo
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar tildes
            .replace(/[^a-zA-Z0-9_\- ]/g, "")
            .trim()
            .replace(/\s+/g, "_");

        XLSX.writeFile(wb, `Notas_${nombreArchivoLimpio || 'Cuestionario'}.xlsx`);
        return true;
    } catch (err) {
        console.error("Error al exportar notas a Excel:", err);
        throw new Error("No se pudo generar el archivo Excel de notas.");
    }
};
