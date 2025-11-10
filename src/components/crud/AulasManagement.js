import React, { useState, useEffect } from 'react';
import { School, Plus, Edit2, Trash2, Search } from 'lucide-react';
import ApiService from '../../services/ApiService';

function AulasManagement() {
  const [aulas, setAulas] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAula, setEditingAula] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    numero: '',
    tipo: '',
    idfacultad: ''
  });

  useEffect(() => {
    loadAulas();
    loadFacultades();
  }, []);

  const loadAulas = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getAulas();
      if (response.success) {
        setAulas(response.data);
      }
    } catch (error) {
      console.error('Error loading aulas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFacultades = async () => {
    try {
      const response = await ApiService.getFacultades();
      if (response.success) {
        setFacultades(response.data);
      }
    } catch (error) {
      console.error('Error loading facultades:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        idfacultad: parseInt(formData.idfacultad)
      };

      if (editingAula) {
        await ApiService.updateAula(editingAula.idaula, dataToSend);
      } else {
        await ApiService.createAula(dataToSend);
      }
      setShowModal(false);
      setEditingAula(null);
      setFormData({ numero: '', tipo: '', idfacultad: '' });
      loadAulas();
    } catch (error) {
      console.error('Error saving aula:', error);
    }
  };

  const handleEdit = (aula) => {
    setEditingAula(aula);
    setFormData({
      numero: aula.numero || '',
      tipo: aula.tipo || '',
      idfacultad: aula.idfacultad || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta aula?')) {
      try {
        await ApiService.deleteAula(id);
        loadAulas();
      } catch (error) {
        console.error('Error deleting aula:', error);
      }
    }
  };

  const filteredAulas = aulas.filter(aula =>
    aula.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aula.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aula.facultad_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="content-section">
      <div className="section-header">
        <div className="header-title">
          <School size={24} />
          <h2>Gestión de Aulas</h2>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <Plus size={20} />
          Nueva Aula
        </button>
      </div>

      <div className="section-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar aulas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="data-table">
        {loading ? (
          <div className="loading">Cargando aulas...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Número</th>
                <th>Tipo</th>
                <th>Facultad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAulas.map((aula) => (
                <tr key={aula.idaula}>
                  <td>{aula.idaula}</td>
                  <td>{aula.numero}</td>
                  <td>{aula.tipo}</td>
                  <td>{aula.facultad_nombre} (#{aula.facultad_nro})</td>
                  <td>
                    <div className="actions">
                      <button 
                        onClick={() => handleEdit(aula)}
                        className="btn-edit"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(aula.idaula)}
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
              <h3>{editingAula ? 'Editar Aula' : 'Nueva Aula'}</h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingAula(null);
                  setFormData({ numero: '', tipo: '', idfacultad: '' });
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Número de Aula</label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => setFormData({...formData, numero: e.target.value})}
                  required
                  placeholder="Ingrese el número del aula"
                />
              </div>
              <div className="form-group">
                <label>Tipo de Aula</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  required
                >
                  <option value="">Seleccione tipo</option>
                  <option value="Aula">Aula</option>
                  <option value="Laboratorio">Laboratorio</option>
                  <option value="Auditorio">Auditorio</option>
                  <option value="Sala de Conferencias">Sala de Conferencias</option>
                  <option value="Taller">Taller</option>
                </select>
              </div>
              <div className="form-group">
                <label>Facultad</label>
                <select
                  value={formData.idfacultad}
                  onChange={(e) => setFormData({...formData, idfacultad: e.target.value})}
                  required
                >
                  <option value="">Seleccione facultad</option>
                  {facultades.map(facultad => (
                    <option key={facultad.idfacultad} value={facultad.idfacultad}>
                      {facultad.nombre} (#{facultad.nro})
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingAula ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AulasManagement;