-- ============================================================================
-- Sistema de Cuestionarios v3 - Esquema Completo (PostgreSQL)
-- Diseñado para docentes y acceso de alumnos sin inicio de sesión:
--   Link / QR -> Código numérico (6 dígitos) -> Nombres y Apellidos
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 1. USUARIOS (Docentes y Administradores; los alumnos no tienen cuenta)
CREATE TABLE IF NOT EXISTS usuarios (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre              VARCHAR(150) NOT NULL,
    apellido            VARCHAR(150),
    email               VARCHAR(150) NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    rol                 VARCHAR(30) NOT NULL CHECK (rol IN ('PROFESOR', 'DOCENTE', 'ALUMNO', 'ADMIN')),
    institucion         VARCHAR(160),
    activo              BOOLEAN NOT NULL DEFAULT TRUE,
    codigo_verificacion VARCHAR(10),
    codigo_expiracion   TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- 2. ESTRUCTURA ACADÉMICA: CURSOS Y SECCIONES
CREATE TABLE IF NOT EXISTS cursos (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    docente_id          UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre              VARCHAR(120) NOT NULL,
    codigo_curso        VARCHAR(30),
    periodo_academico   VARCHAR(40),
    color_hex           VARCHAR(10) NOT NULL DEFAULT '#3b82f6',
    activo              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS secciones (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curso_id            UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    nombre              VARCHAR(80) NOT NULL,
    activo              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_seccion_curso_nombre UNIQUE (curso_id, nombre)
);

-- 3. CUESTIONARIOS (Contenido, escala de notas y reglas por defecto)
CREATE TABLE IF NOT EXISTS cuestionarios (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo                      VARCHAR(200) NOT NULL,
    descripcion                 TEXT,
    codigo_acceso               VARCHAR(50) UNIQUE,
    creado_por                  UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    curso_id                    UUID REFERENCES cursos(id) ON DELETE SET NULL,
    estado                      VARCHAR(20) NOT NULL DEFAULT 'BORRADOR'
                                CHECK (estado IN ('BORRADOR', 'PUBLICADO', 'ARCHIVADO')),
    activo                      BOOLEAN NOT NULL DEFAULT TRUE,

    -- Escala de calificación configurable por el docente
    escala_nota                 NUMERIC(6,2) NOT NULL DEFAULT 20.00,
    nota_aprobatoria            NUMERIC(6,2) NOT NULL DEFAULT 11.00,

    -- Reglas por defecto
    tiempo_limite_minutos       INTEGER DEFAULT 0,
    orden_aleatorio             BOOLEAN DEFAULT FALSE,
    orden_opciones_aleatorio    BOOLEAN NOT NULL DEFAULT FALSE,
    modo_seguro                 BOOLEAN DEFAULT FALSE,
    limite_advertencias         INTEGER DEFAULT 3,
    fecha_inicio                TIMESTAMP,
    fecha_fin                   TIMESTAMP,
    limite_intentos             INTEGER DEFAULT 1,
    tipo_calificacion_intentos  VARCHAR(30) DEFAULT 'MEJOR_NOTA'
                                CHECK (tipo_calificacion_intentos IN ('MEJOR_NOTA', 'ULTIMO_INTENTO', 'PRIMER_INTENTO')),
    mostrar_nota_al_final       BOOLEAN NOT NULL DEFAULT TRUE,
    mostrar_retroalimentacion   BOOLEAN DEFAULT TRUE,
    grupos_permitidos           VARCHAR(500),

    created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMP DEFAULT NOW()
);

-- 4. PREGUNTAS Y OPCIONES DE RESPUESTA
CREATE TABLE IF NOT EXISTS preguntas (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cuestionario_id     UUID NOT NULL REFERENCES cuestionarios(id) ON DELETE CASCADE,
    texto_pregunta      TEXT NOT NULL,
    tipo                VARCHAR(50) NOT NULL DEFAULT 'OPCION_MULTIPLE'
                        CHECK (tipo IN ('OPCION_MULTIPLE', 'SELECCION_MULTIPLE', 'VERDADERO_FALSO', 'RESPUESTA_CORTA')),
    orden               INTEGER NOT NULL DEFAULT 1,
    puntos              DOUBLE PRECISION DEFAULT 4.0,
    imagen_url          TEXT,
    explicacion         TEXT,
    requerida           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS opciones_respuesta (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pregunta_id         UUID NOT NULL REFERENCES preguntas(id) ON DELETE CASCADE,
    texto_opcion        TEXT NOT NULL,
    es_correcta         BOOLEAN NOT NULL DEFAULT FALSE,
    orden               INTEGER NOT NULL DEFAULT 1,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- 5. BANCO DE PREGUNTAS REUTILIZABLE
CREATE TABLE IF NOT EXISTS banco_preguntas (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    materia             VARCHAR(100) NOT NULL DEFAULT 'General',
    curso_id            UUID REFERENCES cursos(id) ON DELETE SET NULL,
    tema                VARCHAR(150),
    dificultad          VARCHAR(20) NOT NULL DEFAULT 'MEDIA'
                        CHECK (dificultad IN ('FACIL', 'MEDIA', 'DIFICIL')),
    tipo                VARCHAR(50) NOT NULL DEFAULT 'OPCION_MULTIPLE'
                        CHECK (tipo IN ('OPCION_MULTIPLE', 'SELECCION_MULTIPLE', 'VERDADERO_FALSO', 'RESPUESTA_CORTA')),
    texto_pregunta      TEXT NOT NULL,
    puntos_defecto      DOUBLE PRECISION DEFAULT 4.0,
    imagen_url          TEXT,
    explicacion         TEXT,
    creado_por_id       UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS banco_opciones_respuesta (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    banco_pregunta_id   UUID NOT NULL REFERENCES banco_preguntas(id) ON DELETE CASCADE,
    texto_opcion        TEXT NOT NULL,
    es_correcta         BOOLEAN NOT NULL DEFAULT FALSE,
    orden               INTEGER NOT NULL DEFAULT 1,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- 6. SESIONES DE EVALUACIÓN (Link/QR limpio + Código numérico de 6 dígitos)
CREATE TABLE IF NOT EXISTS sesiones_evaluacion (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cuestionario_id          UUID NOT NULL REFERENCES cuestionarios(id) ON DELETE CASCADE,
    docente_id               UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    seccion_id               UUID REFERENCES secciones(id) ON DELETE SET NULL,

    titulo_sesion            VARCHAR(180),
    codigo_numerico          VARCHAR(8) NOT NULL,
    slug_publico             VARCHAR(60) UNIQUE,

    estado                   VARCHAR(20) NOT NULL DEFAULT 'ABIERTA'
                             CHECK (estado IN ('PROGRAMADA', 'ABIERTA', 'PAUSADA', 'CERRADA')),
    permitir_nuevos_ingresos BOOLEAN NOT NULL DEFAULT TRUE,
    pedir_seccion            BOOLEAN NOT NULL DEFAULT TRUE,

    fecha_inicio             TIMESTAMP,
    fecha_fin                TIMESTAMP,
    tiempo_limite_override   INTEGER,

    created_at               TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Un código numérico no puede repetirse entre sesiones que aún no están cerradas
CREATE UNIQUE INDEX IF NOT EXISTS uq_sesiones_codigo_activo
    ON sesiones_evaluacion (codigo_numerico)
    WHERE estado IN ('PROGRAMADA', 'ABIERTA', 'PAUSADA');

-- 7. INTENTOS DE EVALUACIÓN (Alumnos sin login: código -> nombres y apellidos)
CREATE TABLE IF NOT EXISTS intentos_evaluacion (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sesion_id               UUID NOT NULL REFERENCES sesiones_evaluacion(id) ON DELETE CASCADE,
    cuestionario_id         UUID NOT NULL REFERENCES cuestionarios(id) ON DELETE CASCADE,
    seccion_id              UUID REFERENCES secciones(id) ON DELETE SET NULL,

    -- Identificación separada para orden alfabético (Apellidos, Nombres)
    nombres                 VARCHAR(100) NOT NULL,
    apellidos               VARCHAR(100) NOT NULL,
    seccion_texto           VARCHAR(80),
    nombre_normalizado      VARCHAR(220) NOT NULL,
    device_token            VARCHAR(120),

    -- Estado y control de tiempo
    numero_intento          INTEGER NOT NULL DEFAULT 1,
    estado                  VARCHAR(30) NOT NULL DEFAULT 'EN_PROGRESO'
                            CHECK (estado IN ('EN_PROGRESO', 'ENTREGADO', 'EXPIRADO_TIEMPO', 'ANULADO_INFRACCION')),
    fecha_inicio            TIMESTAMP NOT NULL DEFAULT NOW(),
    ultima_actividad        TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_entrega           TIMESTAMP,
    duracion_segundos       INTEGER,

    -- Calificación transparente y control de reportes
    puntaje_obtenido        NUMERIC(8,2) NOT NULL DEFAULT 0.00,
    puntaje_maximo          NUMERIC(8,2) NOT NULL DEFAULT 0.00,
    nota_final              NUMERIC(6,2),
    aprobado                BOOLEAN,
    es_intento_oficial      BOOLEAN NOT NULL DEFAULT TRUE,
    nota_editada_manual     BOOLEAN NOT NULL DEFAULT FALSE,
    observacion_docente     TEXT,

    total_advertencias      INTEGER NOT NULL DEFAULT 0,

    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 8. RESPUESTAS POR PREGUNTA (Opción única, selección múltiple y respuesta corta)
CREATE TABLE IF NOT EXISTS respuestas_intento (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intento_id              UUID NOT NULL REFERENCES intentos_evaluacion(id) ON DELETE CASCADE,
    pregunta_id             UUID NOT NULL REFERENCES preguntas(id) ON DELETE CASCADE,
    respuesta_texto         TEXT,
    es_correcta             BOOLEAN,
    requiere_revision       BOOLEAN NOT NULL DEFAULT FALSE,
    puntos_asignados        NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    puntos_obtenidos        NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    respondido_at           TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_respuesta_intento_pregunta UNIQUE (intento_id, pregunta_id)
);

CREATE TABLE IF NOT EXISTS respuesta_opciones (
    respuesta_intento_id    UUID NOT NULL REFERENCES respuestas_intento(id) ON DELETE CASCADE,
    opcion_id               UUID NOT NULL REFERENCES opciones_respuesta(id) ON DELETE CASCADE,
    PRIMARY KEY (respuesta_intento_id, opcion_id)
);

-- 9. EVENTOS DE SEGURIDAD Y NOTIFICACIONES
CREATE TABLE IF NOT EXISTS eventos_seguridad (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intento_id              UUID NOT NULL REFERENCES intentos_evaluacion(id) ON DELETE CASCADE,
    tipo_evento             VARCHAR(40) NOT NULL
                            CHECK (tipo_evento IN ('CAMBIO_PESTANA', 'SALIDA_PANTALLA_COMPLETA', 'PERDIDA_FOCO', 'RECONEXION')),
    detalle                 VARCHAR(255),
    occurred_at             TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notificaciones (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id              UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo                  VARCHAR(150) NOT NULL,
    mensaje                 TEXT NOT NULL,
    tipo                    VARCHAR(50) NOT NULL,
    leido                   BOOLEAN NOT NULL DEFAULT FALSE,
    cuestionario_id         UUID,
    sesion_id               UUID REFERENCES sesiones_evaluacion(id) ON DELETE CASCADE,
    intento_id              UUID,
    enlace                  VARCHAR(255),
    created_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 10. ÍNDICES DE CONSULTA RÁPIDA
CREATE INDEX IF NOT EXISTS idx_cursos_docente ON cursos(docente_id);
CREATE INDEX IF NOT EXISTS idx_secciones_curso ON secciones(curso_id);
CREATE INDEX IF NOT EXISTS idx_cuestionarios_docente_curso ON cuestionarios(creado_por, curso_id);
CREATE INDEX IF NOT EXISTS idx_preguntas_cuestionario_orden ON preguntas(cuestionario_id, orden);
CREATE INDEX IF NOT EXISTS idx_sesiones_cuestionario ON sesiones_evaluacion(cuestionario_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_docente_estado ON sesiones_evaluacion(docente_id, estado);
CREATE INDEX IF NOT EXISTS idx_intentos_sesion_estado ON intentos_evaluacion(sesion_id, estado);
CREATE INDEX IF NOT EXISTS idx_intentos_sesion_nombre ON intentos_evaluacion(sesion_id, nombre_normalizado);
CREATE INDEX IF NOT EXISTS idx_intentos_orden_acta ON intentos_evaluacion(sesion_id, apellidos, nombres);
CREATE INDEX IF NOT EXISTS idx_intentos_oficiales ON intentos_evaluacion(cuestionario_id, es_intento_oficial)
    WHERE es_intento_oficial = TRUE;
CREATE INDEX IF NOT EXISTS idx_respuestas_pregunta ON respuestas_intento(pregunta_id);
CREATE INDEX IF NOT EXISTS idx_eventos_intento ON eventos_seguridad(intento_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_leido ON notificaciones(usuario_id, leido);

