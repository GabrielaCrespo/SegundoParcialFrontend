import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, Search } from 'lucide-react';
import ApiService from '../../services/ApiService';

function RolesManagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getRoles();
      if (response.success) {
        setRoles(response.data);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await ApiService.updateRole(editingRole.idrol, formData);
      } else {
        await ApiService.createRole(formData);
      }
      setShowModal(false);
      setEditingRole(null);
      setFormData({ nombre: '', descripcion: '' });
      loadRoles();
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      nombre: role.nombre,
      descripcion: role.descripcion || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este rol?')) {
      try {
        await ApiService.deleteRole(id);
        loadRoles();
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  const filteredRoles = roles.filter(role =>
    role.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.descripcion && role.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="content-section">
      <div className="section-header">
        <div className="header-title">
          <Shield size={24} />
          <h2>Gestión de Roles</h2>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <Plus size={20} />
          Nuevo Rol
        </button>
      </div>

      <div className="section-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="data-table">
        {loading ? (
          <div className="loading">Cargando roles...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map((role) => (
                <tr key={role.idrol}>
                  <td>{role.idrol}</td>
                  <td>{role.nombre}</td>
                  <td>{role.descripcion || 'Sin descripción'}</td>
                  <td>
                    <div className="actions">
                      <button 
                        onClick={() => handleEdit(role)}
                        className="btn-edit"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(role.idrol)}
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
              <h3>{editingRole ? 'Editar Rol' : 'Nuevo Rol'}</h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingRole(null);
                  setFormData({ nombre: '', descripcion: '' });
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Nombre del Rol</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  rows={3}
                  placeholder="Descripción del rol (opcional)"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingRole ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RolesManagement;