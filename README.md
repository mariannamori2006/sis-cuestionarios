# Sistema de Gestión y Evaluación de Cuestionarios (NativaTec)

Sistema web integral para la creación, aplicación, auditoría y análisis estadístico de cuestionarios y evaluaciones académicas en línea. Desarrollado con una arquitectura desacoplada utilizando **Spring Boot (Java 17)** en el backend, **React + Vite** en el frontend y **PostgreSQL** como base de datos relacional.

---

## 🚀 Características Principales

### 👨‍🏫 Módulo del Docente (Dashboard de Profesor)
* **Panel Principal:** Tarjetas de métricas en tiempo real (cuestionarios activos, respuestas totales, alumnos únicos sin duplicados y promedio general sobre 20 puntos), lista de actividad reciente con calificaciones y gráfico de cuestionarios más respondidos.
* **Gestión de Cuestionarios (CRUD completo):**
  * Creación y edición interactiva de cuestionarios.
  * Soporte para múltiples tipos de preguntas:
    * **Opción múltiple** (selección de alternativa correcta).
    * **Verdadero / Falso** (evaluación binaria).
    * **Respuesta escrita / corta** (calificación manual / revisión por el docente).
  * Asignación y generación automática de **código numérico de acceso** para compartir con los alumnos.
  * Eliminación segura de cuestionarios con borrado en cascada.
* **Auditoría de Resultados:**
  * Visualización detallada de intentos de cada estudiante.
  * Revisión de respuestas marcadas y respuestas abiertas enviadas.
  * Registro de fecha y hora de entrega y cálculo de notas individuales.
* **Módulo de Estadísticas Académicas:**
  * Indicadores de rendimiento: total de respuestas, tasa de aprobación (%) y promedio general ponderado.
  * Gráfico de barras de **distribución de calificaciones** por rangos (`18–20 pts`, `15–17 pts`, `11–14 pts`, `0–10 pts`).
  * Comparativa de respuestas recibidas por cuestionario.
  * Tabla resumen clasificada por materia, preguntas y fecha de creación.
* **Módulo de Configuración:**
  * Gestión de perfil docente (nombre, correo electrónico, institución y foto de perfil).
  * Preferencias de plataforma (notificaciones por correo, visualización inmediata de puntajes y permisos de reintento).

---

### 🎓 Módulo del Estudiante (Participante)
* **Flujo de Acceso Seguro:**
  * Validación previa mediante **código numérico de acceso** del cuestionario.
  * Registro del nombre del estudiante para seguimiento académico.
* **Resolución de Evaluaciones:**
  * Interfaz dinámica y responsiva para responder preguntas cerradas y redactar respuestas abiertas.
  * Cálculo y retroalimentación inmediata de calificación (para exámenes con preguntas automáticas) o notificación de *"Pendiente de revisión"* cuando contiene preguntas escritas.

---

### 🛡️ Módulo de Administración
* Gestión de usuarios del sistema (Profesores, Alumnos y Administradores).
* Asignación y cambio de roles, activación/desactivación de cuentas y eliminación de usuarios.

---

## 🛠️ Stack Tecnológico

### Backend
* **Lenguaje:** Java 17
* **Framework:** Spring Boot 3.x
* **Seguridad:** Spring Security + JWT (JSON Web Tokens) con encriptación BCrypt
* **Persistencia:** Spring Data JPA / Hibernate
* **Base de Datos:** PostgreSQL 15+ (Local / DBeaver)
* **Herramientas de compilación:** Maven Wrapper (`./mvnw`)

### Frontend
* **Biblioteca:** React 18
* **Empaquetador:** Vite
* **Enrutamiento:** React Router DOM v6
* **Iconografía:** Lucide React
* **Cliente HTTP:** Axios (con interceptores para manejo de tokens JWT)
* **Estilos:** CSS moderno modular con diseño responsivo y estética premium

---

## 🗄️ Modelo Relacional de la Base de Datos

```
+---------------+        +-------------------+        +--------------------+
|   usuarios    |        |   cuestionarios   |        |     preguntas      |
+---------------+        +-------------------+        +--------------------+
| id (UUID, PK) |<-------| usuario_id (FK)   |        | id (UUID, PK)      |
| nombre        |        | id (UUID, PK)     |<-------| cuestionario_id(FK)|
| apellido      |        | titulo            |        | texto_pregunta     |
| email         |        | descripcion       |        | tipo               |
| password_hash |        | codigo_acceso     |        | puntos             |
| rol           |        | activo            |        +---------+----------+
| activo        |        | created_at        |                  |
+---------------+        +---------+---------+                  | 1:N
                                   | 1:N                        v
                                   |                  +--------------------+
                                   |                  | opciones_respuesta |
                                   |                  +--------------------+
                                   |                  | id (UUID, PK)      |
                                   |                  | pregunta_id (FK)   |
                                   |                  | texto_opcion       |
                                   |                  | es_correcta        |
                                   v                  +--------------------+
                         +----------------------+
                         | intentos_cuestionario|
                         +----------------------+
                         | id (UUID, PK)        |
                         | cuestionario_id (FK) |
                         | usuario_id (FK, opt) |
                         | nombre_invitado      |
                         | fecha_inicio         |
                         | fecha_fin            |
                         | calificacion         |
                         +----------+-----------+
                                    | 1:N
                                    v
                         +----------------------+
                         |   detalles_intento   |
                         +----------------------+
                         | id (UUID, PK)        |
                         | intento_id (FK)      |
                         | pregunta_id (FK)     |
                         | opcion_id (FK, opt)  |
                         | respuesta_texto (opt)|
                         +----------------------+
```

---

## 🔌 Principales Endpoints de la API REST

### 1. Autenticación (`/api/auth`)
* `POST /api/auth/login` - Iniciar sesión y obtener token JWT.
* `POST /api/auth/register` - Registro de nuevos usuarios con rol.

### 2. Cuestionarios (`/api/cuestionarios`)
* `GET /api/cuestionarios` - Listar cuestionarios con métricas calculadas.
* `GET /api/cuestionarios/{id}` - Obtener cuestionario por ID.
* `GET /api/cuestionarios/codigo/{codigoAcceso}` - Validar código de acceso.
* `GET /api/cuestionarios/resolver/{idOCodigo}` - Cargar cuestionario para resolver (sin revelar respuestas correctas).
* `POST /api/cuestionarios` - Crear nuevo cuestionario con preguntas y opciones.
* `PUT /api/cuestionarios/{id}` - Editar y actualizar cuestionario existente.
* `DELETE /api/cuestionarios/{id}` - Eliminar cuestionario y sus dependencias en cascada.

### 3. Intentos y Evaluaciones (`/api/intentos`)
* `POST /api/intentos/responder` - Enviar respuestas de un alumno y calificar.
* `GET /api/intentos/estadisticas-generales` - Métricas globales del dashboard.
* `GET /api/intentos/estadisticas-detalladas` - Reporte para el panel de estadísticas.
* `GET /api/intentos/actividad-reciente` - Últimos intentos registrados.
* `GET /api/intentos/auditoria/{cuestionarioId}` - Auditoría completa de entregas por examen.

### 4. Usuarios (`/api/usuarios`)
* `GET /api/usuarios` - Listar todos los usuarios (Admin).
* `PUT /api/usuarios/{id}` - Actualizar perfil / estado / rol de usuario.
* `DELETE /api/usuarios/{id}` - Eliminar usuario.

---

## ⚙️ Instalación y Ejecución Local

### Prerrequisitos
* **Java JDK 17** o superior.
* **Node.js** v18+ y **npm**.
* **PostgreSQL** instalado y en ejecución en el puerto `5432`.

### 1. Configuración de la Base de Datos
Crear la base de datos en PostgreSQL (vía pgAdmin, DBeaver o `psql`):
```sql
CREATE DATABASE sis_cuestionarios;
```

Asegurarse de que las credenciales en `backend/src/main/resources/application.properties` coincidan con tu entorno local:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/sis_cuestionarios
spring.datasource.username=postgres
spring.datasource.password=tu_contraseña
```

### 2. Ejecución del Backend (Spring Boot)
Abrir una terminal en la carpeta raíz del proyecto o en `backend`:
```bash
cd backend
./mvnw spring-boot:run
```
*El backend se iniciará en `http://localhost:8080`.*

### 3. Ejecución del Frontend (React + Vite)
Abrir una segunda terminal en la carpeta `frontend`:
```bash
cd frontend
npm install
npm run dev
```
*El frontend se iniciará en `http://localhost:5173`.*

---

## 👥 Roles de Usuario
* **PROFESOR:** Crea, edita, comparte, audita y analiza estadísticas de cuestionarios.
* **ALUMNO:** Ingresa con código de acceso, completa evaluaciones y consulta su puntuación.
* **ADMIN:** Administración y control global de cuentas y usuarios en la plataforma.