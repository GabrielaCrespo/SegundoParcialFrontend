import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Search } from 'lucide-react';
import ApiService from '../../services/ApiService';

function GruposManagement() {
  const [grupos, setGrupos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [gestiones, setGestiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre_grupo: '',
    idmateria: '',
    idgestion: '',
    capacidad: ''
  });

  useEffect(() => {
    loadGrupos();
    loadMaterias();
    loadGestiones();
  }, []);

  const loadGrupos = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getGrupos();
      if (response.success) {
        setGrupos(response.data);
      }
    } catch (error) {
      console.error('Error loading grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMaterias = async () => {
    try {
      const response = await ApiService.getMaterias();
      if (response.success) {
        setMaterias(response.data);
      }
    } catch (error) {
      console.error('Error loading materias:', error);
    }
  };

  const loadGestiones = async () => {
    try {
      const response = await ApiService.getGestiones();
      if (response.success) {
        setGestiones(response.data);
      }
    } catch (error) {
      console.error('Error loading gestiones:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGrupo) {
        await ApiService.updateGrupo(editingGrupo.idgrupo, formData);
      } else {
        await ApiService.createGrupo(formData);
      }
      setShowModal(false);
      setEditingGrupo(null);
      setFormData({ nombre_grupo: '', idmateria: '', idgestion: '', capacidad: '' });
      loadGrupos();
    } catch (error) {
      console.error('Error saving grupo:', error);
      alert(error.message || 'Error al guardar el grupo');
    }
  };

  const handleEdit = (grupo) => {
    setEditingGrupo(grupo);
    setFormData({
      nombre_grupo: grupo.nombre_grupo,
      idmateria: grupo.idmateria || '',
      idgestion: grupo.idgestion || '',
      capacidad: grupo.capacidad || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este grupo? Esto también eliminará todas sus asignaciones.')) {
      try {
        await ApiService.deleteGrupo(id);
        loadGrupos();
      } catch (error) {
        console.error('Error deleting grupo:', error);
        alert('Error al eliminar el grupo. Puede tener asignaciones asociadas.');
      }
    }
  };

  const filteredGrupos = grupos.filter(grupo =>
    grupo.nombre_grupo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="content-section">
      <div className="section-header">
        <div className="header-title">
          <Users size={24} />
          <h2>Gestión de Grupos</h2>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <Plus size={20} />
          Nuevo Grupo
        </button>
      </div>

      <div className="section-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar grupos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="data-table">
        {loading ? (
          <div className="loading">Cargando grupos...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre del Grupo</th>
                <th>Materia</th>
                <th>Gestión</th>
                <th>Capacidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrupos.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center'}}>
                    No hay grupos registrados
                  </td>
                </tr>
              ) : (
                filteredGrupos.map((grupo) => (
                  <tr key={grupo.idgrupo}>
                    <td>{grupo.idgrupo}</td>
                    <td>{grupo.nombre_grupo}</td>
                    <td>{grupo.materia_nombre || '-'}</td>
                    <td>{grupo.gestion_nombre || '-'}</td>
                    <td>{grupo.capacidad || '-'}</td>
                    <td>
                      <div className="actions">
                        <button 
                          onClick={() => handleEdit(grupo)}
                          className="btn-edit"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(grupo.idgrupo)}
                          className="btn-delete"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingGrupo ? 'Editar Grupo' : 'Nuevo Grupo'}</h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingGrupo(null);
                  setFormData({ nombre_grupo: '', idmateria: '', idgestion: '', capacidad: '' });
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Nombre del Grupo *</label>
                <input
                  type="text"
                  value={formData.nombre_grupo}
                  onChange={(e) => setFormData({...formData, nombre_grupo: e.target.value.toUpperCase()})}
                  placeholder="Ej: SA, SB, SC, 1A, 2B"
                  maxLength="20"
                  required
                />
                <small>Identificador del grupo (máximo 20 caracteres)</small>
              </div>
              
              <div className="form-group">
                <label>Materia *</label>
                <select
                  value={formData.idmateria}
                  onChange={(e) => setFormData({...formData, idmateria: e.target.value})}
                  required
                >
                  <option value="">Seleccione una materia</option>
                  {materias.map(materia => (
                    <option key={materia.idmateria} value={materia.idmateria}>
                      {materia.sigla} - {materia.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Gestión *</label>
                <select
                  value={formData.idgestion}
                  onChange={(e) => setFormData({...formData, idgestion: e.target.value})}
                  required
                >
                  <option value="">Seleccione una gestión</option>
                  {gestiones.map(gestion => (
                    <option key={gestion.idgestion} value={gestion.idgestion}>
                      {gestion.nombre_gestion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Capacidad *</label>
                <input
                  type="number"
                  value={formData.capacidad}
                  onChange={(e) => setFormData({...formData, capacidad: e.target.value})}
                  placeholder="Ej: 30"
                  min="1"
                  required
                />
                <small>Número máximo de estudiantes</small>
              </div>
              <div className="modal-actions">
                <button 
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingGrupo(null);
                    setFormData({ nombre_grupo: '', idmateria: '', idgestion: '', capacidad: '' });
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingGrupo ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GruposManagement;