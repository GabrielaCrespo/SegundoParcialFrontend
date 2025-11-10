import React, { useState, useEffect } from 'react';
import { Clock, Plus, Edit2, Trash2, Search } from 'lucide-react';
import ApiService from '../../services/ApiService';

function HorariosManagement() {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHorario, setEditingHorario] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    dia: '',
    horainicio: '',
    horafinal: ''
  });

  const diasSemana = [
    { value: 'LU', label: 'Lunes' },
    { value: 'MA', label: 'Martes' },
    { value: 'MI', label: 'Miércoles' },
    { value: 'JU', label: 'Jueves' },
    { value: 'VI', label: 'Viernes' },
    { value: 'SA', label: 'Sábado' }
  ];

  useEffect(() => {
    loadHorarios();
  }, []);

  const loadHorarios = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getHorarios();
      if (response.success) {
        setHorarios(response.data);
      }
    } catch (error) {
      console.error('Error loading horarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHorario) {
        await ApiService.updateHorario(editingHorario.idhorario, formData);
      } else {
        await ApiService.createHorario(formData);
      }
      setShowModal(false);
      setEditingHorario(null);
      setFormData({ dia: '', horainicio: '', horafinal: '' });
      loadHorarios();
    } catch (error) {
      console.error('Error saving horario:', error);
    }
  };

  const handleEdit = (horario) => {
    setEditingHorario(horario);
    setFormData({
      dia: horario.dia || '',
      horainicio: horario.horainicio || '',
      horafinal: horario.horafinal || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este horario?')) {
      try {
        await ApiService.deleteHorario(id);
        loadHorarios();
      } catch (error) {
        console.error('Error deleting horario:', error);
      }
    }
  };

  const getDiaLabel = (dia) => {
    const diaObj = diasSemana.find(d => d.value === dia);
    return diaObj ? diaObj.label : dia;
  };

  const filteredHorarios = horarios.filter(horario =>
    getDiaLabel(horario.dia)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    horario.horainicio?.includes(searchTerm) ||
    horario.horafinal?.includes(searchTerm)
  );

  return (
    <div className="content-section">
      <div className="section-header">
        <div className="header-title">
          <Clock size={24} />
          <h2>Gestión de Horarios</h2>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <Plus size={20} />
          Nuevo Horario
        </button>
      </div>

      <div className="section-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar horarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="data-table">
        {loading ? (
          <div className="loading">Cargando horarios...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Día</th>
                <th>Hora Inicio</th>
                <th>Hora Final</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredHorarios.map((horario) => (
                <tr key={horario.idhorario}>
                  <td>{horario.idhorario}</td>
                  <td>{getDiaLabel(horario.dia)}</td>
                  <td>{horario.horainicio}</td>
                  <td>{horario.horafinal}</td>
                  <td>
                    <div className="actions">
                      <button 
                        onClick={() => handleEdit(horario)}
                        className="btn-edit"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(horario.idhorario)}
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
              <h3>{editingHorario ? 'Editar Horario' : 'Nuevo Horario'}</h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingHorario(null);
                  setFormData({ dia: '', horainicio: '', horafinal: '' });
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Día de la Semana</label>
                <select
                  value={formData.dia}
                  onChange={(e) => setFormData({...formData, dia: e.target.value})}
                  required
                >
                  <option value="">Seleccione día</option>
                  {diasSemana.map(dia => (
                    <option key={dia.value} value={dia.value}>
                      {dia.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Hora de Inicio</label>
                <input
                  type="time"
                  value={formData.horainicio}
                  onChange={(e) => setFormData({...formData, horainicio: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Hora Final</label>
                <input
                  type="time"
                  value={formData.horafinal}
                  onChange={(e) => setFormData({...formData, horafinal: e.target.value})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingHorario ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HorariosManagement;