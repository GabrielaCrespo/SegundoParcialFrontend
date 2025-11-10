import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Edit2, Trash2, Search } from 'lucide-react';
import ApiService from '../../services/ApiService';

function DocentesManagement() {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDocente, setEditingDocente] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    celular: '',
    username: '',
    email: '',
    password: '',
    especialidad: '',
    fechacontrato: ''
  });

  useEffect(() => {
    loadDocentes();
  }, []);

  const loadDocentes = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getDocentes();
      if (response.success) {
        setDocentes(response.data);
      }
    } catch (error) {
      console.error('Error loading docentes:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Agregar idrol por defecto para docentes
      const dataToSend = {
        ...formData,
        idrol: 1 // Rol por defecto para docentes
      };
      
      if (editingDocente) {
        await ApiService.updateDocente(editingDocente.iddocente, dataToSend);
      } else {
        await ApiService.createDocente(dataToSend);
      }
      setShowModal(false);
      setEditingDocente(null);
      setFormData({ nombre: '', celular: '', username: '', email: '', password: '', especialidad: '', fechacontrato: '' });
      loadDocentes();
    } catch (error) {
      console.error('Error saving docente:', error);
    }
  };

  const handleEdit = (docente) => {
    setEditingDocente(docente);
    setFormData({
      nombre: docente.nombre,
      celular: docente.celular || '',
      username: docente.username,
      email: docente.email,
      password: '',
      especialidad: docente.especialidad || '',
      fechacontrato: docente.fechacontrato || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este docente?')) {
      try {
        await ApiService.deleteDocente(id);
        loadDocentes();
      } catch (error) {
        console.error('Error deleting docente:', error);
      }
    }
  };

  const filteredDocentes = docentes.filter(docente =>
    docente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    docente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (docente.especialidad && docente.especialidad.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="content-section">
      <div className="section-header">
        <div className="header-title">
          <GraduationCap size={24} />
          <h2>Gestión de Docentes</h2>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <Plus size={20} />
          Nuevo Docente
        </button>
      </div>

      <div className="section-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar docentes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="data-table">
        {loading ? (
          <div className="loading">Cargando docentes...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Username</th>
                <th>Email</th>
                <th>Celular</th>
                <th>Especialidad</th>
                <th>Fecha Contrato</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocentes.map((docente) => (
                <tr key={docente.iddocente}>
                  <td>{docente.iddocente}</td>
                  <td>{docente.nombre}</td>
                  <td>{docente.username}</td>
                  <td>{docente.email}</td>
                  <td>{docente.celular}</td>
                  <td>{docente.especialidad || 'No especificada'}</td>
                  <td>{docente.fechacontrato || 'No especificada'}</td>
                  <td>
                    <div className="actions">
                      <button 
                        onClick={() => handleEdit(docente)}
                        className="btn-edit"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(docente.iddocente)}
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
              <h3>{editingDocente ? 'Editar Docente' : 'Nuevo Docente'}</h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingDocente(null);
                  setFormData({ nombre: '', celular: '', username: '', email: '', password: '', especialidad: '', fechacontrato: '' });
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
                <label>Contraseña</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!editingDocente}
                />
              </div>
              <div className="form-group">
                <label>Especialidad</label>
                <input
                  type="text"
                  value={formData.especialidad}
                  onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Fecha de Contrato</label>
                <input
                  type="date"
                  value={formData.fechacontrato}
                  onChange={(e) => setFormData({...formData, fechacontrato: e.target.value})}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingDocente ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocentesManagement;