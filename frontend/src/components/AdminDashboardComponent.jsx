import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/authService';
import { obtenerUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from '../services/usuarioService';
import { obtenerCuestionarios, obtenerEstadisticas, obtenerActividadReciente, eliminarCuestionario } from '../services/cuestionarioService';
import AuditoriaResultadosModal from './AuditoriaResultadosModal';
import logoNativa from '../images/logoNativa.jpeg';
import { 
    LayoutDashboard, 
    Users, 
    FileText, 
    Settings, 
    LogOut, 
    UserPlus, 
    Search, 
    Trash2, 
    Edit2,
    Shield, 
    GraduationCap, 
    Award, 
    X, 
    Check, 
    CheckCircle2, 
    XCircle,
    Activity,
    Database,
    Server,
    Eye,
    TrendingUp,
    BarChart2,
    Copy,
    RefreshCw
} from 'lucide-react';

export default function AdminDashboardComponent() {
    const navigate = useNavigate();
    const currentUser = getCurrentUser();

    const userNombre = currentUser?.nombre || '';
    const userApellido = currentUser?.apellido || '';
    const fullName = `${userNombre} ${userApellido}`.trim() || 'Administrador';
    const userName = `Admin. ${fullName}`;
    const userEmail = currentUser?.email || 'admin@nativatec.edu';
    const userInitials = ((userNombre ? userNombre[0] : '') + (userApellido ? userApellido[0] : '') || 'AD').toUpperCase();

    const [vistaActiva, setVistaActiva] = useState('panel');
    const [usuarios, setUsuarios] = useState([]);
    const [cuestionarios, setCuestionarios] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);
    const [actividadReciente, setActividadReciente] = useState([]);
    const [loadingUsuarios, setLoadingUsuarios] = useState(false);
    const [loadingCuestionarios, setLoadingCuestionarios] = useState(false);
    const [busquedaUsuario, setBusquedaUsuario] = useState('');
    const [filtroRol, setFiltroRol] = useState('TODOS');
    const [filtroEstado, setFiltroEstado] = useState('TODOS');
    const [busquedaCuestionario, setBusquedaCuestionario] = useState('');

    // Modal nuevo usuario
    const [modalCrearOpen, setModalCrearOpen] = useState(false);
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [nuevoApellido, setNuevoApellido] = useState('');
    const [nuevoEmail, setNuevoEmail] = useState('');
    const [nuevoPassword, setNuevoPassword] = useState('');
    const [nuevoRol, setNuevoRol] = useState('PROFESOR');
    const [errorModal, setErrorModal] = useState('');
    const [guardandoUsuario, setGuardandoUsuario] = useState(false);

    // Modal editar usuario
    const [modalEditarOpen, setModalEditarOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editNombre, setEditNombre] = useState('');
    const [editApellido, setEditApellido] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [editRol, setEditRol] = useState('PROFESOR');
    const [editActivo, setEditActivo] = useState(true);
    const [errorModalEditar, setErrorModalEditar] = useState('');
    const [guardandoEdicion, setGuardandoEdicion] = useState(false);

    // Modal de Auditoría para cuestionario
    const [cuestionarioAuditoria, setCuestionarioAuditoria] = useState(null);
    const [modalAuditoriaOpen, setModalAuditoriaOpen] = useState(false);

    // Notificación flotante / Toast
    const [toastMessage, setToastMessage] = useState('');

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3500);
    };

    // Cargar datos
    const cargarUsuarios = () => {
        setLoadingUsuarios(true);
        obtenerUsuarios()
            .then(data => setUsuarios(data || []))
            .catch(err => console.error("Error al cargar usuarios:", err))
            .finally(() => setLoadingUsuarios(false));
    };

    const cargarCuestionarios = () => {
        setLoadingCuestionarios(true);
        obtenerCuestionarios()
            .then(data => setCuestionarios(data || []))
            .catch(err => console.error("Error al cargar cuestionarios:", err))
            .finally(() => setLoadingCuestionarios(false));
    };

    const cargarEstadisticas = () => {
        obtenerEstadisticas()
            .then(data => setEstadisticas(data))
            .catch(err => console.error("Error al cargar estadísticas:", err));

        obtenerActividadReciente()
            .then(data => setActividadReciente(data || []))
            .catch(err => console.error("Error al cargar actividad reciente:", err));
    };

    useEffect(() => {
        cargarUsuarios();
        cargarCuestionarios();
        cargarEstadisticas();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Cambiar estado activo de un usuario
    const handleToggleActivo = async (usuario) => {
        try {
            const nuevoEstado = !usuario.activo;
            await actualizarUsuario(usuario.id, {
                ...usuario,
                activo: nuevoEstado
            });
            showToast(`Usuario ${usuario.nombre} ${nuevoEstado ? 'activado' : 'desactivado'} con éxito.`);
            cargarUsuarios();
        } catch (err) {
            console.error("Error al actualizar estado del usuario:", err);
            alert("No se pudo cambiar el estado del usuario.");
        }
    };

    // Abrir modal de edición
    const handleAbrirEditar = (usuario) => {
        setEditId(usuario.id);
        setEditNombre(usuario.nombre || '');
        setEditApellido(usuario.apellido || '');
        setEditEmail(usuario.email || '');
        setEditPassword('');
        setEditRol(usuario.rol || 'PROFESOR');
        setEditActivo(usuario.activo ?? true);
        setErrorModalEditar('');
        setModalEditarOpen(true);
    };

    // Guardar edición de usuario
    const handleGuardarEdicion = async (e) => {
        e.preventDefault();
        setErrorModalEditar('');
        if (!editNombre.trim() || !editApellido.trim() || !editEmail.trim()) {
            setErrorModalEditar('El nombre, apellido y correo son obligatorios.');
            return;
        }

        try {
            setGuardandoEdicion(true);
            const payload = {
                nombre: editNombre.trim(),
                apellido: editApellido.trim(),
                email: editEmail.trim(),
                rol: editRol,
                activo: editActivo
            };

            if (editPassword && editPassword.trim().length >= 6) {
                payload.passwordHash = editPassword.trim();
            }

            await actualizarUsuario(editId, payload);
            setModalEditarOpen(false);
            showToast('Usuario actualizado exitosamente.');
            cargarUsuarios();
        } catch (err) {
            console.error("Error al actualizar usuario:", err);
            setErrorModalEditar('Error al actualizar el usuario. Verifica si el correo ya está en uso.');
        } finally {
            setGuardandoEdicion(false);
        }
    };

    // Eliminar usuario
    const handleEliminarUsuario = async (id, nombre) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente al usuario "${nombre}"? Esta acción no se puede deshacer.`)) {
            try {
                await eliminarUsuario(id);
                showToast(`Usuario "${nombre}" eliminado.`);
                cargarUsuarios();
            } catch (err) {
                console.error("Error al eliminar usuario:", err);
                alert("Error al eliminar el usuario.");
            }
        }
    };

    // Crear nuevo usuario desde el admin
    const handleCrearUsuario = async (e) => {
        e.preventDefault();
        setErrorModal('');
        if (!nuevoNombre.trim() || !nuevoApellido.trim() || !nuevoEmail.trim() || !nuevoPassword.trim()) {
            setErrorModal('Todos los campos marcados con * son obligatorios.');
            return;
        }

        if (nuevoPassword.length < 6) {
            setErrorModal('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        try {
            setGuardandoUsuario(true);
            await crearUsuario({
                nombre: nuevoNombre.trim(),
                apellido: nuevoApellido.trim(),
                email: nuevoEmail.trim(),
                passwordHash: nuevoPassword,
                rol: nuevoRol,
                activo: true
            });
            setModalCrearOpen(false);
            setNuevoNombre('');
            setNuevoApellido('');
            setNuevoEmail('');
            setNuevoPassword('');
            setNuevoRol('PROFESOR');
            showToast('Nuevo usuario registrado correctamente.');
            cargarUsuarios();
        } catch (err) {
            console.error("Error al crear usuario:", err);
            setErrorModal('No se pudo crear el usuario. Comprueba si el correo ya existe.');
        } finally {
            setGuardandoUsuario(false);
        }
    };

    // Eliminar cuestionario desde Admin
    const handleEliminarCuestionarioAdmin = async (id, titulo) => {
        if (window.confirm(`¿Seguro que deseas eliminar el cuestionario "${titulo}"? Se borrarán sus preguntas, opciones e intentos registrados.`)) {
            try {
                await eliminarCuestionario(id);
                showToast(`Cuestionario "${titulo}" eliminado correctamente.`);
                cargarCuestionarios();
                cargarEstadisticas();
            } catch (err) {
                console.error("Error al eliminar cuestionario:", err);
                alert("No se pudo eliminar el cuestionario.");
            }
        }
    };

    // Copiar código al portapapeles
    const handleCopiarCodigo = (codigo) => {
        if (!codigo) return;
        navigator.clipboard.writeText(codigo);
        showToast(`Código ${codigo} copiado al portapapeles.`);
    };

    // Filtrar usuarios
    const usuariosFiltrados = usuarios.filter(u => {
        const matchesQuery =
            (u.nombre && u.nombre.toLowerCase().includes(busquedaUsuario.toLowerCase())) ||
            (u.apellido && u.apellido.toLowerCase().includes(busquedaUsuario.toLowerCase())) ||
            (u.email && u.email.toLowerCase().includes(busquedaUsuario.toLowerCase()));

        const matchesRole = filtroRol === 'TODOS' || u.rol === filtroRol;
        const matchesEstado = filtroEstado === 'TODOS' || 
            (filtroEstado === 'ACTIVOS' && u.activo) || 
            (filtroEstado === 'INACTIVOS' && !u.activo);

        return matchesQuery && matchesRole && matchesEstado;
    });

    // Filtrar cuestionarios
    const cuestionariosFiltrados = cuestionarios.filter(c => {
        const query = busquedaCuestionario.toLowerCase();
        return (
            (c.titulo && c.titulo.toLowerCase().includes(query)) ||
            (c.descripcion && c.descripcion.toLowerCase().includes(query)) ||
            (c.codigoAcceso && c.codigoAcceso.toLowerCase().includes(query))
        );
    });

    const totalProfesores = usuarios.filter(u => u.rol === 'PROFESOR').length;
    const totalAdmins = usuarios.filter(u => u.rol === 'ADMIN').length;
    const totalAlumnos = usuarios.filter(u => u.rol === 'ALUMNO').length;
    const totalUsuariosActivos = usuarios.filter(u => u.activo).length;

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#f8fafc', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', overflow: 'hidden' }}>

            {/* TOAST FLOTANTE */}
            {toastMessage && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    zIndex: 9999,
                    fontSize: '13px',
                    fontWeight: '500'
                }}>
                    <CheckCircle2 size={18} color="#10b981" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* SIDEBAR */}
            <div style={{ width: '270px', backgroundColor: '#090d16', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 16px', borderRight: '1px solid #1e293b' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', padding: '4px' }}>
                        <div style={{ background: '#ffffff', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', flex: 1 }}>
                            <img src={logoNativa} alt="NativaTec" style={{ height: '26px', maxWidth: '100%', objectFit: 'contain' }} />
                        </div>
                    </div>

                    <div style={{ padding: '0 8px 12px 8px', fontSize: '11px', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Módulo de Administración
                    </div>

                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <button
                            onClick={() => setVistaActiva('panel')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                width: '100%',
                                padding: '12px 14px',
                                background: vistaActiva === 'panel' ? '#1e293b' : 'transparent',
                                color: vistaActiva === 'panel' ? '#ffffff' : '#94a3b8',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                textAlign: 'left',
                                transition: 'all 0.2s'
                            }}
                        >
                            <LayoutDashboard size={18} /> Panel Principal
                        </button>
                        <button
                            onClick={() => setVistaActiva('usuarios')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                width: '100%',
                                padding: '12px 14px',
                                background: vistaActiva === 'usuarios' ? '#1e293b' : 'transparent',
                                color: vistaActiva === 'usuarios' ? '#ffffff' : '#94a3b8',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                textAlign: 'left',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Users size={18} /> Gestión de Usuarios
                        </button>
                        <button
                            onClick={() => setVistaActiva('cuestionarios')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                width: '100%',
                                padding: '12px 14px',
                                background: vistaActiva === 'cuestionarios' ? '#1e293b' : 'transparent',
                                color: vistaActiva === 'cuestionarios' ? '#ffffff' : '#94a3b8',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                textAlign: 'left',
                                transition: 'all 0.2s'
                            }}
                        >
                            <FileText size={18} /> Cuestionarios Globales
                        </button>
                        <button
                            onClick={() => setVistaActiva('configuracion')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                width: '100%',
                                padding: '12px 14px',
                                background: vistaActiva === 'configuracion' ? '#1e293b' : 'transparent',
                                color: vistaActiva === 'configuracion' ? '#ffffff' : '#94a3b8',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                textAlign: 'left',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Server size={18} /> Estado del Servidor y BD
                        </button>
                    </nav>
                </div>

                {/* Perfil Admin en Sidebar */}
                <div style={{ borderTop: '1px solid #1e293b', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                        <div style={{ background: '#2563eb', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', flexShrink: '0' }}>
                            {userInitials}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{userName}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{userEmail}</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} title="Cerrar sesión" style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px' }}>
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '30px 40px' }}>

                {/* VISTA: PANEL PRINCIPAL */}
                {vistaActiva === 'panel' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h1 style={{ margin: '0 0 4px 0', fontSize: '26px', color: '#0f172a' }}>Panel de Administración</h1>
                                <span style={{ fontSize: '13px', color: '#64748b' }}>Supervisión general del sistema, auditoría y métricas globales</span>
                            </div>
                            <button
                                onClick={() => { cargarUsuarios(); cargarCuestionarios(); cargarEstadisticas(); showToast('Datos actualizados.'); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 14px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    color: '#475569',
                                    cursor: 'pointer'
                                }}
                            >
                                <RefreshCw size={14} /> Actualizar Datos
                            </button>
                        </div>

                        {/* BANNER PRINCIPAL DE CONTROL */}
                        <div style={{
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            borderRadius: '16px',
                            padding: '30px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '28px',
                            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)'
                        }}>
                            <div>
                                <span style={{ fontSize: '14px', color: '#94a3b8' }}>Bienvenido al centro de control institucional,</span>
                                <h2 style={{ margin: '4px 0 8px 0', fontSize: '24px' }}>{userName}</h2>
                                <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                                    Gestiona cuentas de docentes y alumnos, audita evaluaciones y supervisa la base de datos PostgreSQL local.
                                </span>
                            </div>
                            <button
                                onClick={() => setModalCrearOpen(true)}
                                style={{
                                    backgroundColor: '#2563eb',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '12px 20px',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                                }}
                            >
                                <UserPlus size={18} /> Registrar Usuario
                            </button>
                        </div>

                        {/* TARJETAS DE MÉTRICAS GLOBALES */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                            <div style={{ background: '#fff', padding: '22px', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', letterSpacing: '0.05em' }}>TOTAL USUARIOS</span>
                                    <Users size={18} color="#2563eb" />
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>{usuarios.length}</div>
                                <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span>●</span> {totalUsuariosActivos} cuentas activas
                                </div>
                            </div>

                            <div style={{ background: '#fff', padding: '22px', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', letterSpacing: '0.05em' }}>DOCENTES Y ADMINS</span>
                                    <GraduationCap size={18} color="#16a34a" />
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a' }}>{totalProfesores + totalAdmins}</div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{totalProfesores} Profesores / {totalAdmins} Administradores</div>
                            </div>

                            <div style={{ background: '#fff', padding: '22px', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', letterSpacing: '0.05em' }}>CUESTIONARIOS TOTALES</span>
                                    <FileText size={18} color="#7c3aed" />
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#7c3aed' }}>{cuestionarios.length}</div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Evaluaciones creadas</div>
                            </div>

                            <div style={{ background: '#fff', padding: '22px', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', letterSpacing: '0.05em' }}>PROMEDIO INSTITUCIONAL</span>
                                    <Award size={18} color="#d97706" />
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#d97706' }}>
                                    {estadisticas?.promedioGeneral != null ? `${estadisticas.promedioGeneral.toFixed(1)} / 20` : '—'}
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                    {estadisticas?.totalRespuestas || 0} respuestas recibidas
                                </div>
                            </div>
                        </div>

                        {/* FILA DE TABLA RÁPIDA DE USUARIOS Y ACTIVIDAD RECIENTE */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
                            {/* USUARIOS RECIENTES */}
                            <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                                    <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: '600' }}>Usuarios Registrados</h3>
                                    <button
                                        onClick={() => setVistaActiva('usuarios')}
                                        style={{ background: 'transparent', border: 'none', color: '#2563eb', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                                    >
                                        Ver todos ({usuarios.length}) →
                                    </button>
                                </div>

                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                                                <th style={{ padding: '10px 8px' }}>NOMBRE</th>
                                                <th style={{ padding: '10px 8px' }}>CORREO</th>
                                                <th style={{ padding: '10px 8px' }}>ROL</th>
                                                <th style={{ padding: '10px 8px' }}>ESTADO</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {usuarios.slice(0, 5).map(u => (
                                                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '12px 8px', fontWeight: '600', color: '#0f172a' }}>
                                                        {`${u.nombre || ''} ${u.apellido || ''}`.trim() || '—'}
                                                    </td>
                                                    <td style={{ padding: '12px 8px', color: '#64748b' }}>{u.email}</td>
                                                    <td style={{ padding: '12px 8px' }}>
                                                        <span style={{
                                                            padding: '4px 8px',
                                                            borderRadius: '14px',
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            background: u.rol === 'ADMIN' ? '#fef3c7' : u.rol === 'PROFESOR' ? '#eff6ff' : '#f1f5f9',
                                                            color: u.rol === 'ADMIN' ? '#b45309' : u.rol === 'PROFESOR' ? '#1d4ed8' : '#475569'
                                                        }}>
                                                            {u.rol}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px 8px' }}>
                                                        <span style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            padding: '3px 8px',
                                                            borderRadius: '6px',
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            background: u.activo ? '#dcfce7' : '#fee2e2',
                                                            color: u.activo ? '#15803d' : '#b91c1c'
                                                        }}>
                                                            {u.activo ? '● Activo' : '○ Inactivo'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* ACTIVIDAD RECIENTE */}
                            <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                                    <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: '600' }}>Actividad de Evaluaciones</h3>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>Últimas entregas</span>
                                </div>

                                {actividadReciente.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: '13px' }}>
                                        No hay entregas registradas aún.
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {actividadReciente.slice(0, 5).map(act => (
                                            <div key={act.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: act.avatarColor || '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                                        {act.avatarIniciales || 'AL'}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{act.nombreAlumno}</div>
                                                        <div style={{ fontSize: '11px', color: '#64748b' }}>{act.cuestionarioTitulo}</div>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: act.calificacion >= 11 ? '#15803d' : '#b91c1c' }}>
                                                        {act.notaTexto}
                                                    </div>
                                                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{act.tiempoRelativo}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* VISTA: GESTIÓN DE USUARIOS */}
                {vistaActiva === 'usuarios' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', color: '#0f172a' }}>Gestión de Usuarios</h1>
                                <span style={{ fontSize: '13px', color: '#64748b' }}>Supervisa, edita roles y administra el acceso de profesores, alumnos y administradores</span>
                            </div>
                            <button
                                onClick={() => setModalCrearOpen(true)}
                                style={{
                                    backgroundColor: '#0f172a',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '10px 18px',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                }}
                            >
                                <UserPlus size={16} /> Nuevo Usuario
                            </button>
                        </div>

                        {/* BARRA DE FILTROS Y BÚSQUEDA */}
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, apellido o correo..."
                                    value={busquedaUsuario}
                                    onChange={(e) => setBusquedaUsuario(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px 10px 36px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        outline: 'none',
                                        fontSize: '13px',
                                        backgroundColor: '#ffffff',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* Filtro por Rol */}
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                {['TODOS', 'PROFESOR', 'ADMIN', 'ALUMNO'].map(rol => (
                                    <button
                                        key={rol}
                                        onClick={() => setFiltroRol(rol)}
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid',
                                            borderColor: filtroRol === rol ? '#0f172a' : '#cbd5e1',
                                            background: filtroRol === rol ? '#0f172a' : '#ffffff',
                                            color: filtroRol === rol ? '#ffffff' : '#64748b',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {rol}
                                    </button>
                                ))}
                            </div>

                            {/* Filtro por Estado */}
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                {['TODOS', 'ACTIVOS', 'INACTIVOS'].map(st => (
                                    <button
                                        key={st}
                                        onClick={() => setFiltroEstado(st)}
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid',
                                            borderColor: filtroEstado === st ? '#2563eb' : '#cbd5e1',
                                            background: filtroEstado === st ? '#2563eb' : '#ffffff',
                                            color: filtroEstado === st ? '#ffffff' : '#64748b',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {st}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* TABLA DE USUARIOS COMPLETA */}
                        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                                            <th style={{ padding: '14px 16px' }}>NOMBRE Y APELLIDO</th>
                                            <th style={{ padding: '14px 16px' }}>CORREO ELECTRÓNICO</th>
                                            <th style={{ padding: '14px 16px' }}>ROL ASIGNADO</th>
                                            <th style={{ padding: '14px 16px' }}>ESTADO</th>
                                            <th style={{ padding: '14px 16px', textAlign: 'center' }}>ACCIONES</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingUsuarios ? (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                                                    Cargando usuarios desde PostgreSQL...
                                                </td>
                                            </tr>
                                        ) : usuariosFiltrados.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                                                    No se encontraron usuarios con los criterios de búsqueda seleccionados.
                                                </td>
                                            </tr>
                                        ) : (
                                            usuariosFiltrados.map(u => (
                                                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>
                                                        {`${u.nombre || ''} ${u.apellido || ''}`.trim() || '—'}
                                                    </td>
                                                    <td style={{ padding: '14px 16px', color: '#64748b' }}>
                                                        {u.email}
                                                    </td>
                                                    <td style={{ padding: '14px 16px' }}>
                                                        <span style={{
                                                            padding: '4px 10px',
                                                            borderRadius: '14px',
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            background: u.rol === 'ADMIN' ? '#fef3c7' : u.rol === 'PROFESOR' ? '#eff6ff' : '#f1f5f9',
                                                            color: u.rol === 'ADMIN' ? '#b45309' : u.rol === 'PROFESOR' ? '#1d4ed8' : '#475569'
                                                        }}>
                                                            {u.rol}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '14px 16px' }}>
                                                        <button
                                                            onClick={() => handleToggleActivo(u)}
                                                            title="Clic para cambiar estado"
                                                            style={{
                                                                border: 'none',
                                                                padding: '5px 10px',
                                                                borderRadius: '6px',
                                                                fontSize: '11px',
                                                                fontWeight: '600',
                                                                cursor: 'pointer',
                                                                background: u.activo ? '#dcfce7' : '#fee2e2',
                                                                color: u.activo ? '#15803d' : '#b91c1c'
                                                            }}
                                                        >
                                                            {u.activo ? '● Activo' : '○ Inactivo'}
                                                        </button>
                                                    </td>
                                                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                                        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                                                            <button
                                                                onClick={() => handleAbrirEditar(u)}
                                                                style={{
                                                                    background: '#f1f5f9',
                                                                    border: 'none',
                                                                    color: '#0f172a',
                                                                    cursor: 'pointer',
                                                                    padding: '6px 8px',
                                                                    borderRadius: '6px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    fontSize: '12px'
                                                                }}
                                                                title="Editar usuario"
                                                            >
                                                                <Edit2 size={14} /> Editar
                                                            </button>
                                                            <button
                                                                onClick={() => handleEliminarUsuario(u.id, `${u.nombre || ''} ${u.apellido || ''}`.trim())}
                                                                style={{
                                                                    background: '#fee2e2',
                                                                    border: 'none',
                                                                    color: '#dc2626',
                                                                    cursor: 'pointer',
                                                                    padding: '6px 8px',
                                                                    borderRadius: '6px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    fontSize: '12px'
                                                                }}
                                                                title="Eliminar usuario"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* VISTA: CUESTIONARIOS GLOBALES */}
                {vistaActiva === 'cuestionarios' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', color: '#0f172a' }}>Cuestionarios Globales</h1>
                                <span style={{ fontSize: '13px', color: '#64748b' }}>Supervisión y auditoría de todas las evaluaciones académicas registradas en el sistema</span>
                            </div>
                            <button
                                onClick={() => { cargarCuestionarios(); showToast('Cuestionarios actualizados.'); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 14px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    color: '#475569',
                                    cursor: 'pointer'
                                }}
                            >
                                <RefreshCw size={14} /> Refrescar
                            </button>
                        </div>

                        {/* Buscador de cuestionarios */}
                        <div style={{ marginBottom: '20px', position: 'relative', maxWidth: '400px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder="Buscar por título, materia o código..."
                                value={busquedaCuestionario}
                                onChange={(e) => setBusquedaCuestionario(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px 10px 36px',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e1',
                                    outline: 'none',
                                    fontSize: '13px',
                                    backgroundColor: '#ffffff',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        {loadingCuestionarios ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Cargando cuestionarios...</div>
                        ) : cuestionariosFiltrados.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                                No se encontraron cuestionarios.
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                                {cuestionariosFiltrados.map(c => (
                                    <div key={c.id} style={{ background: '#fff', borderRadius: '14px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                    <span style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                                                        {c.preguntas ? `${c.preguntas.length} Preguntas` : 'Evaluación'}
                                                    </span>
                                                    {c.tiempoLimiteMinutos > 0 && (
                                                        <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                                            <Clock size={11} /> {c.tiempoLimiteMinutos}m
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleCopiarCodigo(c.codigoAcceso)}
                                                    title="Copiar código de acceso"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        background: '#f1f5f9',
                                                        border: 'none',
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        fontSize: '11px',
                                                        fontWeight: 'bold',
                                                        color: '#0f172a',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Copy size={12} /> {c.codigoAcceso || 'SIN CÓDIGO'}
                                                </button>
                                            </div>

                                            <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#0f172a' }}>{c.titulo}</h3>
                                            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0', minHeight: '36px' }}>
                                                {c.descripcion || 'Sin descripción adicional.'}
                                            </p>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '12px', color: '#475569', marginBottom: '16px' }}>
                                                <div>
                                                    <span style={{ color: '#94a3b8', display: 'block', fontSize: '10px' }}>DOCENTE</span>
                                                    <strong>{c.creadoPor ? `${c.creadoPor.nombre || ''} ${c.creadoPor.apellido || ''}`.trim() : 'Sistema'}</strong>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{ color: '#94a3b8', display: 'block', fontSize: '10px' }}>RESPUESTAS</span>
                                                    <strong>{c.totalRespuestas || 0} entregas</strong>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                                            <button
                                                onClick={() => {
                                                    setCuestionarioAuditoria(c);
                                                    setModalAuditoriaOpen(true);
                                                }}
                                                style={{
                                                    flex: 1,
                                                    padding: '9px 12px',
                                                    background: '#0f172a',
                                                    color: '#ffffff',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <Eye size={14} /> Auditar Resultados
                                            </button>
                                            <button
                                                onClick={() => handleEliminarCuestionarioAdmin(c.id, c.titulo)}
                                                style={{
                                                    padding: '9px 12px',
                                                    background: '#fee2e2',
                                                    color: '#dc2626',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                                title="Eliminar cuestionario permanentemente"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* VISTA: CONFIGURACIÓN Y ESTADO DEL SISTEMA */}
                {vistaActiva === 'configuracion' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', color: '#0f172a' }}>Estado del Servidor y Base de Datos</h1>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>Diagnóstico de infraestructura, conexión a PostgreSQL y seguridad JWT</span>
                        </div>

                        {/* DIAGNÓSTICO EN TIEMPO REAL */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                            <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                    <Database size={22} color="#2563eb" />
                                    <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Base de Datos PostgreSQL</h3>
                                </div>
                                <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
                                    <div><strong>Estado:</strong> <span style={{ color: '#16a34a', fontWeight: 'bold' }}>● En línea (Conectado)</span></div>
                                    <div><strong>Host:</strong> localhost:5432</div>
                                    <div><strong>Base:</strong> <code>sis_cuestionarios</code></div>
                                    <div><strong>Pool:</strong> HikariCP Concurrente</div>
                                </div>
                            </div>

                            <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                    <Server size={22} color="#16a34a" />
                                    <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Backend Spring Boot</h3>
                                </div>
                                <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
                                    <div><strong>Versión:</strong> Java JDK 17 (Spring Boot 3.x)</div>
                                    <div><strong>Puerto:</strong> 8080 (REST API)</div>
                                    <div><strong>CORS:</strong> http://localhost:5173</div>
                                    <div><strong>Persistencia:</strong> Spring Data JPA / Hibernate</div>
                                </div>
                            </div>

                            <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                    <Shield size={22} color="#d97706" />
                                    <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Seguridad y Cifrado</h3>
                                </div>
                                <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
                                    <div><strong>Autenticación:</strong> Stateless JWT Tokens</div>
                                    <div><strong>Algoritmo:</strong> HMAC-SHA384</div>
                                    <div><strong>Encriptación Passwords:</strong> BCrypt ($2a$)</div>
                                    <div><strong>Roles:</strong> ADMIN, PROFESOR, ALUMNO</div>
                                </div>
                            </div>
                        </div>

                        {/* RESUMEN DE PRUEBAS DE CARGA */}
                        <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#0f172a' }}>Simulación de Pruebas de Carga y Concurrencia</h3>
                            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
                                Puedes ejecutar pruebas de estrés y concurrencia simulando hasta 100 o 200 envíos simultáneos de cuestionarios mediante el script:
                            </p>
                            <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '14px', borderRadius: '8px', fontSize: '12px', overflowX: 'auto' }}>
node backend/scripts/load_test_concurrency.js 50 148177
                            </pre>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL CREAR NUEVO USUARIO */}
            {modalCrearOpen && (
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
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '480px',
                        padding: '30px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>Registrar Nuevo Usuario</h2>
                            <button
                                onClick={() => setModalCrearOpen(false)}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: '4px' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {errorModal && (
                            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                                {errorModal}
                            </div>
                        )}

                        <form onSubmit={handleCrearUsuario} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>NOMBRE *</label>
                                    <input
                                        type="text"
                                        value={nuevoNombre}
                                        onChange={(e) => setNuevoNombre(e.target.value)}
                                        placeholder="Ej: Sofía"
                                        required
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>APELLIDO *</label>
                                    <input
                                        type="text"
                                        value={nuevoApellido}
                                        onChange={(e) => setNuevoApellido(e.target.value)}
                                        placeholder="Ej: Pérez"
                                        required
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>CORREO ELECTRÓNICO *</label>
                                <input
                                    type="email"
                                    value={nuevoEmail}
                                    onChange={(e) => setNuevoEmail(e.target.value)}
                                    placeholder="usuario@nativatec.edu"
                                    required
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>ROL ASIGNADO</label>
                                <select
                                    value={nuevoRol}
                                    onChange={(e) => setNuevoRol(e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff', boxSizing: 'border-box' }}
                                >
                                    <option value="PROFESOR">Profesor</option>
                                    <option value="ADMIN">Administrador</option>
                                    <option value="ALUMNO">Alumno</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>CONTRASEÑA TEMPORAL *</label>
                                <input
                                    type="password"
                                    value={nuevoPassword}
                                    onChange={(e) => setNuevoPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setModalCrearOpen(false)}
                                    style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#f1f5f9', color: '#475569', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardandoUsuario}
                                    style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', background: '#0f172a', color: '#ffffff', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
                                >
                                    {guardandoUsuario ? 'Guardando...' : 'Guardar Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL EDITAR USUARIO */}
            {modalEditarOpen && (
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
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '480px',
                        padding: '30px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>Editar Usuario</h2>
                            <button
                                onClick={() => setModalEditarOpen(false)}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: '4px' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {errorModalEditar && (
                            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                                {errorModalEditar}
                            </div>
                        )}

                        <form onSubmit={handleGuardarEdicion} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>NOMBRE *</label>
                                    <input
                                        type="text"
                                        value={editNombre}
                                        onChange={(e) => setEditNombre(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>APELLIDO *</label>
                                    <input
                                        type="text"
                                        value={editApellido}
                                        onChange={(e) => setEditApellido(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>CORREO ELECTRÓNICO *</label>
                                <input
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>ROL ASIGNADO</label>
                                    <select
                                        value={editRol}
                                        onChange={(e) => setEditRol(e.target.value)}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff', boxSizing: 'border-box' }}
                                    >
                                        <option value="PROFESOR">Profesor</option>
                                        <option value="ADMIN">Administrador</option>
                                        <option value="ALUMNO">Alumno</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>ESTADO DE LA CUENTA</label>
                                    <select
                                        value={editActivo ? 'true' : 'false'}
                                        onChange={(e) => setEditActivo(e.target.value === 'true')}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff', boxSizing: 'border-box' }}
                                    >
                                        <option value="true">Activo</option>
                                        <option value="false">Inactivo</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>REESTABLECER CONTRASEÑA (OPCIONAL)</label>
                                <input
                                    type="password"
                                    value={editPassword}
                                    onChange={(e) => setEditPassword(e.target.value)}
                                    placeholder="Dejar vacío para mantener la contraseña actual"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setModalEditarOpen(false)}
                                    style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#f1f5f9', color: '#475569', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardandoEdicion}
                                    style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', background: '#0f172a', color: '#ffffff', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
                                >
                                    {guardandoEdicion ? 'Actualizando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL AUDITORÍA DE RESULTADOS DESDE ADMIN */}
            {modalAuditoriaOpen && cuestionarioAuditoria && (
                <AuditoriaResultadosModal
                    isOpen={modalAuditoriaOpen}
                    onClose={() => {
                        setModalAuditoriaOpen(false);
                        setCuestionarioAuditoria(null);
                    }}
                    cuestionario={cuestionarioAuditoria}
                    onActualizado={() => {
                        cargarCuestionarios();
                        cargarEstadisticas();
                    }}
                />
            )}
        </div>
    );
}
