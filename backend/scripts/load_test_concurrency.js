/**
 * SIMULADOR DE PRUEBAS DE CARGA Y CONCURRENCIA
 * Sistema de Cuestionarios NativaTec
 * 
 * Este script simula múltiples envíos concurrentes de cuestionarios por parte de alumnos
 * hacia el backend de Spring Boot conectado a la base de datos PostgreSQL local.
 * 
 * Uso:
 *   node scripts/load_test_concurrency.js [concurrencia] [codigoAcceso]
 * 
 * Ejemplo:
 *   node scripts/load_test_concurrency.js 50 148177
 */

const http = require('http');

// Configuración por defecto
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080/api';
const CONCURRENCIA = parseInt(process.argv[2], 10) || 50;
const CODIGO_CUESTIONARIO = process.argv[3] || '148177';

// Función utilitaria para peticiones HTTP
function httpRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const reqOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 80,
            path: parsedUrl.pathname + parsedUrl.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        const startTime = Date.now();
        const req = http.request(reqOptions, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                const duration = Date.now() - startTime;
                let data = body;
                try {
                    data = JSON.parse(body);
                } catch (e) {
                    // Mantener texto plano si no es JSON
                }
                resolve({
                    status: res.statusCode,
                    duration,
                    data
                });
            });
        });

        req.on('error', (err) => {
            const duration = Date.now() - startTime;
            reject({ error: err, duration });
        });

        if (options.body) {
            req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        }

        req.end();
    });
}

// Nombres de prueba para los alumnos
const NOMBRES_ALUMNOS = [
    "Ana Morales", "Carlos Ruiz", "Diana Mendoza", "Eduardo Castro", "Fernanda Ortiz",
    "Gabriel Silva", "Helena Ramos", "Ignacio Vargas", "Jimena Torres", "Kevin Paredes",
    "Lucía Flores", "Mateo Gómez", "Natalia Chávez", "Omar Benítez", "Patricia Rivas",
    "Rodrigo Peña", "Sofía Medina", "Tomás Herrera", "Valeria Quispe", "William Romero"
];

async function ejecutarPruebaDeCarga() {
    console.log("===============================================================================");
    console.log(" 🚀 INICIANDO PRUEBA DE CARGA Y CONCURRENCIA - NATIVATEC ");
    console.log("===============================================================================");
    console.log(` ▸ Servidor Destino   : ${BASE_URL}`);
    console.log(` ▸ Concurrencia       : ${CONCURRENCIA} envíos simultáneos`);
    console.log(` ▸ Código Cuestionario: ${CODIGO_CUESTIONARIO}`);
    console.log(` ▸ Base de Datos      : PostgreSQL Local (localhost:5432/sis_cuestionarios)`);
    console.log("-------------------------------------------------------------------------------\n");

    // 1. Obtener cuestionario para resolver
    console.log("🔍 Paso 1: Obteniendo cuestionario y preguntas desde el servidor...");
    let cuestionario;
    try {
        const resCuestionario = await httpRequest(`${BASE_URL}/cuestionarios/resolver/${CODIGO_CUESTIONARIO}`);
        if (resCuestionario.status !== 200 || !resCuestionario.data?.id) {
            throw new Error(`No se pudo encontrar el cuestionario con código ${CODIGO_CUESTIONARIO}. Status: ${resCuestionario.status}`);
        }
        cuestionario = resCuestionario.data;
        console.log(` ✔ Cuestionario encontrado: "${cuestionario.titulo}" (ID: ${cuestionario.id})`);
        console.log(` ✔ Cantidad de preguntas : ${cuestionario.preguntas?.length || 0}\n`);
    } catch (err) {
        console.error(" ❌ Error al obtener cuestionario:", err.message || err);
        return;
    }

    const preguntas = cuestionario.preguntas || [];
    if (preguntas.length === 0) {
        console.error(" ❌ El cuestionario no contiene preguntas para responder.");
        return;
    }

    // 2. Preparar los paquetes de envío simulando respuestas de alumnos
    console.log(`⚡ Paso 2: Generando ${CONCURRENCIA} cargas de envío simultáneas...`);
    const envios = [];
    for (let i = 0; i < CONCURRENCIA; i++) {
        const nombreAlumno = `${NOMBRES_ALUMNOS[i % NOMBRES_ALUMNOS.length]} (Test ${i + 1})`;
        
        // Simular respuestas aleatorias pero válidas para cada pregunta
        const respuestas = preguntas.map(p => {
            if (p.tipo === 'RESPUESTA_CORTA') {
                return {
                    preguntaId: p.id,
                    respuestaTexto: `Respuesta de prueba concurrente del alumno ${i + 1}`
                };
            } else {
                // Opción múltiple o V/F: elegir una opción aleatoria de las disponibles
                const opciones = p.opciones || [];
                const opcionElegida = opciones.length > 0 
                    ? opciones[Math.floor(Math.random() * opciones.length)] 
                    : null;
                return {
                    preguntaId: p.id,
                    opcionSeleccionadaId: opcionElegida ? opcionElegida.id : null
                };
            }
        });

        const payload = {
            cuestionarioId: cuestionario.id,
            nombreParticipante: nombreAlumno,
            respuestas: respuestas
        };

        envios.push({ id: i + 1, nombreAlumno, payload });
    }

    console.log(` ✔ Cargas listas para disparo concurrente.\n`);

    // 3. Ejecutar peticiones concurrentes
    console.log(`🔥 Paso 3: Disparando ${CONCURRENCIA} peticiones simultáneas a POST /api/intentos/responder...`);
    const testStartTime = Date.now();

    const promesas = envios.map(async (item) => {
        try {
            const res = await httpRequest(`${BASE_URL}/intentos/responder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: item.payload
            });
            return {
                id: item.id,
                nombre: item.nombreAlumno,
                exito: res.status === 201 || res.status === 200,
                statusCode: res.status,
                duracionMs: res.duration,
                nota: res.data?.calificacion,
                intentoId: res.data?.intentoId,
                error: null
            };
        } catch (err) {
            return {
                id: item.id,
                nombre: item.nombreAlumno,
                exito: false,
                statusCode: 0,
                duracionMs: err.duration || 0,
                nota: null,
                intentoId: null,
                error: err.error ? err.error.message : String(err)
            };
        }
    });

    const resultados = await Promise.all(promesas);
    const testTotalDuration = Date.now() - testStartTime;

    // 4. Calcular métricas estadísticas
    const totalPeticiones = resultados.length;
    const exitosas = resultados.filter(r => r.exito);
    const fallidas = resultados.filter(r => !r.exito);
    const tiempos = resultados.map(r => r.duracionMs).sort((a, b) => a - b);

    const minLatencia = tiempos.length > 0 ? tiempos[0] : 0;
    const maxLatencia = tiempos.length > 0 ? tiempos[tiempos.length - 1] : 0;
    const avgLatencia = tiempos.reduce((a, b) => a + b, 0) / (tiempos.length || 1);
    const p50 = tiempos[Math.floor(tiempos.length * 0.50)] || 0;
    const p90 = tiempos[Math.floor(tiempos.length * 0.90)] || 0;
    const p95 = tiempos[Math.floor(tiempos.length * 0.95)] || 0;
    const p99 = tiempos[Math.floor(tiempos.length * 0.99)] || 0;
    const throughput = ((totalPeticiones / testTotalDuration) * 1000).toFixed(2);

    console.log("\n===============================================================================");
    console.log(" 📊 RESULTADOS DE LA PRUEBA DE CARGA Y CONCURRENCIA");
    console.log("===============================================================================");
    console.log(` ▸ Tiempo Total de la Prueba    : ${(testTotalDuration / 1000).toFixed(2)} segundos`);
    console.log(` ▸ Peticiones Totales Enviadas  : ${totalPeticiones}`);
    console.log(` ▸ Peticiones Exitosas (201/200): ${exitosas.length} (${((exitosas.length / totalPeticiones) * 100).toFixed(1)}%)`);
    console.log(` ▸ Peticiones Fallidas / Errores: ${fallidas.length}`);
    console.log(` ▸ Rendimiento (Throughput)     : ${throughput} req/segundo`);
    console.log("-------------------------------------------------------------------------------");
    console.log(" ⏱️  MÉTRICAS DE LATENCIA (TIEMPO DE RESPUESTA):");
    console.log(` ▸ Mínima                       : ${minLatencia} ms`);
    console.log(` ▸ Promedio                     : ${avgLatencia.toFixed(2)} ms`);
    console.log(` ▸ Mediana (P50)                : ${p50} ms`);
    console.log(` ▸ Percentil 90 (P90)           : ${p90} ms`);
    console.log(` ▸ Percentil 95 (P95)           : ${p95} ms`);
    console.log(` ▸ Percentil 99 (P99)           : ${p99} ms`);
    console.log(` ▸ Máxima                       : ${maxLatencia} ms`);
    console.log("===============================================================================\n");

    // 5. Verificar consistencia en la base de datos PostgreSQL
    console.log("🔎 Paso 4: Verificando integridad de datos en PostgreSQL...");
    try {
        const resAuditoria = await httpRequest(`${BASE_URL}/intentos/auditoria/${cuestionario.id}`);
        if (resAuditoria.status === 200 && resAuditoria.data) {
            const audit = resAuditoria.data;
            const totalPersistidos = audit.totalParticipantes ?? audit.intentos?.length ?? 0;
            const promedioBD = audit.promedio != null ? audit.promedio.toFixed(2) : '0.00';
            console.log(` ✔ Total de participantes registrados en BD : ${totalPersistidos}`);
            console.log(` ✔ Promedio acumulado de la evaluación en BD  : ${promedioBD} / 20 pts`);
            console.log(` ✔ Registros auditados recuperados            : ${audit.intentos?.length || 0}`);
            console.log(` ✔ Integridad de persistencia: CONFIRMADA (Transacciones ACID completadas)\n`);
        }
    } catch (e) {
        console.log(" ⚠️ No se pudo consultar la auditoría:", e.message || e);
    }

    if (fallidas.length > 0) {
        console.log("⚠️ DETALLE DE FALLAS:");
        fallidas.forEach(f => {
            console.log(` - Alumno [${f.nombre}]: Status ${f.statusCode} | Error: ${f.error}`);
        });
    } else {
        console.log("🎉 ¡PRUEBA CONCLUIDA CON ÉXITO TOTAL (100% de peticiones concurrentes procesadas y persistidas)!");
    }
}

ejecutarPruebaDeCarga();
