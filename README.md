# sis-cuestionarios
Sistema de gestión de cuestionarios (Spring Boot + React).

Backend desarrollado con **Spring Boot** y **Java**, utilizando **PostgreSQL (Neon)** como base de datos para la gestión de usuarios, cuestionarios, preguntas y respuestas de alumnos.

## Tecnologías Utilizadas
* **Java** (JDK 17)
* **Spring Boot**
* **Spring Data JPA** (Hibernate)
* **Lombok**
* **PostgreSQL** (Base de datos alojada en Neon)

## Estructura de la Base de Datos (Entidades)
1. **Usuario**: Gestión de perfiles (Profesores, Alumnos, Admins).
2. **Cuestionario**: Evaluaciones creadas por los profesores.
3. **Pregunta**: Preguntas asociadas a cada cuestionario (Opción múltiple, Verdadero/Falso, Respuesta corta).
4. **OpcionRespuesta**: Opciones posibles para cada pregunta.
5. **IntentoCuestionario**: Registro de las veces que un alumno realiza un cuestionario y su calificación.
6. **DetalleIntento**: Respuestas específicas dadas por el alumno en cada intento.