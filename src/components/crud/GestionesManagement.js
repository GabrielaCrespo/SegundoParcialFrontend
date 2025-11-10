import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, Search } from 'lucide-react';
import ApiService from '../../services/ApiService';

function GestionesManagement() {
  const [gestiones, setGestiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGestion, setEditingGestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    anio: '',
    periodo: '',
    fechainicio: '',
    fechafin: ''
  });

  useEffect(() => {
    loadGestiones();
  }, []);

  const loadGestiones = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getGestiones();
      if (response.success) {
        setGestiones(response.data);
      }
    } catch (error) {
      console.error('Error loading gestiones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        anio: parseInt(formData.anio)
      };

      if (editingGestion) {
        await ApiService.updateGestion(editingGestion.idgestion, dataToSend);
      } else {
        await ApiService.createGestion(dataToSend);
      }
      setShowModal(false);
      setEditingGestion(null);
      setFormData({ anio: '', periodo: '', fechainicio: '', fechafin: '' });
      loadGestiones();
    } catch (error) {
      console.error('Error saving gestion:', error);
    }
  };

  const handleEdit = (gestion) => {
    setEditingGestion(gestion);
    setFormData({
      anio: gestion.anio || '',
      periodo: gestion.periodo || '',
      fechainicio: gestion.fechainicio || '',
      fechafin: gestion.fechafin || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta gestión?')) {
      try {
        await ApiService.deleteGestion(id);
        loadGestiones();
      } catch (error) {
        console.error('Error deleting gestion:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const filteredGestiones = gestiones.filter(gestion =>
    gestion.anio?.toString().includes(searchTerm) ||
    gestion.periodo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="content-section">
      <div className="section-header">
        <div className="header-title">
          <Calendar size={24} />
          <h2>Gestión de Gestiones</h2>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <Plus size={20} />
          Nueva Gestión
        </button>
      </div>

      <div className="section-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar gestiones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="data-table">
        {loading ? (
          <div className="loading">Cargando gestiones...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Año</th>
                <th>Período</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredGestiones.map((gestion) => (
                <tr key={gestion.idgestion}>
                  <td>{gestion.idgestion}</td>
                  <td>{gestion.anio}</td>
                  <td>{gestion.periodo}</td>
                  <td>{formatDate(gestion.fechainicio)}</td>
                  <td>{formatDate(gestion.fechafin)}</td>
                  <td>
                    <div className="actions">
                      <button 
                        onClick={() => handleEdit(gestion)}
                        className="btn-edit"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(gestion.idgestion)}
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
              <h3>{editingGestion ? 'Editar Gestión' : 'Nueva Gestión'}</h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingGestion(null);
                  setFormData({ anio: '', periodo: '', fechainicio: '', fechafin: '' });
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Año</label>
                <input
                  type="number"
                  value={formData.anio}
                  onChange={(e) => setFormData({...formData, anio: e.target.value})}
                  required
                  placeholder="Ingrese el año"
                  min="2020"
                  max="2030"
                />
              </div>
              <div className="form-group">
                <label>Período</label>
                <select
                  value={formData.periodo}
                  onChange={(e) => setFormData({...formData, periodo: e.target.value})}
                  required
                >
                  <option value="">Seleccione período</option>
                  <option value="I">I - Primer Semestre</option>
                  <option value="II">II - Segundo Semestre</option>
                  <option value="VERANO">VERANO - Curso de Verano</option>
                </select>
              </div>
              <div className="form-group">
                <label>Fecha de Inicio</label>
                <input
                  type="date"
                  value={formData.fechainicio}
                  onChange={(e) => setFormData({...formData, fechainicio: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Fecha de Fin</label>
                <input
                  type="date"
                  value={formData.fechafin}
                  onChange={(e) => setFormData({...formData, fechafin: e.target.value})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingGestion ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionesManagement;