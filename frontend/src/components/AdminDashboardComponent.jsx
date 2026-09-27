import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/authService';
import { obtenerUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from '../services/usuarioService';
import { obtenerCuestionarios } from '../services/cuestionarioService';
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
    Shield, 
    GraduationCap, 
    Award, 
    X, 
    Check, 
    CheckCircle2, 
    XCircle 
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
    const [loadingUsuarios, setLoadingUsuarios] = useState(false);
    const [busquedaUsuario, setBusquedaUsuario] = useState('');
    const [filtroRol, setFiltroRol] = useState('TODOS');

    // Modal nuevo usuario
    const [modalCrearOpen, setModalCrearOpen] = useState(false);
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [nuevoApellido, setNuevoApellido] = useState('');
    const [nuevoEmail, setNuevoEmail] = useState('');
    const [nuevoPassword, setNuevoPassword] = useState('');
    const [nuevoRol, setNuevoRol] = useState('PROFESOR');
    const [errorModal, setErrorModal] = useState('');
    const [guardandoUsuario, setGuardandoUsuario] = useState(false);

    // Cargar datos
    const cargarUsuarios = () => {
        setLoadingUsuarios(true);
        obtenerUsuarios()
            .then(data => setUsuarios(data))
            .catch(err => console.error("Error al cargar usuarios:", err))
            .finally(() => setLoadingUsuarios(false));
    };

    const cargarCuestionarios = () => {
        obtenerCuestionarios()
            .then(data => setCuestionarios(data))
            .catch(err => console.error("Error al cargar cuestionarios:", err));
    };

    useEffect(() => {
        cargarUsuarios();
        cargarCuestionarios();
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
            cargarUsuarios();
        } catch (err) {
            console.error("Error al actualizar estado del usuario:", err);
            alert("No se pudo cambiar el estado del usuario.");
        }
    };

    // Cambiar rol de un usuario
    const handleCambiarRol = async (usuario, nuevoRol) => {
        try {
            await actualizarUsuario(usuario.id, {
                ...usuario,
                rol: nuevoRol
            });
            cargarUsuarios();
        } catch (err) {
            console.error("Error al cambiar rol:", err);
            alert("No se pudo actualizar el rol del usuario.");
        }
    };

    // Eliminar usuario
    const handleEliminarUsuario = async (id, nombre) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar al usuario "${nombre}"?`)) {
            try {
                await eliminarUsuario(id);
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
            setErrorModal('Todos los campos son obligatorios.');
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
            cargarUsuarios();
        } catch (err) {
            console.error("Error al crear usuario:", err);
            setErrorModal('No se pudo crear el usuario. Comprueba si el correo ya existe.');
        } finally {
            setGuardandoUsuario(false);
        }
    };

    // Filtrar usuarios
    const usuariosFiltrados = usuarios.filter(u => {
        const matchesQuery =
            (u.nombre && u.nombre.toLowerCase().includes(busquedaUsuario.toLowerCase())) ||
            (u.apellido && u.apellido.toLowerCase().includes(busquedaUsuario.toLowerCase())) ||
            (u.email && u.email.toLowerCase().includes(busquedaUsuario.toLowerCase()));

        const matchesRole = filtroRol === 'TODOS' || u.rol === filtroRol;

        return matchesQuery && matchesRole;
    });

    const totalProfesores = usuarios.filter(u => u.rol === 'PROFESOR').length;
    const totalAdmins = usuarios.filter(u => u.rol === 'ADMIN').length;
    const totalAlumnos = usuarios.filter(u => u.rol === 'ALUMNO').length;

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#f8fafc', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', overflow: 'hidden' }}>

            {/* SIDEBAR */}
            <div style={{ width: '270px', backgroundColor: '#090d16', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 16px', borderRight: '1px solid #1e293b' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', padding: '4px' }}>
                        <div style={{ background: '#ffffff', padding: '5px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', flex: 1 }}>
                            <img src={logoNativa} alt="NativaTec" style={{ height: '24px', maxWidth: '100%', objectFit: 'contain' }} />
                        </div>
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
                            <Settings size={18} /> Configuración
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
                        <div style={{ marginBottom: '24px' }}>
                            <h1 style={{ margin: '0 0 4px 0', fontSize: '26px', color: '#0f172a' }}>Panel de Administración</h1>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>Supervisión general del sistema y métricas globales</span>
                        </div>

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
                                <span style={{ fontSize: '14px', color: '#94a3b8' }}>Bienvenido al centro de control,</span>
                                <h2 style={{ margin: '4px 0 8px 0', fontSize: '24px' }}>{userName}</h2>
                                <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                                    Gestiona usuarios, roles y supervisa todos los cuestionarios institucionales.
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
                                    gap: '8px'
                                }}
                            >
                                <UserPlus size={18} /> Registrar Usuario
                            </button>
                        </div>

                        {/* TARJETAS DE MÉTRICAS GLOBALES */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                            <div style={{ background: '#fff', padding: '22px', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>TOTAL USUARIOS</span>
                                    <Users size={18} color="#2563eb" />
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>{usuarios.length}</div>
                                <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>Cuentas registradas</div>
                            </div>

                            <div style={{ background: '#fff', padding: '22px', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>PROFESORES</span>
                                    <GraduationCap size={18} color="#16a34a" />
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a' }}>{totalProfesores}</div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Con acceso a creación</div>
                            </div>

                            <div style={{ background: '#fff', padding: '22px', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>ADMINISTRADORES</span>
                                    <Shield size={18} color="#d97706" />
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#d97706' }}>{totalAdmins}</div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Con acceso total</div>
                            </div>

                            <div style={{ background: '#fff', padding: '22px', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>CUESTIONARIOS</span>
                                    <FileText size={18} color="#7c3aed" />
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#7c3aed' }}>{cuestionarios.length}</div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Creados en el sistema</div>
                            </div>
                        </div>

                        {/* ACCESO RÁPIDO A GESTIÓN DE USUARIOS */}
                        <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Usuarios Registrados Recientemente</h3>
                                <button
                                    onClick={() => setVistaActiva('usuarios')}
                                    style={{ background: 'transparent', border: 'none', color: '#2563eb', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                                >
                                    Ver todos los usuarios →
                                </button>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                                            <th style={{ padding: '12px' }}>NOMBRE</th>
                                            <th style={{ padding: '12px' }}>APELLIDO</th>
                                            <th style={{ padding: '12px' }}>CORREO</th>
                                            <th style={{ padding: '12px' }}>ROL</th>
                                            <th style={{ padding: '12px' }}>ESTADO</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuarios.slice(0, 5).map(u => (
                                            <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '12px', fontWeight: '600', color: '#0f172a' }}>{u.nombre || '—'}</td>
                                                <td style={{ padding: '12px', color: '#334155' }}>{u.apellido || '—'}</td>
                                                <td style={{ padding: '12px', color: '#64748b' }}>{u.email}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        background: u.rol === 'ADMIN' ? '#fef3c7' : u.rol === 'PROFESOR' ? '#eff6ff' : '#f1f5f9',
                                                        color: u.rol === 'ADMIN' ? '#b45309' : u.rol === 'PROFESOR' ? '#1d4ed8' : '#475569'
                                                    }}>
                                                        {u.rol}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: '4px 8px',
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
                    </>
                )}

                {/* VISTA: GESTIÓN DE USUARIOS */}
                {vistaActiva === 'usuarios' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', color: '#0f172a' }}>Gestión de Usuarios</h1>
                                <span style={{ fontSize: '13px', color: '#64748b' }}>Supervisa, edita roles y administra el acceso de profesores y administradores</span>
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
                                    gap: '8px'
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

                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {['TODOS', 'PROFESOR', 'ADMIN', 'ALUMNO'].map(rol => (
                                    <button
                                        key={rol}
                                        onClick={() => setFiltroRol(rol)}
                                        style={{
                                            padding: '8px 14px',
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
                        </div>

                        {/* TABLA DE USUARIOS COMPLETA */}
                        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                                            <th style={{ padding: '14px 16px' }}>NOMBRE</th>
                                            <th style={{ padding: '14px 16px' }}>APELLIDO</th>
                                            <th style={{ padding: '14px 16px' }}>CORREO ELECTRÓNICO</th>
                                            <th style={{ padding: '14px 16px' }}>ROL</th>
                                            <th style={{ padding: '14px 16px' }}>ESTADO</th>
                                            <th style={{ padding: '14px 16px', textAlign: 'center' }}>ACCIONES</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingUsuarios ? (
                                            <tr>
                                                <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                                                    Cargando usuarios...
                                                </td>
                                            </tr>
                                        ) : usuariosFiltrados.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                                                    No se encontraron usuarios con los criterios de búsqueda.
                                                </td>
                                            </tr>
                                        ) : (
                                            usuariosFiltrados.map(u => (
                                                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>
                                                        {u.nombre || '—'}
                                                    </td>
                                                    <td style={{ padding: '14px 16px', color: '#334155', fontWeight: '500' }}>
                                                        {u.apellido || '—'}
                                                    </td>
                                                    <td style={{ padding: '14px 16px', color: '#64748b' }}>
                                                        {u.email}
                                                    </td>
                                                    <td style={{ padding: '14px 16px' }}>
                                                        <select
                                                            value={u.rol}
                                                            onChange={(e) => handleCambiarRol(u, e.target.value)}
                                                            style={{
                                                                padding: '6px 10px',
                                                                borderRadius: '6px',
                                                                border: '1px solid #cbd5e1',
                                                                fontSize: '12px',
                                                                fontWeight: '600',
                                                                background: u.rol === 'ADMIN' ? '#fef3c7' : u.rol === 'PROFESOR' ? '#eff6ff' : '#f8fafc',
                                                                color: u.rol === 'ADMIN' ? '#b45309' : u.rol === 'PROFESOR' ? '#1d4ed8' : '#475569',
                                                                cursor: 'pointer',
                                                                outline: 'none'
                                                            }}
                                                        >
                                                            <option value="PROFESOR">PROFESOR</option>
                                                            <option value="ADMIN">ADMIN</option>
                                                            <option value="ALUMNO">ALUMNO</option>
                                                        </select>
                                                    </td>
                                                    <td style={{ padding: '14px 16px' }}>
                                                        <button
                                                            onClick={() => handleToggleActivo(u)}
                                                            style={{
                                                                border: 'none',
                                                                padding: '6px 12px',
                                                                borderRadius: '6px',
                                                                fontSize: '12px',
                                                                fontWeight: '600',
                                                                cursor: 'pointer',
                                                                background: u.activo ? '#dcfce7' : '#fee2e2',
                                                                color: u.activo ? '#15803d' : '#b91c1c'
                                                            }}
                                                        >
                                                            {u.activo ? 'Activo' : 'Inactivo'}
                                                        </button>
                                                    </td>
                                                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                                        <button
                                                            onClick={() => handleEliminarUsuario(u.id, `${u.nombre || ''} ${u.apellido || ''}`.trim())}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: '#dc2626',
                                                                cursor: 'pointer',
                                                                fontSize: '14px',
                                                                padding: '6px',
                                                                borderRadius: '6px',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                            title="Eliminar usuario"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
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
                        <div style={{ marginBottom: '24px' }}>
                            <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', color: '#0f172a' }}>Cuestionarios en el Sistema</h1>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>Supervisión de todas las evaluaciones académicas registradas</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                            {cuestionarios.map(c => (
                                <div key={c.id} style={{ background: '#fff', borderRadius: '14px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                                            Evaluación
                                        </span>
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                                            {c.preguntas ? `${c.preguntas.length} preguntas` : 'Activo'}
                                        </span>
                                    </div>
                                    <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#0f172a' }}>{c.titulo}</h3>
                                    <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>{c.descripcion || 'Sin descripción.'}</p>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                        Código / ID: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{c.id}</code>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* VISTA: CONFIGURACIÓN */}
                {vistaActiva === 'configuracion' && (
                    <div style={{ background: '#fff', padding: '30px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                        <h2 style={{ marginTop: 0, color: '#0f172a' }}>Configuración del Sistema</h2>
                        <p style={{ color: '#64748b', fontSize: '14px' }}>
                            Parámetros del servidor, conexión a base de datos institucional PostgreSQL y políticas de seguridad JWT activas.
                        </p>
                    </div>
                )}
            </div>

            {/* MODAL CREAR NUEVO USUARIO (ADMIN) */}
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
        </div>
    );
}
