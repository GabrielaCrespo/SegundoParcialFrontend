import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Search } from 'lucide-react';
import ApiService from '../../services/ApiService';

function MateriasManagement() {
  const [materias, setMaterias] = useState([]);
  const [gestiones, setGestiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMateria, setEditingMateria] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    sigla: '',
    semestre: '',
    idgestion: ''
  });

  useEffect(() => {
    loadMaterias();
    loadGestiones();
  }, []);

  const loadMaterias = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getMaterias();
      if (response.success) {
        setMaterias(response.data);
      }
    } catch (error) {
      console.error('Error loading materias:', error);
    } finally {
      setLoading(false);
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
      const dataToSend = {
        ...formData,
        semestre: parseInt(formData.semestre),
        idgestion: parseInt(formData.idgestion)
      };

      if (editingMateria) {
        await ApiService.updateMateria(editingMateria.idmateria, dataToSend);
      } else {
        await ApiService.createMateria(dataToSend);
      }
      setShowModal(false);
      setEditingMateria(null);
      setFormData({ nombre: '', sigla: '', semestre: '', idgestion: '' });
      loadMaterias();
    } catch (error) {
      console.error('Error saving materia:', error);
    }
  };

  const handleEdit = (materia) => {
    setEditingMateria(materia);
    setFormData({
      nombre: materia.nombre || '',
      sigla: materia.sigla || '',
      semestre: materia.semestre || '',
      idgestion: materia.idgestion || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta materia?')) {
      try {
        await ApiService.deleteMateria(id);
        loadMaterias();
      } catch (error) {
        console.error('Error deleting materia:', error);
      }
    }
  };

  const filteredMaterias = materias.filter(materia =>
    materia.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    materia.sigla?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    materia.gestion_anio?.toString().includes(searchTerm)
  );

  return (
    <div className="content-section">
      <div className="section-header">
        <div className="header-title">
          <BookOpen size={24} />
          <h2>Gestión de Materias</h2>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <Plus size={20} />
          Nueva Materia
        </button>
      </div>

      <div className="section-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar materias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="data-table">
        {loading ? (
          <div className="loading">Cargando materias...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Sigla</th>
                <th>Semestre</th>
                <th>Gestión</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterias.map((materia) => (
                <tr key={materia.idmateria}>
                  <td>{materia.idmateria}</td>
                  <td>{materia.nombre}</td>
                  <td>{materia.sigla}</td>
                  <td>{materia.semestre}° Semestre</td>
                  <td>{materia.gestion_anio} - {materia.gestion_periodo}</td>
                  <td>
                    <div className="actions">
                      <button 
                        onClick={() => handleEdit(materia)}
                        className="btn-edit"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(materia.idmateria)}
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
              <h3>{editingMateria ? 'Editar Materia' : 'Nueva Materia'}</h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingMateria(null);
                  setFormData({ nombre: '', sigla: '', semestre: '', idgestion: '' });
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Nombre de la Materia</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                  placeholder="Ingrese el nombre de la materia"
                />
              </div>
              <div className="form-group">
                <label>Sigla</label>
                <input
                  type="text"
                  value={formData.sigla}
                  onChange={(e) => setFormData({...formData, sigla: e.target.value})}
                  required
                  placeholder="Ingrese la sigla de la materia"
                />
              </div>
              <div className="form-group">
                <label>Semestre</label>
                <select
                  value={formData.semestre}
                  onChange={(e) => setFormData({...formData, semestre: e.target.value})}
                  required
                >
                  <option value="">Seleccione semestre</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(sem => (
                    <option key={sem} value={sem}>{sem}° Semestre</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Gestión</label>
                <select
                  value={formData.idgestion}
                  onChange={(e) => setFormData({...formData, idgestion: e.target.value})}
                  required
                >
                  <option value="">Seleccione gestión</option>
                  {gestiones.map(gestion => (
                    <option key={gestion.idgestion} value={gestion.idgestion}>
                      {gestion.anio} - {gestion.periodo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingMateria ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MateriasManagement;