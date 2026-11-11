import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/authService';
import { obtenerUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from '../services/usuarioService';
import { obtenerCuestionarios, obtenerEstadisticas, obtenerActividadReciente, eliminarCuestionario } from '../services/cuestionarioService';
import AuditoriaResultadosModal from '../components/modals/AuditoriaResultadosModal';
import EstadisticasView from './EstadisticasView';
import logoNativa from '../images/logoNativa.jpeg';
import useResponsive from '../hooks/useResponsive';
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
    ShieldAlert, 
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
    BarChart3,
    Copy,
    RefreshCw,
    Menu
} from 'lucide-react';

export default function AdminDashboardComponent() {
    const navigate = useNavigate();
    const { isMobile } = useResponsive();
    const [menuAbierto, setMenuAbierto] = useState(false);
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

    const cambiarVista = (vista) => {
        setVistaActiva(vista);
        if (isMobile) setMenuAbierto(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100vh', width: '100vw', backgroundColor: '#f8fafc', overflow: 'hidden' }}>

            {/* FONDO OSCURO PARA CERRAR EL MENÚ EN CELULARES */}
            {isMobile && menuAbierto && (
                <div 
                    onClick={() => setMenuAbierto(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(15, 23, 42, 0.65)',
                        zIndex: 1100,
                        backdropFilter: 'blur(4px)'
                    }}
                />
            )}

            {/* BARRA SUPERIOR PARA CELULARES */}
            {isMobile && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 18px',
                    backgroundColor: '#090d16',
                    color: '#ffffff',
                    borderBottom: '1px solid #1e293b',
                    zIndex: 1000,
                    flexShrink: 0
                }}>
                    <button
                        onClick={() => setMenuAbierto(true)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px'
                        }}
                    >
                        <Menu size={24} />
                    </button>
                    <div style={{ background: '#ffffff', padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
                        <img src={logoNativa} alt="NativaTec" style={{ height: '22px', objectFit: 'contain' }} />
                    </div>
                    <div style={{ width: '28px' }}></div>
                </div>
            )}

            {/* TOAST FLOTANTE */}
            {toastMessage && (
                <div className="animate-fade-in" style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    zIndex: 9999,
                    fontSize: '13px',
                    fontWeight: '600'
                }}>
                    <CheckCircle2 size={18} color="#10b981" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* SIDEBAR */}
            <div style={{
                width: isMobile ? '280px' : '270px',
                backgroundColor: '#090d16',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px 16px',
                borderRight: '1px solid #1e293b',
                position: isMobile ? 'fixed' : 'relative',
                top: 0,
                bottom: 0,
                left: isMobile ? (menuAbierto ? 0 : '-300px') : 0,
                zIndex: isMobile ? 1200 : 10,
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isMobile && menuAbierto ? '0 0 35px rgba(0,0,0,0.5)' : 'none',
                boxSizing: 'border-box'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '32px', padding: '4px' }}>
                        <div style={{ background: '#ffffff', padding: '6px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', flex: 1, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                            <img src={logoNativa} alt="NativaTec" style={{ height: '26px', maxWidth: '100%', objectFit: 'contain' }} />
                        </div>
                        {isMobile && (
                            <button
                                onClick={() => setMenuAbierto(false)}
                                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                            >
                                <X size={22} />
                            </button>
                        )}
                    </div>

                    <div style={{ padding: '0 8px 12px 8px', fontSize: '11px', fontWeight: '700', color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Módulo de Administración
                    </div>

                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <button
                            onClick={() => cambiarVista('panel')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                width: '100%',
                                padding: '12px 14px',
                                background: vistaActiva === 'panel' ? 'linear-gradient(90deg, rgba(37, 99, 235, 0.18) 0%, rgba(37, 99, 235, 0.05) 100%)' : 'transparent',
                                color: vistaActiva === 'panel' ? '#60a5fa' : '#94a3b8',
                                border: 'none',
                                borderLeft: vistaActiva === 'panel' ? '3px solid #3b82f6' : '3px solid transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: vistaActiva === 'panel' ? '600' : '500',
                                textAlign: 'left',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <LayoutDashboard size={18} /> <span>Panel Principal</span>
                        </button>
                        <button
                            onClick={() => cambiarVista('usuarios')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                width: '100%',
                                padding: '12px 14px',
                                background: vistaActiva === 'usuarios' ? 'linear-gradient(90deg, rgba(37, 99, 235, 0.18) 0%, rgba(37, 99, 235, 0.05) 100%)' : 'transparent',
                                color: vistaActiva === 'usuarios' ? '#60a5fa' : '#94a3b8',
                                border: 'none',
                                borderLeft: vistaActiva === 'usuarios' ? '3px solid #3b82f6' : '3px solid transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: vistaActiva === 'usuarios' ? '600' : '500',
                                textAlign: 'left',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Users size={18} /> <span>Gestión de Usuarios</span>
                            {usuarios.length > 0 && (
                                <span style={{ marginLeft: 'auto', backgroundColor: vistaActiva === 'usuarios' ? '#2563eb' : '#1e293b', color: '#ffffff', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px' }}>
                                    {usuarios.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => cambiarVista('cuestionarios')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                width: '100%',
                                padding: '12px 14px',
                                background: vistaActiva === 'cuestionarios' ? 'linear-gradient(90deg, rgba(37, 99, 235, 0.18) 0%, rgba(37, 99, 235, 0.05) 100%)' : 'transparent',
                                color: vistaActiva === 'cuestionarios' ? '#60a5fa' : '#94a3b8',
                                border: 'none',
                                borderLeft: vistaActiva === 'cuestionarios' ? '3px solid #3b82f6' : '3px solid transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: vistaActiva === 'cuestionarios' ? '600' : '500',
                                textAlign: 'left',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <FileText size={18} /> <span>Cuestionarios Globales</span>
                            {cuestionarios.length > 0 && (
                                <span style={{ marginLeft: 'auto', backgroundColor: vistaActiva === 'cuestionarios' ? '#2563eb' : '#1e293b', color: '#ffffff', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px' }}>
                                    {cuestionarios.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => cambiarVista('estadisticas')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                width: '100%',
                                padding: '12px 14px',
                                background: vistaActiva === 'estadisticas' ? 'linear-gradient(90deg, rgba(37, 99, 235, 0.18) 0%, rgba(37, 99, 235, 0.05) 100%)' : 'transparent',
                                color: vistaActiva === 'estadisticas' ? '#60a5fa' : '#94a3b8',
                                border: 'none',
                                borderLeft: vistaActiva === 'estadisticas' ? '3px solid #3b82f6' : '3px solid transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: vistaActiva === 'estadisticas' ? '600' : '500',
                                textAlign: 'left',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <BarChart3 size={18} /> <span>Estadísticas y Rendimiento</span>
                        </button>
                        <button
                            onClick={() => cambiarVista('configuracion')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                width: '100%',
                                padding: '12px 14px',
                                background: vistaActiva === 'configuracion' ? 'linear-gradient(90deg, rgba(37, 99, 235, 0.18) 0%, rgba(37, 99, 235, 0.05) 100%)' : 'transparent',
                                color: vistaActiva === 'configuracion' ? '#60a5fa' : '#94a3b8',
                                border: 'none',
                                borderLeft: vistaActiva === 'configuracion' ? '3px solid #3b82f6' : '3px solid transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: vistaActiva === 'configuracion' ? '600' : '500',
                                textAlign: 'left',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Server size={18} /> <span>Estado del Servidor y BD</span>
                        </button>
                    </nav>
                </div>

                {/* Perfil Admin en Sidebar */}
                <div style={{ borderTop: '1px solid #1e293b', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                        <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#fff', width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', flexShrink: '0', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}>
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
            <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '18px 14px' : '30px 40px', boxSizing: 'border-box' }}>

                {/* VISTA: PANEL PRINCIPAL */}
                {vistaActiva === 'panel' && (
                    <>
                        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '12px' : '0', marginBottom: '24px' }}>
                            <div>
                                <h1 style={{ margin: '0 0 4px 0', fontSize: isMobile ? '22px' : '26px', color: '#0f172a' }}>Panel de Administración</h1>
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
                            background: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
                            color: '#ffffff',
                            borderRadius: '18px',
                            padding: isMobile ? '22px 18px' : '28px 32px',
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            justifyContent: 'space-between',
                            alignItems: isMobile ? 'flex-start' : 'center',
                            gap: isMobile ? '18px' : '0',
                            marginBottom: '28px',
                            border: '1px solid #1e293b',
                            boxShadow: '0 12px 30px -10px rgba(15, 23, 42, 0.25)'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Consola de Administración Activa</span>
                                </div>
                                <h2 style={{ margin: '0 0 6px 0', fontSize: isMobile ? '22px' : '26px', fontWeight: '800', letterSpacing: '-0.02em' }}>{userName}</h2>
                                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>
                                    Supervisión institucional de docentes, alumnos, evaluaciones en tiempo real y persistencia PostgreSQL.
                                </span>
                            </div>
                            <button
                                onClick={() => setModalCrearOpen(true)}
                                className="interactive-card"
                                style={{
                                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '12px 22px',
                                    borderRadius: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                                    width: isMobile ? '100%' : 'auto',
                                    justifyContent: isMobile ? 'center' : 'flex-start'
                                }}
                            >
                                <UserPlus size={18} /> Registrar Usuario
                            </button>
                        </div>

                        {/* TARJETAS DE MÉTRICAS GLOBALES */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                            gap: '18px',
                            marginBottom: '32px'
                        }}>
                            {/* Tarjeta 1: Total Usuarios */}
                            <div className="interactive-card" style={{ background: '#ffffff', padding: '22px', borderRadius: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderTop: '4px solid #2563eb', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Total Usuarios</span>
                                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Users size={19} color="#2563eb" />
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '30px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '4px' }}>{usuarios.length}</div>
                                    <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                                        {totalUsuariosActivos} cuentas habilitadas
                                    </div>
                                </div>
                            </div>

                            {/* Tarjeta 2: Docentes y Admins */}
                            <div className="interactive-card" style={{ background: '#ffffff', padding: '22px', borderRadius: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderTop: '4px solid #10b981', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Docentes y Admins</span>
                                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <GraduationCap size={19} color="#059669" />
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '30px', fontWeight: '800', color: '#059669', letterSpacing: '-0.5px', marginBottom: '4px' }}>{totalProfesores + totalAdmins}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{totalProfesores} Profesores · {totalAdmins} Admins</div>
                                </div>
                            </div>

                            {/* Tarjeta 3: Cuestionarios */}
                            <div className="interactive-card" style={{ background: '#ffffff', padding: '22px', borderRadius: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderTop: '4px solid #8b5cf6', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Cuestionarios</span>
                                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FileText size={19} color="#7c3aed" />
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '30px', fontWeight: '800', color: '#7c3aed', letterSpacing: '-0.5px', marginBottom: '4px' }}>{cuestionarios.length}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Evaluaciones académicas globales</div>
                                </div>
                            </div>

                            {/* Tarjeta 4: Promedio Institucional */}
                            <div className="interactive-card" style={{ background: '#ffffff', padding: '22px', borderRadius: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderTop: '4px solid #f59e0b', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Promedio Institucional</span>
                                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Award size={19} color="#d97706" />
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '30px', fontWeight: '800', color: '#d97706', letterSpacing: '-0.5px', marginBottom: '4px' }}>
                                        {estadisticas?.promedioGeneral != null ? `${estadisticas.promedioGeneral.toFixed(1)}` : '—'}
                                        <span style={{ fontSize: '16px', fontWeight: '600', color: '#94a3b8' }}> / 20</span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                                        {estadisticas?.totalRespuestas || 0} entregas analizadas
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FILA DE TABLA RÁPIDA DE USUARIOS Y ACTIVIDAD RECIENTE */}
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr', gap: '24px' }}>
                            {/* USUARIOS RECIENTES */}
                            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 2px 0', fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>Usuarios Registrados</h3>
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>Vista rápida de cuentas recientes</span>
                                    </div>
                                    <button
                                        onClick={() => setVistaActiva('usuarios')}
                                        style={{ background: 'transparent', border: 'none', color: '#2563eb', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        Ver todos ({usuarios.length}) →
                                    </button>
                                </div>

                                <div style={{ overflowX: 'auto' }}>
                                    <table className="saas-table">
                                        <thead>
                                            <tr>
                                                <th>Nombre</th>
                                                <th>Correo</th>
                                                <th>Rol</th>
                                                <th>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {usuarios.slice(0, 5).map(u => (
                                                <tr key={u.id}>
                                                    <td style={{ fontWeight: '700', color: '#0f172a' }}>
                                                        {`${u.nombre || ''} ${u.apellido || ''}`.trim() || '—'}
                                                    </td>
                                                    <td style={{ color: '#64748b' }}>{u.email}</td>
                                                    <td>
                                                        <span className={`badge-pill ${u.rol === 'ADMIN' ? 'badge-amber' : u.rol === 'PROFESOR' ? 'badge-blue' : 'badge-slate'}`}>
                                                            {u.rol}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge-pill ${u.activo ? 'badge-emerald' : 'badge-rose'}`}>
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
                            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 2px 0', fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>Actividad de Evaluaciones</h3>
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>Últimas entregas registradas</span>
                                    </div>
                                    <Activity size={16} color="#64748b" />
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '14px' : '0', marginBottom: '24px' }}>
                            <div>
                                <h1 style={{ margin: '0 0 4px 0', fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>Gestión de Usuarios</h1>
                                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Supervisa, edita roles y administra el acceso de profesores, alumnos y administradores</span>
                            </div>
                            <button
                                onClick={() => setModalCrearOpen(true)}
                                className="interactive-card"
                                style={{
                                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '11px 20px',
                                    borderRadius: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                }}
                            >
                                <UserPlus size={16} /> Nuevo Usuario
                            </button>
                        </div>

                        {/* BARRA DE FILTROS Y BÚSQUEDA */}
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, apellido o correo..."
                                    value={busquedaUsuario}
                                    onChange={(e) => setBusquedaUsuario(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '11px 16px 11px 40px',
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0',
                                        outline: 'none',
                                        fontSize: '13px',
                                        backgroundColor: '#ffffff',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                        boxSizing: 'border-box',
                                        transition: 'all 0.2s ease',
                                        color: '#0f172a'
                                    }}
                                />
                            </div>

                            {/* Filtro por Rol */}
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
                                {['TODOS', 'PROFESOR', 'ADMIN', 'ALUMNO'].map(rol => (
                                    <button
                                        key={rol}
                                        onClick={() => setFiltroRol(rol)}
                                        style={{
                                            padding: '7px 12px',
                                            borderRadius: '9px',
                                            border: 'none',
                                            background: filtroRol === rol ? '#ffffff' : 'transparent',
                                            color: filtroRol === rol ? '#0f172a' : '#64748b',
                                            boxShadow: filtroRol === rol ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                            fontSize: '12px',
                                            fontWeight: filtroRol === rol ? '700' : '500',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        {rol}
                                    </button>
                                ))}
                            </div>

                            {/* Filtro por Estado */}
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
                                {['TODOS', 'ACTIVOS', 'INACTIVOS'].map(st => (
                                    <button
                                        key={st}
                                        onClick={() => setFiltroEstado(st)}
                                        style={{
                                            padding: '7px 12px',
                                            borderRadius: '9px',
                                            border: 'none',
                                            background: filtroEstado === st ? '#2563eb' : 'transparent',
                                            color: filtroEstado === st ? '#ffffff' : '#64748b',
                                            boxShadow: filtroEstado === st ? '0 2px 6px rgba(37, 99, 235, 0.3)' : 'none',
                                            fontSize: '12px',
                                            fontWeight: filtroEstado === st ? '700' : '500',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        {st}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* TABLA DE USUARIOS COMPLETA */}
                        <div style={{ background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="saas-table">
                                    <thead>
                                        <tr>
                                            <th>Nombre y Apellido</th>
                                            <th>Correo Electrónico</th>
                                            <th>Rol Asignado</th>
                                            <th>Estado</th>
                                            <th style={{ textAlign: 'center' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingUsuarios ? (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                                    Cargando usuarios desde PostgreSQL...
                                                </td>
                                            </tr>
                                        ) : usuariosFiltrados.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                                    No se encontraron usuarios con los criterios de búsqueda seleccionados.
                                                </td>
                                            </tr>
                                        ) : (
                                            usuariosFiltrados.map(u => (
                                                <tr key={u.id}>
                                                    <td style={{ fontWeight: '700', color: '#0f172a' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <div style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                borderRadius: '8px',
                                                                backgroundColor: u.rol === 'ADMIN' ? '#fef3c7' : u.rol === 'PROFESOR' ? '#eff6ff' : '#f1f5f9',
                                                                color: u.rol === 'ADMIN' ? '#b45309' : u.rol === 'PROFESOR' ? '#1d4ed8' : '#475569',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '11px',
                                                                fontWeight: '800'
                                                            }}>
                                                                {((u.nombre ? u.nombre[0] : '') + (u.apellido ? u.apellido[0] : '') || 'US').toUpperCase()}
                                                            </div>
                                                            <span>{`${u.nombre || ''} ${u.apellido || ''}`.trim() || '—'}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ color: '#64748b' }}>
                                                        {u.email}
                                                    </td>
                                                    <td>
                                                        <span className={`badge-pill ${u.rol === 'ADMIN' ? 'badge-amber' : u.rol === 'PROFESOR' ? 'badge-blue' : 'badge-slate'}`}>
                                                            {u.rol}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            onClick={() => handleToggleActivo(u)}
                                                            title="Clic para cambiar estado"
                                                            className={`badge-pill ${u.activo ? 'badge-emerald' : 'badge-rose'}`}
                                                            style={{ cursor: 'pointer', border: 'none' }}
                                                        >
                                                            {u.activo ? '● Activo' : '○ Inactivo'}
                                                        </button>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                                                            <button
                                                                onClick={() => handleAbrirEditar(u)}
                                                                style={{
                                                                    background: '#eff6ff',
                                                                    border: '1px solid #bfdbfe',
                                                                    color: '#1d4ed8',
                                                                    cursor: 'pointer',
                                                                    padding: '6px 10px',
                                                                    borderRadius: '8px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    fontSize: '12px',
                                                                    fontWeight: '600',
                                                                    transition: 'all 0.15s ease'
                                                                }}
                                                                title="Editar usuario"
                                                            >
                                                                <Edit2 size={13} /> Editar
                                                            </button>
                                                            <button
                                                                onClick={() => handleEliminarUsuario(u.id, `${u.nombre || ''} ${u.apellido || ''}`.trim())}
                                                                style={{
                                                                    background: '#fff1f2',
                                                                    border: '1px solid #fecdd3',
                                                                    color: '#e11d48',
                                                                    cursor: 'pointer',
                                                                    padding: '6px 8px',
                                                                    borderRadius: '8px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    fontSize: '12px',
                                                                    transition: 'all 0.15s ease'
                                                                }}
                                                                title="Eliminar usuario"
                                                            >
                                                                <Trash2 size={13} />
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '12px' : '0', marginBottom: '24px' }}>
                            <div>
                                <h1 style={{ margin: '0 0 4px 0', fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>Cuestionarios Globales</h1>
                                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Supervisión y auditoría de todas las evaluaciones académicas registradas en el sistema</span>
                            </div>
                            <button
                                onClick={() => { cargarCuestionarios(); showToast('Cuestionarios actualizados.'); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 16px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#475569',
                                    cursor: 'pointer',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                <RefreshCw size={14} /> Refrescar
                            </button>
                        </div>

                        {/* Buscador de cuestionarios */}
                        <div style={{ marginBottom: '22px', position: 'relative', maxWidth: '420px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder="Buscar por título, materia o código..."
                                value={busquedaCuestionario}
                                onChange={(e) => setBusquedaCuestionario(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '11px 16px 11px 40px',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    outline: 'none',
                                    fontSize: '13px',
                                    backgroundColor: '#ffffff',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                    boxSizing: 'border-box',
                                    color: '#0f172a',
                                    transition: 'all 0.2s ease'
                                }}
                            />
                        </div>

                        {loadingCuestionarios ? (
                            <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>Cargando cuestionarios...</div>
                        ) : cuestionariosFiltrados.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '50px 20px', background: '#ffffff', borderRadius: '18px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                                No se encontraron cuestionarios registrados.
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                                {cuestionariosFiltrados.map(c => (
                                    <div key={c.id} className="interactive-card" style={{ background: '#ffffff', borderRadius: '18px', padding: '24px', border: '1px solid #e2e8f0', borderTop: '4px solid #2563eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <span className="badge-pill badge-blue">
                                                        {c.preguntas ? `${c.preguntas.length} Preguntas` : 'Evaluación'}
                                                    </span>
                                                    {c.tiempoLimiteMinutos > 0 && (
                                                        <span className="badge-pill badge-amber">
                                                            <Clock size={11} /> {c.tiempoLimiteMinutos}m
                                                        </span>
                                                    )}
                                                    {c.modoSeguro && (
                                                        <span className="badge-pill badge-rose">
                                                            <ShieldAlert size={11} /> Seguro
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
                                                        border: '1px solid #e2e8f0',
                                                        padding: '4px 10px',
                                                        borderRadius: '8px',
                                                        fontSize: '11px',
                                                        fontWeight: '800',
                                                        color: '#0f172a',
                                                        cursor: 'pointer',
                                                        letterSpacing: '0.05em'
                                                    }}
                                                >
                                                    <Copy size={12} /> {c.codigoAcceso || 'SIN CÓDIGO'}
                                                </button>
                                            </div>

                                            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.01em' }}>{c.titulo}</h3>
                                            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0', minHeight: '38px', lineHeight: '1.5' }}>
                                                {c.descripcion || 'Sin descripción adicional para esta evaluación.'}
                                            </p>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9', fontSize: '12px', color: '#475569', marginBottom: '18px' }}>
                                                <div>
                                                    <span style={{ color: '#94a3b8', display: 'block', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>DOCENTE</span>
                                                    <strong style={{ color: '#0f172a' }}>{c.creadoPor ? `${c.creadoPor.nombre || ''} ${c.creadoPor.apellido || ''}`.trim() : 'Sistema'}</strong>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{ color: '#94a3b8', display: 'block', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>RESPUESTAS</span>
                                                    <strong style={{ color: '#0f172a' }}>{c.totalRespuestas || 0} entregas</strong>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                                            <button
                                                onClick={() => {
                                                    setCuestionarioAuditoria(c);
                                                    setModalAuditoriaOpen(true);
                                                }}
                                                className="interactive-card"
                                                style={{
                                                    flex: 1,
                                                    padding: '10px 14px',
                                                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                                    color: '#ffffff',
                                                    border: 'none',
                                                    borderRadius: '10px',
                                                    fontSize: '12px',
                                                    fontWeight: '700',
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
                                                    padding: '10px 12px',
                                                    background: '#fff1f2',
                                                    color: '#e11d48',
                                                    border: '1px solid #fecdd3',
                                                    borderRadius: '10px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.15s ease'
                                                }}
                                                title="Eliminar cuestionario permanentemente"
                                            >
                                                <Trash2 size={15} />
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
                            <h1 style={{ margin: '0 0 4px 0', fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>Estado del Servidor y Base de Datos</h1>
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Diagnóstico de infraestructura, conexión a PostgreSQL y seguridad JWT</span>
                        </div>

                        {/* DIAGNÓSTICO EN TIEMPO REAL */}
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
                            <div className="interactive-card" style={{ background: '#ffffff', padding: '24px', borderRadius: '18px', border: '1px solid #e2e8f0', borderTop: '4px solid #2563eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Database size={20} color="#2563eb" />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Base de Datos PostgreSQL</h3>
                                </div>
                                <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.7' }}>
                                    <div><strong>Estado:</strong> <span style={{ color: '#059669', fontWeight: '700' }}>● En línea (Conectado)</span></div>
                                    <div><strong>Host:</strong> localhost:5432</div>
                                    <div><strong>Base:</strong> <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '6px' }}>sis_cuestionarios</code></div>
                                    <div><strong>Pool:</strong> HikariCP Concurrente</div>
                                </div>
                            </div>

                            <div className="interactive-card" style={{ background: '#ffffff', padding: '24px', borderRadius: '18px', border: '1px solid #e2e8f0', borderTop: '4px solid #10b981', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Server size={20} color="#059669" />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Backend Spring Boot</h3>
                                </div>
                                <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.7' }}>
                                    <div><strong>Versión:</strong> Java JDK 17 (Spring Boot 3.x)</div>
                                    <div><strong>Puerto:</strong> 8080 (REST API)</div>
                                    <div><strong>CORS:</strong> http://localhost:5173</div>
                                    <div><strong>Persistencia:</strong> Spring Data JPA / Hibernate</div>
                                </div>
                            </div>

                            <div className="interactive-card" style={{ background: '#ffffff', padding: '24px', borderRadius: '18px', border: '1px solid #e2e8f0', borderTop: '4px solid #f59e0b', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Shield size={20} color="#d97706" />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Seguridad y Cifrado</h3>
                                </div>
                                <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.7' }}>
                                    <div><strong>Autenticación:</strong> Stateless JWT Tokens</div>
                                    <div><strong>Algoritmo:</strong> HMAC-SHA384</div>
                                    <div><strong>Encriptación Passwords:</strong> BCrypt ($2a$)</div>
                                    <div><strong>Roles:</strong> ADMIN, PROFESOR, ALUMNO</div>
                                </div>
                            </div>
                        </div>

                        {/* RESUMEN DE PRUEBAS DE CARGA */}
                        <div style={{ background: '#ffffff', padding: '26px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Simulación de Pruebas de Carga y Concurrencia</h3>
                            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
                                Puedes ejecutar pruebas de estrés y concurrencia simulando envíos simultáneos de cuestionarios mediante el script de carga:
                            </p>
                            <pre style={{ background: '#090d16', color: '#38bdf8', padding: '16px', borderRadius: '12px', fontSize: '13px', overflowX: 'auto', border: '1px solid #1e293b' }}>
node backend/scripts/load_test_concurrency.js 50 148177
                            </pre>
                        </div>
                    </div>
                )}

                {/* VISTA: ESTADÍSTICAS Y RENDIMIENTO */}
                {vistaActiva === 'estadisticas' && (
                    <EstadisticasView />
                )}
            </div>

            {/* MODAL CREAR NUEVO USUARIO */}
            {modalCrearOpen && (
                <div 
                    onClick={() => setModalCrearOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(15, 23, 42, 0.65)',
                        backdropFilter: 'blur(6px)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1300,
                        padding: '20px',
                        boxSizing: 'border-box'
                    }}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="animate-scale-up"
                        style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '20px',
                            width: '100%',
                            maxWidth: '480px',
                            padding: '32px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            border: '1px solid #e2e8f0'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                            <div>
                                <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Registrar Nuevo Usuario</h2>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>Crea una cuenta para docentes, administradores o alumnos</span>
                            </div>
                            <button
                                onClick={() => setModalCrearOpen(false)}
                                style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: '6px', borderRadius: '8px' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {errorModal && (
                            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px', border: '1px solid #fca5a5' }}>
                                {errorModal}
                            </div>
                        )}

                        <form onSubmit={handleCrearUsuario} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Nombre *</label>
                                    <input
                                        type="text"
                                        value={nuevoNombre}
                                        onChange={(e) => setNuevoNombre(e.target.value)}
                                        placeholder="Ej: Sofía"
                                        required
                                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Apellido *</label>
                                    <input
                                        type="text"
                                        value={nuevoApellido}
                                        onChange={(e) => setNuevoApellido(e.target.value)}
                                        placeholder="Ej: Pérez"
                                        required
                                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Correo Electrónico *</label>
                                <input
                                    type="email"
                                    value={nuevoEmail}
                                    onChange={(e) => setNuevoEmail(e.target.value)}
                                    placeholder="usuario@nativatec.edu"
                                    required
                                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Rol Asignado</label>
                                <select
                                    value={nuevoRol}
                                    onChange={(e) => setNuevoRol(e.target.value)}
                                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff', boxSizing: 'border-box', outline: 'none' }}
                                >
                                    <option value="PROFESOR">Profesor</option>
                                    <option value="ADMIN">Administrador</option>
                                    <option value="ALUMNO">Alumno</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Contraseña Temporal *</label>
                                <input
                                    type="password"
                                    value={nuevoPassword}
                                    onChange={(e) => setNuevoPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setModalCrearOpen(false)}
                                    style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardandoUsuario}
                                    className="interactive-card"
                                    style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#ffffff', fontWeight: '700', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
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
                <div 
                    onClick={() => setModalEditarOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(15, 23, 42, 0.65)',
                        backdropFilter: 'blur(6px)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1300,
                        padding: '20px',
                        boxSizing: 'border-box'
                    }}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="animate-scale-up"
                        style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '20px',
                            width: '100%',
                            maxWidth: '480px',
                            padding: '32px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            border: '1px solid #e2e8f0'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                            <div>
                                <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Editar Usuario</h2>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>Actualiza datos, rol y estado de la cuenta</span>
                            </div>
                            <button
                                onClick={() => setModalEditarOpen(false)}
                                style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: '6px', borderRadius: '8px' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {errorModalEditar && (
                            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px', border: '1px solid #fca5a5' }}>
                                {errorModalEditar}
                            </div>
                        )}

                        <form onSubmit={handleGuardarEdicion} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Nombre *</label>
                                    <input
                                        type="text"
                                        value={editNombre}
                                        onChange={(e) => setEditNombre(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Apellido *</label>
                                    <input
                                        type="text"
                                        value={editApellido}
                                        onChange={(e) => setEditApellido(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Correo Electrónico *</label>
                                <input
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Rol Asignado</label>
                                    <select
                                        value={editRol}
                                        onChange={(e) => setEditRol(e.target.value)}
                                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff', boxSizing: 'border-box', outline: 'none' }}
                                    >
                                        <option value="PROFESOR">Profesor</option>
                                        <option value="ADMIN">Administrador</option>
                                        <option value="ALUMNO">Alumno</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Estado de la Cuenta</label>
                                    <select
                                        value={editActivo ? 'true' : 'false'}
                                        onChange={(e) => setEditActivo(e.target.value === 'true')}
                                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff', boxSizing: 'border-box', outline: 'none' }}
                                    >
                                        <option value="true">Activo</option>
                                        <option value="false">Inactivo</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Reestablecer Contraseña (Opcional)</label>
                                <input
                                    type="password"
                                    value={editPassword}
                                    onChange={(e) => setEditPassword(e.target.value)}
                                    placeholder="Dejar vacío para mantener la contraseña actual"
                                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setModalEditarOpen(false)}
                                    style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardandoEdicion}
                                    className="interactive-card"
                                    style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#ffffff', fontWeight: '700', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
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
