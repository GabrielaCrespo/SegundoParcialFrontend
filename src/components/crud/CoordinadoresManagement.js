import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Edit2, Trash2, Search } from 'lucide-react';
import ApiService from '../../services/ApiService';

function CoordinadoresManagement() {
  const [coordinadores, setCoordinadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoordinador, setEditingCoordinador] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    celular: '',
    username: '',
    email: '',
    password: '',
    fechacontrato: ''
  });

  useEffect(() => {
    loadCoordinadores();
  }, []);

  const loadCoordinadores = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getCoordinadores();
      if (response.success) {
        setCoordinadores(response.data);
      }
    } catch (error) {
      console.error('Error loading coordinadores:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Agregar idrol por defecto para coordinadores
      const dataToSend = {
        ...formData,
        idrol: 1 // Rol por defecto para coordinadores
      };
      
      if (editingCoordinador) {
        await ApiService.updateCoordinador(editingCoordinador.idcoordinador, dataToSend);
      } else {
        await ApiService.createCoordinador(dataToSend);
      }
      setShowModal(false);
      setEditingCoordinador(null);
      setFormData({ nombre: '', celular: '', username: '', email: '', password: '', fechacontrato: '' });
      loadCoordinadores();
    } catch (error) {
      console.error('Error saving coordinador:', error);
    }
  };

  const handleEdit = (coordinador) => {
    setEditingCoordinador(coordinador);
    setFormData({
      nombre: coordinador.nombre,
      celular: coordinador.celular || '',
      username: coordinador.username,
      email: coordinador.email,
      password: '',
      fechacontrato: coordinador.fechacontrato || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este coordinador?')) {
      try {
        await ApiService.deleteCoordinador(id);
        loadCoordinadores();
      } catch (error) {
        console.error('Error deleting coordinador:', error);
      }
    }
  };

  const filteredCoordinadores = coordinadores.filter(coordinador =>
    coordinador.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coordinador.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (coordinador.departamento && coordinador.departamento.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="content-section">
      <div className="section-header">
        <div className="header-title">
          <UserCheck size={24} />
          <h2>Gestión de Coordinadores</h2>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <Plus size={20} />
          Nuevo Coordinador
        </button>
      </div>

      <div className="section-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar coordinadores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="data-table">
        {loading ? (
          <div className="loading">Cargando coordinadores...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Username</th>
                <th>Email</th>
                <th>Celular</th>
                <th>Fecha Contrato</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoordinadores.map((coordinador) => (
                <tr key={coordinador.idcoordinador}>
                  <td>{coordinador.idcoordinador}</td>
                  <td>{coordinador.nombre}</td>
                  <td>{coordinador.username}</td>
                  <td>{coordinador.email}</td>
                  <td>{coordinador.celular}</td>
                  <td>{coordinador.fechacontrato || 'No especificada'}</td>
                  <td>
                    <div className="actions">
                      <button 
                        onClick={() => handleEdit(coordinador)}
                        className="btn-edit"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(coordinador.idcoordinador)}
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
              <h3>{editingCoordinador ? 'Editar Coordinador' : 'Nuevo Coordinador'}</h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingCoordinador(null);
                  setFormData({ nombre: '', celular: '', username: '', email: '', password: '', fechacontrato: '' });
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
                  required={!editingCoordinador}
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
                  {editingCoordinador ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoordinadoresManagement;