import React, { useState, useEffect } from 'react';
import { Building, Plus, Edit2, Trash2, Search } from 'lucide-react';
import ApiService from '../../services/ApiService';

function FacultadesManagement() {
  const [facultades, setFacultades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFacultad, setEditingFacultad] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nro: '',
    nombre: ''
  });

  useEffect(() => {
    loadFacultades();
  }, []);

  const loadFacultades = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getFacultades();
      if (response.success) {
        setFacultades(response.data);
      }
    } catch (error) {
      console.error('Error loading facultades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        nro: parseInt(formData.nro)
      };

      if (editingFacultad) {
        await ApiService.updateFacultad(editingFacultad.idfacultad, dataToSend);
      } else {
        await ApiService.createFacultad(dataToSend);
      }
      setShowModal(false);
      setEditingFacultad(null);
      setFormData({ nro: '', nombre: '' });
      loadFacultades();
    } catch (error) {
      console.error('Error saving facultad:', error);
    }
  };

  const handleEdit = (facultad) => {
    setEditingFacultad(facultad);
    setFormData({
      nro: facultad.nro || '',
      nombre: facultad.nombre || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta facultad?')) {
      try {
        await ApiService.deleteFacultad(id);
        loadFacultades();
      } catch (error) {
        console.error('Error deleting facultad:', error);
      }
    }
  };

  const filteredFacultades = facultades.filter(facultad =>
    facultad.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facultad.nro?.toString().includes(searchTerm)
  );

  return (
    <div className="content-section">
      <div className="section-header">
        <div className="header-title">
          <Building size={24} />
          <h2>Gestión de Facultades</h2>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <Plus size={20} />
          Nueva Facultad
        </button>
      </div>

      <div className="section-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar facultades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="data-table">
        {loading ? (
          <div className="loading">Cargando facultades...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Número</th>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredFacultades.map((facultad) => (
                <tr key={facultad.idfacultad}>
                  <td>{facultad.idfacultad}</td>
                  <td>#{facultad.nro}</td>
                  <td>{facultad.nombre}</td>
                  <td>
                    <div className="actions">
                      <button 
                        onClick={() => handleEdit(facultad)}
                        className="btn-edit"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(facultad.idfacultad)}
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
              <h3>{editingFacultad ? 'Editar Facultad' : 'Nueva Facultad'}</h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingFacultad(null);
                  setFormData({ nro: '', nombre: '' });
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Número de Facultad</label>
                <input
                  type="number"
                  value={formData.nro}
                  onChange={(e) => setFormData({...formData, nro: e.target.value})}
                  required
                  placeholder="Ingrese el número de la facultad"
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Nombre de la Facultad</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                  placeholder="Ingrese el nombre de la facultad"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingFacultad ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacultadesManagement;