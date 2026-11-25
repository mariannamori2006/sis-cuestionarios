-- ============================================================================
-- Migración de datos existentes v2 -> v3 (PostgreSQL)
-- Ejecutar DESPUÉS de aplicar V3__esquema_completo_v3.sql sobre una BD con datos v2.
-- ============================================================================

BEGIN;

-- 1. Crear cursos reales a partir del prefijo "[Materia]" en cuestionarios.descripcion
INSERT INTO cursos (docente_id, nombre, color_hex)
SELECT DISTINCT
    c.creado_por,
    COALESCE(
        NULLIF(TRIM((regexp_match(c.descripcion, '^\[(.*?)\]'))[1]), ''),
        'General'
    ) AS nombre_curso,
    '#3b82f6'
FROM cuestionarios c
WHERE NOT EXISTS (
    SELECT 1 FROM cursos cur
    WHERE cur.docente_id = c.creado_por
      AND LOWER(cur.nombre) = LOWER(COALESCE(
          NULLIF(TRIM((regexp_match(c.descripcion, '^\[(.*?)\]'))[1]), ''),
          'General'
      ))
);

-- 2. Vincular cuestionarios existentes con su curso y estado inicial
UPDATE cuestionarios c
SET
    curso_id = cur.id,
    estado = CASE
        WHEN COALESCE(c.activo, TRUE) = FALSE THEN 'ARCHIVADO'
        ELSE 'PUBLICADO'
    END
FROM cursos cur
WHERE cur.docente_id = c.creado_por
  AND LOWER(cur.nombre) = LOWER(COALESCE(
      NULLIF(TRIM((regexp_match(c.descripcion, '^\[(.*?)\]'))[1]), ''),
      'General'
  ))
  AND c.curso_id IS NULL;

-- 3. Crear secciones a partir de cuestionarios.grupos_permitidos (separado por comas)
INSERT INTO secciones (curso_id, nombre)
SELECT DISTINCT
    c.curso_id,
    TRIM(grp) AS nombre_seccion
FROM cuestionarios c,
     LATERAL regexp_split_to_table(COALESCE(c.grupos_permitidos, ''), ',') AS grp
WHERE c.curso_id IS NOT NULL
  AND TRIM(grp) <> ''
ON CONFLICT (curso_id, nombre) DO NOTHING;

-- 4. Crear una sesión de evaluación por cada cuestionario que ya tenía codigo_acceso
INSERT INTO sesiones_evaluacion (
    cuestionario_id,
    docente_id,
    titulo_sesion,
    codigo_numerico,
    estado,
    permitir_nuevos_ingresos,
    pedir_seccion,
    fecha_inicio,
    fecha_fin
)
SELECT
    c.id,
    c.creado_por,
    c.titulo,
    LPAD(RIGHT(REGEXP_REPLACE(COALESCE(c.codigo_acceso, ''), '[^0-9]', '', 'g'), 6), 6, '0'),
    CASE
        WHEN c.fecha_fin IS NOT NULL AND c.fecha_fin < NOW() THEN 'CERRADA'
        WHEN c.fecha_inicio IS NOT NULL AND c.fecha_inicio > NOW() THEN 'PROGRAMADA'
        WHEN COALESCE(c.activo, TRUE) = FALSE THEN 'CERRADA'
        ELSE 'ABIERTA'
    END,
    COALESCE(c.activo, TRUE),
    TRUE,
    c.fecha_inicio,
    c.fecha_fin
FROM cuestionarios c
WHERE NOT EXISTS (
    SELECT 1 FROM sesiones_evaluacion s WHERE s.cuestionario_id = c.id
);

-- 5. Migrar intentos v2 (intentos_cuestionario) -> intentos_evaluacion
-- Separa nombre_invitado en nombres y apellidos (últimas palabras como apellido aproximado)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'intentos_cuestionario') THEN
        INSERT INTO intentos_evaluacion (
            id,
            sesion_id,
            cuestionario_id,
            nombres,
            apellidos,
            seccion_texto,
            nombre_normalizado,
            numero_intento,
            estado,
            fecha_inicio,
            ultima_actividad,
            fecha_entrega,
            duracion_segundos,
            puntaje_obtenido,
            puntaje_maximo,
            nota_final,
            aprobado,
            es_intento_oficial,
            total_advertencias,
            created_at,
            updated_at
        )
        SELECT
            ic.id,
            s.id AS sesion_id,
            ic.cuestionario_id,
            -- Primera(s) palabra(s) como nombres; si solo hay una palabra, se coloca en nombres
            COALESCE(NULLIF(TRIM(
                CASE
                    WHEN array_length(regexp_split_to_array(TRIM(COALESCE(ic.nombre_invitado, u.nombre, 'Alumno')), '\s+'), 1) > 1
                    THEN array_to_string(
                        (regexp_split_to_array(TRIM(COALESCE(ic.nombre_invitado, u.nombre, 'Alumno')), '\s+'))[1:array_length(regexp_split_to_array(TRIM(COALESCE(ic.nombre_invitado, u.nombre, 'Alumno')), '\s+'), 1)-1],
                        ' '
                    )
                    ELSE TRIM(COALESCE(ic.nombre_invitado, u.nombre, 'Alumno'))
                END
            ), ''), 'Alumno') AS nombres,
            -- Última palabra como apellido (o apellido del usuario si existía)
            COALESCE(NULLIF(TRIM(
                CASE
                    WHEN u.apellido IS NOT NULL AND TRIM(u.apellido) <> '' THEN u.apellido
                    WHEN array_length(regexp_split_to_array(TRIM(COALESCE(ic.nombre_invitado, '')), '\s+'), 1) > 1
                    THEN (regexp_split_to_array(TRIM(ic.nombre_invitado), '\s+'))[array_length(regexp_split_to_array(TRIM(ic.nombre_invitado), '\s+'), 1)]
                    ELSE '-'
                END
            ), ''), '-') AS apellidos,
            NULLIF(TRIM(ic.grupo), ''),
            LOWER(unaccent(REGEXP_REPLACE(TRIM(COALESCE(ic.nombre_invitado, CONCAT(u.nombre, ' ', COALESCE(u.apellido, '')), 'alumno')), '\s+', ' ', 'g'))),
            1,
            CASE
                WHEN COALESCE(ic.finalizado_por_infraccion, FALSE) = TRUE THEN 'ANULADO_INFRACCION'
                WHEN ic.fecha_fin IS NOT NULL THEN 'ENTREGADO'
                ELSE 'EN_PROGRESO'
            END,
            ic.fecha_inicio,
            COALESCE(ic.fecha_fin, ic.fecha_inicio),
            ic.fecha_fin,
            CASE
                WHEN ic.fecha_fin IS NOT NULL THEN GREATEST(0, EXTRACT(EPOCH FROM (ic.fecha_fin - ic.fecha_inicio))::INTEGER)
                ELSE NULL
            END,
            COALESCE(ic.calificacion, 0.00),
            20.00,
            ic.calificacion,
            CASE WHEN ic.calificacion IS NOT NULL THEN ic.calificacion >= 11.00 ELSE NULL END,
            TRUE,
            COALESCE(ic.advertencias, 0),
            ic.created_at,
            COALESCE(ic.updated_at, ic.created_at)
        FROM intentos_cuestionario ic
        JOIN LATERAL (
            SELECT id FROM sesiones_evaluacion se
            WHERE se.cuestionario_id = ic.cuestionario_id
            ORDER BY se.created_at ASC
            LIMIT 1
        ) s ON TRUE
        LEFT JOIN usuarios u ON u.id = ic.usuario_id
        WHERE NOT EXISTS (
            SELECT 1 FROM intentos_evaluacion ie WHERE ie.id = ic.id
        );
    END IF;
END $$;

-- 6. Migrar detalles_intento -> respuestas_intento + respuesta_opciones
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'detalles_intento') THEN
        INSERT INTO respuestas_intento (
            id,
            intento_id,
            pregunta_id,
            respuesta_texto,
            es_correcta,
            requiere_revision,
            puntos_asignados,
            puntos_obtenidos,
            respondido_at
        )
        SELECT
            di.id,
            di.intento_id,
            di.pregunta_id,
            di.respuesta_texto,
            CASE
                WHEN o.id IS NOT NULL THEN o.es_correcta
                WHEN di.puntos_asignados IS NOT NULL AND di.puntos_asignados > 0 THEN COALESCE(di.puntos_obtenidos, 0) >= di.puntos_asignados
                ELSE NULL
            END,
            FALSE,
            COALESCE(di.puntos_asignados, 0.00),
            COALESCE(di.puntos_obtenidos, 0.00),
            COALESCE(di.updated_at, di.created_at)
        FROM detalles_intento di
        JOIN intentos_evaluacion ie ON ie.id = di.intento_id
        LEFT JOIN opciones_respuesta o ON o.id = di.opcion_seleccionada_id
        ON CONFLICT (intento_id, pregunta_id) DO NOTHING;

        INSERT INTO respuesta_opciones (respuesta_intento_id, opcion_id)
        SELECT di.id, di.opcion_seleccionada_id
        FROM detalles_intento di
        JOIN respuestas_intento ri ON ri.id = di.id
        WHERE di.opcion_seleccionada_id IS NOT NULL
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

COMMIT;

