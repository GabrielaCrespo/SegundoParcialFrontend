import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Search } from 'lucide-react';
import ApiService from '../../services/ApiService';

function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    celular: '',
    username: '',
    email: '',
    password: '',
    idrol: ''
  });
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getUsers();
      if (response.success) {
        const rows = response.data || [];
        const normalized = rows.map(r => ({
          ...r,
          activo: (r.activo === true || r.activo === 't' || r.activo === 1),
        }));
        setUsers(normalized);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };


  const loadRoles = async () => {
    try {
      const response = await ApiService.getRoles();
      if (response.success) {
        setRoles(response.data);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await ApiService.updateUser(editingUser.idusuario, formData);
      } else {
        await ApiService.createUser(formData);
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ nombre: '', celular: '', username: '', email: '', password: '', idrol: '' });
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre,
      celular: user.celular || '',
      username: user.username,
      email: user.email,
      password: '',
      idrol: user.idrol
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await ApiService.deleteUser(id);
        loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleToggle = async (idusuario) => {
    try {
      setTogglingId(idusuario);
      await ApiService.toggleUser(idusuario);   // PATCH /usuarios/:id/toggle-status
      await loadUsers();                        // refresca la tabla
    } catch (e) {
      alert(e?.message || 'No se pudo cambiar el estado');
    } finally {
      setTogglingId(null);
    }
  };


  const filteredUsers = users.filter(user =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="content-section">
      <div className="section-header">
        <div className="header-title">
          <Users size={24} />
          <h2>Gestión de Usuarios</h2>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <Plus size={20} />
          Nuevo Usuario
        </button>
      </div>

      <div className="section-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="data-table">
        {loading ? (
          <div className="loading">Cargando usuarios...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Username</th>
                <th>Celular</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.idusuario}>
                  <td>{user.idusuario}</td>
                  <td>{user.nombre}</td>
                  <td>{user.username}</td>
                  <td>{user.celular}</td>
                  <td>{user.email}</td>
                  <td>{user.rol_nombre}</td>
                  <td>
                    <span className={`status ${user.activo ? 'active' : 'inactive'}`}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                     {/* Botón Activar / Desactivar estilizado */}
                    <button
                      onClick={() => handleToggle(user.idusuario)}
                      disabled={togglingId === user.idusuario}
                      title={user.activo ? 'Desactivar usuario' : 'Activar usuario'}
                      className={`btn-toggle ${user.activo ? 'active' : 'inactive'}`}
                    >
                      {togglingId === user.idusuario
                        ? '...'
                        : user.activo
                          ? 'Desactivar'
                          : 'Activar'}
                    </button>

                      <button 
                        onClick={() => handleEdit(user)}
                        className="btn-edit"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.idusuario)}
                        className="btn-delete"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingUser(null);
                  setFormData({ nombre: '', celular: '', username: '', email: '', password: '', idrol: '' });
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Celular</label>
                <input
                  type="text"
                  value={formData.celular}
                  onChange={(e) => setFormData({...formData, celular: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contraseña {editingUser && '(dejar vacío para mantener)'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!editingUser}
                />
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select
                  value={formData.idrol}
                  onChange={(e) => setFormData({...formData, idrol: e.target.value})}
                  required
                >
                  <option value="">Selecciona un rol</option>
                  {roles.map((role) => (
                    <option key={role.idrol} value={role.idrol}>
                      {role.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersManagement;