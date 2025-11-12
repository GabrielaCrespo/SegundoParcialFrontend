import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Users, 
  Shield, 
  Key, 
  GraduationCap, 
  UserCheck,
  Menu,
  X,
  Home,
  BookOpen,
  Building,
  Clock,
  MapPin,
  School,
  Calendar,
  FileText
} from 'lucide-react';
import ApiService from '../services/ApiService';
import UsersManagement from './crud/UsersManagement';
import RolesManagement from './crud/RolesManagement';
import PermissionsManagement from './crud/PermissionsManagement';
import DocentesManagement from './crud/DocentesManagement';
import CoordinadoresManagement from './crud/CoordinadoresManagement';
import MateriasManagement from './crud/MateriasManagement';
import AulasManagement from './crud/AulasManagement';
import HorariosManagement from './crud/HorariosManagement';
import CarrerasManagement from './crud/CarrerasManagement';
import FacultadesManagement from './crud/FacultadesManagement';
import GestionesManagement from './crud/GestionesManagement';
import BitacoraManagement from './crud/BitacoraManagement';

import '../styles/Dashboard.css';
import '../styles/CRUD.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();
  
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);
  
  const handleLogout = async () => {
    try {
      await ApiService.logout();
    } catch (error) {
      console.log('Error en logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };
  
  const menuItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'roles', label: 'Roles', icon: Shield },
    { id: 'permissions', label: 'Permisos', icon: Key },
    { id: 'docentes', label: 'Docentes', icon: GraduationCap },
    { id: 'coordinadores', label: 'Coordinadores', icon: UserCheck },
    { id: 'materias', label: 'Materias', icon: BookOpen },
    { id: 'aulas', label: 'Aulas', icon: Building },
    { id: 'horarios', label: 'Horarios', icon: Clock },
    { id: 'carreras', label: 'Carreras', icon: School },
    { id: 'facultades', label: 'Facultades', icon: MapPin },
    { id: 'gestiones', label: 'Gestiones', icon: Calendar },
    { id: 'bitacora', label: 'Bitácora', icon: FileText },
    
  ];
  
  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return (
          <div className="dashboard-grid">
            <div className="dashboard-card" onClick={() => setActiveSection('users')}>
              <div className="card-content">
                <div className="card-icon blue">
                  <Users size={24} />
                </div>
                <div className="card-info">
                  <h3>Usuarios</h3>
                  <p>Gestionar usuarios del sistema</p>
                </div>
              </div>
            </div>
            
            <div className="dashboard-card" onClick={() => setActiveSection('roles')}>
              <div className="card-content">
                <div className="card-icon green">
                  <Shield size={24} />
                </div>
                <div className="card-info">
                  <h3>Roles</h3>
                  <p>Administrar roles y accesos</p>
                </div>
              </div>
            </div>
            
            <div className="dashboard-card" onClick={() => setActiveSection('permissions')}>
              <div className="card-content">
                <div className="card-icon purple">
                  <Key size={24} />
                </div>
                <div className="card-info">
                  <h3>Permisos</h3>
                  <p>Control de permisos</p>
                </div>
              </div>
            </div>
            
            <div className="dashboard-card" onClick={() => setActiveSection('docentes')}>
              <div className="card-content">
                <div className="card-icon yellow">
                  <GraduationCap size={24} />
                </div>
                <div className="card-info">
                  <h3>Docentes</h3>
                  <p>Gestión de docentes</p>
                </div>
              </div>
            </div>
            
            <div className="dashboard-card" onClick={() => setActiveSection('coordinadores')}>
              <div className="card-content">
                <div className="card-icon red">
                  <UserCheck size={24} />
                </div>
                <div className="card-info">
                  <h3>Coordinadores</h3>
                  <p>Administrar coordinadores</p>
                </div>
              </div>
            </div>

            <div className="dashboard-card" onClick={() => setActiveSection('materias')}>
              <div className="card-content">
                <div className="card-icon orange">
                  <BookOpen size={24} />
                </div>
                <div className="card-info">
                  <h3>Materias</h3>
                  <p>Gestión de materias académicas</p>
                </div>
              </div>
            </div>

            <div className="dashboard-card" onClick={() => setActiveSection('aulas')}>
              <div className="card-content">
                <div className="card-icon teal">
                  <Building size={24} />
                </div>
                <div className="card-info">
                  <h3>Aulas</h3>
                  <p>Administrar aulas y espacios</p>
                </div>
              </div>
            </div>

            <div className="dashboard-card" onClick={() => setActiveSection('horarios')}>
              <div className="card-content">
                <div className="card-icon pink">
                  <Clock size={24} />
                </div>
                <div className="card-info">
                  <h3>Horarios</h3>
                  <p>Configurar horarios académicos</p>
                </div>
              </div>
            </div>

            <div className="dashboard-card" onClick={() => setActiveSection('carreras')}>
              <div className="card-content">
                <div className="card-icon indigo">
                  <School size={24} />
                </div>
                <div className="card-info">
                  <h3>Carreras</h3>
                  <p>Gestión de carreras universitarias</p>
                </div>
              </div>
            </div>

            <div className="dashboard-card" onClick={() => setActiveSection('facultades')}>
              <div className="card-content">
                <div className="card-icon cyan">
                  <MapPin size={24} />
                </div>
                <div className="card-info">
                  <h3>Facultades</h3>
                  <p>Administrar facultades</p>
                </div>
              </div>
            </div>


            <div className="dashboard-card" onClick={() => setActiveSection('gestiones')}>
              <div className="card-content">
                <div className="card-icon emerald">
                  <Calendar size={24} />
                </div>
                <div className="card-info">
                  <h3>Gestiones</h3>
                  <p>Períodos académicos</p>
                </div>
              </div>
            </div>


             <div className="dashboard-card" onClick={() => setActiveSection('bitacora')}>
              <div className="card-content">
                <div className="card-icon cyan">
                  <MapPin size={24} />
                </div>
                <div className="card-info">
                  <h3>Bitacora</h3>
                  <p>Administrar Bitacora</p>
                </div>
              </div>
            </div>

            
          </div>

            

        );
      case 'users':
        return <UsersManagement />;
      case 'roles':
        return <RolesManagement />;
      case 'permissions':
        return <PermissionsManagement />;
      case 'docentes':
        return <DocentesManagement />;
      case 'coordinadores':
        return <CoordinadoresManagement />;
      case 'materias':
        return <MateriasManagement />;
      case 'aulas':
        return <AulasManagement />;
      case 'horarios':
        return <HorariosManagement />;
      case 'carreras':
        return <CarrerasManagement />;
      case 'facultades':
        return <FacultadesManagement />;
      case 'gestiones':
        return <GestionesManagement />;
      case 'bitacora':
        return <BitacoraManagement />;
      default:
        return (
          <div className="content-section">
            <h2>{menuItems.find(item => item.id === activeSection)?.label}</h2>
            <p>Funcionalidad en desarrollo...</p>
          </div>
        );
    }
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1>Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="close-btn desktop-hidden"
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setSidebarOpen(false);
              }}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <button
            onClick={() => setSidebarOpen(true)}
            className="menu-btn mobile-only"
          >
            <Menu size={24} />
          </button>
          
          <div className="header-right">
            <span className="welcome-text">
              Bienvenido, {user?.nombre || 'Usuario'}
            </span>
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={20} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </header>
        
        {/* Content */}
        <main className="content">
          {renderContent()}
        </main>
      </div>
      
      {/* Overlay */}
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
}

export default Dashboard;