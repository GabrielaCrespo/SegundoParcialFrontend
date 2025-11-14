import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Edit2, Trash2, Search, AlertCircle } from 'lucide-react';
import ApiService from '../../services/ApiService';

function AsignacionManagement() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAsignacion, setEditingAsignacion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Datos para los selectores
  const [grupos, setGrupos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [gestiones, setGestiones] = useState([]);
  const [horarios, setHorarios] = useState([]);
  
  // Filtros
  const [filterGestion, setFilterGestion] = useState('');
  
  // Formulario
  const [formData, setFormData] = useState({
    idgrupo: '',
    idmateria: '',
    iddocente: '',
    idaula: '',
    idgestion: '',
    horarios: []
  });
  
  const [conflicts, setConflicts] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (filterGestion) {
      loadAsignaciones(filterGestion);
    }
  }, [filterGestion]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [gruposRes, materiasRes, docentesRes, aulasRes, gestionesRes, horariosRes] = await Promise.all([
        ApiService.getGrupos(),
        ApiService.getMaterias(),
        ApiService.getDocentes(),
        ApiService.getAulas(),
        ApiService.getGestiones(),
        ApiService.getHorarios()
      ]);

      if (gruposRes.success) setGrupos(gruposRes.data);
      if (materiasRes.success) setMaterias(materiasRes.data);
      if (docentesRes.success) setDocentes(docentesRes.data);
      if (aulasRes.success) setAulas(aulasRes.data);
      if (gestionesRes.success) {
        setGestiones(gestionesRes.data);
        // Seleccionar la gestión más reciente por defecto
        if (gestionesRes.data.length > 0) {
          const latest = gestionesRes.data[0];
          setFilterGestion(latest.idgestion);
          setFormData(prev => ({ ...prev, idgestion: latest.idgestion }));
        }
      }
      if (horariosRes.success) setHorarios(horariosRes.data);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAsignaciones = async (idgestion) => {
    try {
      setLoading(true);
      const response = await ApiService.getAsignaciones({ idgestion });
      if (response.success) {
        setAsignaciones(response.data);
      }
    } catch (error) {
      console.error('Error loading asignaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setConflicts([]);
    
    if (formData.horarios.length === 0) {
      alert('Debe seleccionar al menos un horario');
      return;
    }

    try {
      if (editingAsignacion) {
        // Actualizar solo horarios
        await ApiService.updateAsignacionSlots(editingAsignacion.idasignacion, formData.horarios);
      } else {
        // Crear nueva asignación
        await ApiService.createAsignacion(formData);
      }
      
      setShowModal(false);
      setEditingAsignacion(null);
      resetForm();
      loadAsignaciones(filterGestion);
    } catch (error) {
      console.error('Error saving asignacion:', error);
      
      // Mostrar conflictos si existen
      if (error.response && error.response.data && error.response.data.conflicts) {
        setConflicts(error.response.data.conflicts);
      } else {
        alert(error.message || 'Error al guardar la asignación');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta asignación?')) {
      try {
        await ApiService.deleteAsignacion(id);
        loadAsignaciones(filterGestion);
      } catch (error) {
        console.error('Error deleting asignacion:', error);
        alert('Error al eliminar la asignación');
      }
    }
  };

  const handleEdit = (asignacion) => {
    setEditingAsignacion(asignacion);
    setFormData({
      idgrupo: asignacion.idgrupo,
      idmateria: asignacion.idmateria,
      iddocente: asignacion.iddocente,
      idaula: asignacion.idaula,
      idgestion: asignacion.idgestion,
      horarios: asignacion.horarios.map(h => h.idhorario)
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      idgrupo: '',
      idmateria: '',
      iddocente: '',
      idaula: '',
      idgestion: filterGestion,
      horarios: []
    });
    setConflicts([]);
  };

  const toggleHorario = (idhorario) => {
    setFormData(prev => ({
      ...prev,
      horarios: prev.horarios.includes(idhorario)
        ? prev.horarios.filter(h => h !== idhorario)
        : [...prev.horarios, idhorario]
    }));
  };

  const filteredAsignaciones = asignaciones.filter(asig =>
    asig.materia_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asig.docente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asig.nombre_grupo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar horarios por día
  const horariosPorDia = {
    'LU': horarios.filter(h => h.dia === 'LU'),
    'MA': horarios.filter(h => h.dia === 'MA'),
    'MI': horarios.filter(h => h.dia === 'MI'),
    'JU': horarios.filter(h => h.dia === 'JU'),
    'VI': horarios.filter(h => h.dia === 'VI'),
    'SA': horarios.filter(h => h.dia === 'SA')
  };

  return (
    <div className="content-section">
      <div className="section-header">
        <div className="header-title">
          <ClipboardList size={24} />
          <h2>Gestión de Asignaciones</h2>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary"
        >
          <Plus size={20} />
          Nueva Asignación
        </button>
      </div>

      <div className="section-filters">
        <div className="filter-group">
          <label>Gestión:</label>
          <select
            value={filterGestion}
            onChange={(e) => setFilterGestion(e.target.value)}
          >
            <option value="">Seleccionar gestión</option>
            {gestiones.map(g => (
              <option key={g.idgestion} value={g.idgestion}>
                {g.anio} - {g.periodo}
              </option>
            ))}
          </select>
        </div>
        
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar asignaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="data-table">
        {loading ? (
          <div className="loading">Cargando asignaciones...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Grupo</th>
                <th>Materia</th>
                <th>Docente</th>
                <th>Aula</th>
                <th>Horarios</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAsignaciones.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center'}}>
                    No hay asignaciones para esta gestión
                  </td>
                </tr>
              ) : (
                filteredAsignaciones.map((asig) => (
                  <tr key={asig.idasignacion}>
                    <td>{asig.nombre_grupo}</td>
                    <td>{asig.materia_nombre} ({asig.materia_sigla})</td>
                    <td>{asig.docente_nombre}</td>
                    <td>Aula {asig.aula_numero}</td>
                    <td>
                      <div style={{fontSize: '12px'}}>
                        {asig.horarios.map(h => (
                          <div key={h.idhorario}>
                            {h.dia} {h.horainicio} - {h.horafinal}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="actions">
                        <button 
                          onClick={() => handleEdit(asig)}
                          className="btn-edit"
                          title="Editar horarios"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(asig.idasignacion)}
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
          <div className="modal modal-large">
            <div className="modal-header">
              <h3>{editingAsignacion ? 'Editar Horarios de Asignación' : 'Nueva Asignación'}</h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingAsignacion(null);
                  resetForm();
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            {conflicts.length > 0 && (
              <div className="alert alert-error">
                <AlertCircle size={20} />
                <div>
                  <strong>Conflictos de horario encontrados:</strong>
                  <ul>
                    {conflicts.map((c, idx) => (
                      <li key={idx}>{c.mensaje}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="modal-form">
              {!editingAsignacion && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Gestión *</label>
                      <select
                        value={formData.idgestion}
                        onChange={(e) => setFormData({...formData, idgestion: e.target.value})}
                        required
                        disabled={editingAsignacion}
                      >
                        <option value="">Seleccionar</option>
                        {gestiones.map(g => (
                          <option key={g.idgestion} value={g.idgestion}>
                            {g.anio} - {g.periodo}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Grupo *</label>
                      <select
                        value={formData.idgrupo}
                        onChange={(e) => setFormData({...formData, idgrupo: e.target.value})}
                        required
                        disabled={editingAsignacion}
                      >
                        <option value="">Seleccionar</option>
                        {grupos.map(g => (
                          <option key={g.idgrupo} value={g.idgrupo}>
                            {g.nombre_grupo}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Materia *</label>
                      <select
                        value={formData.idmateria}
                        onChange={(e) => setFormData({...formData, idmateria: e.target.value})}
                        required
                        disabled={editingAsignacion}
                      >
                        <option value="">Seleccionar</option>
                        {materias.map(m => (
                          <option key={m.idmateria} value={m.idmateria}>
                            {m.nombre} ({m.sigla})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Docente *</label>
                      <select
                        value={formData.iddocente}
                        onChange={(e) => setFormData({...formData, iddocente: e.target.value})}
                        required
                        disabled={editingAsignacion}
                      >
                        <option value="">Seleccionar</option>
                        {docentes.map(d => (
                          <option key={d.iddocente} value={d.iddocente}>
                            {d.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Aula *</label>
                    <select
                      value={formData.idaula}
                      onChange={(e) => setFormData({...formData, idaula: e.target.value})}
                      required
                      disabled={editingAsignacion}
                    >
                      <option value="">Seleccionar</option>
                      {aulas.map(a => (
                        <option key={a.idaula} value={a.idaula}>
                          Aula {a.numero} ({a.tipo})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Horarios * (Seleccionar uno o más)</label>
                <div className="horarios-grid">
                  {Object.entries(horariosPorDia).map(([dia, horariosdia]) => (
                    <div key={dia} className="dia-group">
                      <h4>{dia}</h4>
                      {horariosdia.map(h => (
                        <label key={h.idhorario} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.horarios.includes(h.idhorario)}
                            onChange={() => toggleHorario(h.idhorario)}
                          />
                          <span>{h.horainicio} - {h.horafinal}</span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingAsignacion(null);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingAsignacion ? 'Actualizar Horarios' : 'Crear Asignación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AsignacionManagement;
