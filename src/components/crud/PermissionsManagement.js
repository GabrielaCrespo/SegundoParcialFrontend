import React, { useState, useEffect } from 'react';
import { Key, Plus, Edit2, Trash2, Search } from 'lucide-react';
import ApiService from '../../services/ApiService';

function PermissionsManagement() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getPermissions();
      if (response.success) {
        setPermissions(response.data);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPermission) {
        await ApiService.updatePermission(editingPermission.idpermiso, formData);
      } else {
        await ApiService.createPermission(formData);
      }
      setShowModal(false);
      setEditingPermission(null);
      setFormData({ nombre: '', descripcion: '' });
      loadPermissions();
    } catch (error) {
      console.error('Error saving permission:', error);
    }
  };

  const handleEdit = (permission) => {
    setEditingPermission(permission);
    setFormData({
      nombre: permission.nombre,
      descripcion: permission.descripcion || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este permiso?')) {
      try {
        await ApiService.deletePermission(id);
        loadPermissions();
      } catch (error) {
        console.error('Error deleting permission:', error);
      }
    }
  };

  const filteredPermissions = permissions.filter(permission =>
    permission.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (permission.descripcion && permission.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="content-section">
      <div className="section-header">
        <div className="header-title">
          <Key size={24} />
          <h2>Gestión de Permisos</h2>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <Plus size={20} />
          Nuevo Permiso
        </button>
      </div>

      <div className="section-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar permisos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="data-table">
        {loading ? (
          <div className="loading">Cargando permisos...</div>
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
              {filteredPermissions.map((permission) => (
                <tr key={permission.idpermiso}>
                  <td>{permission.idpermiso}</td>
                  <td>{permission.nombre}</td>
                  <td>{permission.descripcion || 'Sin descripción'}</td>
                  <td>
                    <div className="actions">
                      <button 
                        onClick={() => handleEdit(permission)}
                        className="btn-edit"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(permission.idpermiso)}
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
              <h3>{editingPermission ? 'Editar Permiso' : 'Nuevo Permiso'}</h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingPermission(null);
                  setFormData({ nombre: '', descripcion: '' });
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Nombre del Permiso</label>
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
                  placeholder="Descripción del permiso (opcional)"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingPermission ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PermissionsManagement;