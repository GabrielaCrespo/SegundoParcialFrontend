import React, { useState, useEffect } from 'react';
import { Calendar, Filter, RefreshCw } from 'lucide-react';
import ApiService from '../../services/ApiService';

function HorarioVisualizado() {
  const [loading, setLoading] = useState(true);
  const [asignaciones, setAsignaciones] = useState([]);
  const [horarioData, setHorarioData] = useState({});
  const [horariosUnicos, setHorariosUnicos] = useState([]);
  
  // Datos para filtros
  const [gestiones, setGestiones] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [aulas, setAulas] = useState([]);
  
  // Filtros seleccionados
  const [filterGestion, setFilterGestion] = useState('');
  const [filterMateria, setFilterMateria] = useState('');
  const [filterGrupo, setFilterGrupo] = useState('');
  const [filterDocente, setFilterDocente] = useState('');
  const [filterAula, setFilterAula] = useState('');

  // Definir días
  const dias = [
    { codigo: 'LU', nombre: 'Lunes' },
    { codigo: 'MA', nombre: 'Martes' },
    { codigo: 'MI', nombre: 'Miércoles' },
    { codigo: 'JU', nombre: 'Jueves' },
    { codigo: 'VI', nombre: 'Viernes' },
    { codigo: 'SA', nombre: 'Sábado' }
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (filterGestion) {
      loadAsignaciones();
    }
  }, [filterGestion, filterMateria, filterGrupo, filterDocente, filterAula]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [gestionesRes, materiasRes, gruposRes, docentesRes, aulasRes] = await Promise.all([
        ApiService.getGestiones(),
        ApiService.getMaterias(),
        ApiService.getGrupos(),
        ApiService.getDocentes(),
        ApiService.getAulas()
      ]);

      if (gestionesRes.success) {
        setGestiones(gestionesRes.data);
        // Seleccionar automáticamente la primera gestión
        if (gestionesRes.data.length > 0) {
          setFilterGestion(gestionesRes.data[0].idgestion);
        }
      }
      if (materiasRes.success) setMaterias(materiasRes.data);
      if (gruposRes.success) setGrupos(gruposRes.data);
      if (docentesRes.success) setDocentes(docentesRes.data);
      if (aulasRes.success) setAulas(aulasRes.data);

      setLoading(false);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      setLoading(false);
    }
  };

  const loadAsignaciones = async () => {
    if (!filterGestion) return;

    try {
      setLoading(true);
      
      // Construir parámetros de filtro
      const params = { idgestion: filterGestion };
      if (filterMateria) params.idmateria = filterMateria;
      if (filterGrupo) params.idgrupo = filterGrupo;
      if (filterDocente) params.iddocente = filterDocente;
      if (filterAula) params.idaula = filterAula;

      const response = await ApiService.getAsignaciones(params);
      
      if (response.success) {
        console.log('Asignaciones recibidas:', response.data);
        setAsignaciones(response.data);
        organizarHorario(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error cargando asignaciones:', error);
      alert('Error al cargar las asignaciones');
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    // Convertir "HH:MM:SS" a "HH:MM"
    return time.substring(0, 5);
  };

  const organizarHorario = (asignacionesData) => {
    const horarioOrganizado = {};
    const horariosSet = new Set();

    asignacionesData.forEach(asignacion => {
      if (asignacion.horarios && asignacion.horarios.length > 0) {
        asignacion.horarios.forEach(horario => {
          // Crear key sin segundos
          const horaInicio = formatTime(horario.horainicio);
          const horaFinal = formatTime(horario.horafinal);
          const key = `${horario.dia}-${horaInicio}-${horaFinal}`;
          
          // Agregar horario único
          horariosSet.add(`${horaInicio}-${horaFinal}`);
          
          if (!horarioOrganizado[key]) {
            horarioOrganizado[key] = [];
          }

          horarioOrganizado[key].push({
            materia: asignacion.materia_nombre,
            materiaSigna: asignacion.materia_sigla,
            grupo: asignacion.nombre_grupo,
            docente: asignacion.docente_nombre,
            aula: asignacion.aula_numero,
            color: getColorForMateria(asignacion.idmateria)
          });
        });
      }
    });

    // Convertir set de horarios a array ordenado
    const horariosArray = Array.from(horariosSet).sort((a, b) => {
      const [horaA] = a.split('-');
      const [horaB] = b.split('-');
      return horaA.localeCompare(horaB);
    });

    console.log('Horarios únicos:', horariosArray);
    console.log('Horario organizado:', horarioOrganizado);

    setHorariosUnicos(horariosArray);
    setHorarioData(horarioOrganizado);
  };

  const getColorForMateria = (idmateria) => {
    const colors = [
      'bg-blue-50 border-l-blue-400 text-blue-900',
      'bg-green-50 border-l-green-400 text-green-900',
      'bg-yellow-50 border-l-yellow-400 text-yellow-900',
      'bg-purple-50 border-l-purple-400 text-purple-900',
      'bg-pink-50 border-l-pink-400 text-pink-900',
      'bg-indigo-50 border-l-indigo-400 text-indigo-900',
      'bg-red-50 border-l-red-400 text-red-900',
      'bg-orange-50 border-l-orange-400 text-orange-900',
      'bg-teal-50 border-l-teal-400 text-teal-900',
      'bg-cyan-50 border-l-cyan-400 text-cyan-900'
    ];
    return colors[idmateria % colors.length];
  };

  const getCellContent = (dia, hora) => {
    const key = `${dia}-${hora}`;
    return horarioData[key] || [];
  };

  const handleRefresh = () => {
    loadAsignaciones();
  };

  const handleClearFilters = () => {
    setFilterMateria('');
    setFilterGrupo('');
    setFilterDocente('');
    setFilterAula('');
  };

  if (loading && asignaciones.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="content-section">
        <div className="section-header">
          <div className="header-title">
            <div>
              <h2>Visualización de Horarios</h2>
              <p className="text-sm text-gray-600 mt-1">Horarios académicos por materia</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="btn-primary"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="content-section">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtros de Búsqueda</h3>
        
        {/* Filtro de Gestión - Principal */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gestión Académica <span className="text-red-500">*</span>
          </label>
          <select
            value={filterGestion}
            onChange={(e) => setFilterGestion(e.target.value)}
            className="w-full md:w-1/2 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
          >
            <option value="">Seleccione una gestión</option>
            {gestiones.map((g) => (
              <option key={g.idgestion} value={g.idgestion}>
                {g.anio} - {g.periodo}
              </option>
            ))}
          </select>
        </div>

        {/* Filtros Secundarios - Solo uno activo a la vez */}
        {filterGestion && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Filtrar por:
            </label>
            <div className="flex flex-wrap gap-3">
              {/* Botón Materia */}
              <div className="flex-1 min-w-[200px]">
                <select
                  value={filterMateria}
                  onChange={(e) => {
                    setFilterMateria(e.target.value);
                    if (e.target.value) {
                      setFilterDocente('');
                      setFilterGrupo('');
                      setFilterAula('');
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white hover:border-teal-400 transition-all"
                >
                  <option value="">📚 Seleccionar Materia</option>
                  {materias.map((m) => (
                    <option key={m.idmateria} value={m.idmateria}>
                      {m.sigla} - {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botón Docente */}
              <div className="flex-1 min-w-[200px]">
                <select
                  value={filterDocente}
                  onChange={(e) => {
                    setFilterDocente(e.target.value);
                    if (e.target.value) {
                      setFilterMateria('');
                      setFilterGrupo('');
                      setFilterAula('');
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-blue-400 transition-all"
                >
                  <option value="">🧑‍🏫 Seleccionar Docente</option>
                  {docentes.map((d) => (
                    <option key={d.iddocente} value={d.iddocente}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botón Grupo */}
              <div className="flex-1 min-w-[200px]">
                <select
                  value={filterGrupo}
                  onChange={(e) => {
                    setFilterGrupo(e.target.value);
                    if (e.target.value) {
                      setFilterMateria('');
                      setFilterDocente('');
                      setFilterAula('');
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white hover:border-green-400 transition-all"
                >
                  <option value="">👥 Seleccionar Grupo</option>
                  {grupos.map((g) => (
                    <option key={g.idgrupo} value={g.idgrupo}>
                      {g.materia_nombre || g.materia_sigla || ''} - {g.nombre_grupo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botón Aula */}
              <div className="flex-1 min-w-[200px]">
                <select
                  value={filterAula}
                  onChange={(e) => {
                    setFilterAula(e.target.value);
                    if (e.target.value) {
                      setFilterMateria('');
                      setFilterDocente('');
                      setFilterGrupo('');
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white hover:border-purple-400 transition-all"
                >
                  <option value="">🏫 Seleccionar Aula</option>
                  {aulas.map((a) => (
                    <option key={a.idaula} value={a.idaula}>
                      Aula {a.numero} - {a.edificio}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(filterMateria || filterGrupo || filterDocente || filterAula) && (
              <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-indigo-900">
                    {filterMateria && `Mostrando horarios de la materia seleccionada`}
                    {filterDocente && `Mostrando horario del docente seleccionado`}
                    {filterGrupo && `Mostrando horario del grupo seleccionado`}
                    {filterAula && `Mostrando materias en el aula seleccionada`}
                  </span>
                  <button
                    onClick={handleClearFilters}
                    className="text-sm px-3 py-1 bg-white text-indigo-600 hover:bg-indigo-100 rounded-md font-medium transition-colors"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabla de Horarios */}
      {filterGestion && horariosUnicos.length > 0 && (
        <div className="content-section p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider border border-indigo-500 sticky left-0 bg-indigo-600 z-10 min-w-[120px]">
                    Horario
                  </th>
                  {dias.map((dia) => (
                    <th
                      key={dia.codigo}
                      className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider border border-indigo-500 min-w-[160px]"
                    >
                      {dia.nombre}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {horariosUnicos.map((hora, horaIdx) => (
                  <tr key={hora} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center border border-gray-300 sticky left-0 bg-white z-10">
                      <div className="text-sm font-semibold text-gray-700">
                        <div>{hora.split('-')[0]}</div>
                        <div className="text-xs text-gray-400">-</div>
                        <div>{hora.split('-')[1]}</div>
                      </div>
                    </td>
                    {dias.map((dia) => {
                      const contenido = getCellContent(dia.codigo, hora);
                      return (
                        <td key={dia.codigo} className="px-2 py-2 border border-gray-300 align-middle">
                          {contenido.length > 0 ? (
                            <div className="space-y-1">
                              {contenido.map((item, idx) => (
                                <div
                                  key={idx}
                                  className={`${item.color} p-2 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                                  title={`${item.materia}\nGrupo: ${item.grupo}\nDocente: ${item.docente}\nAula: ${item.aula}`}
                                >
                                  <div className="font-bold text-sm text-center">
                                    {item.materiaSigna}
                                  </div>
                                  <div className="text-xs text-center opacity-90">
                                    {item.grupo}
                                  </div>
                                  {(filterDocente || filterGrupo || filterAula) && (
                                    <div className="text-xs text-center mt-1 pt-1 border-t border-current/20">
                                      {filterDocente && `Aula ${item.aula}`}
                                      {filterGrupo && item.docente.split(' ').slice(0, 2).join(' ')}
                                      {filterAula && item.docente.split(' ').slice(0, 2).join(' ')}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-gray-300 py-4 text-xs">-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Información adicional */}
      {filterGestion && asignaciones.length > 0 && (
        <div className="content-section bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500">
          <h4 className="text-base font-bold text-gray-800 mb-3">Estadísticas</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-xs text-gray-600 mb-1">Total Asignaciones</div>
              <div className="text-3xl font-bold text-indigo-600">{asignaciones.length}</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-xs text-gray-600 mb-1">Bloques Horarios</div>
              <div className="text-3xl font-bold text-purple-600">{horariosUnicos.length}</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-xs text-gray-600 mb-1">Materias Distintas</div>
              <div className="text-3xl font-bold text-pink-600">
                {new Set(asignaciones.map(a => a.idmateria)).size}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay gestión seleccionada */}
      {!filterGestion && (
        <div className="content-section border-l-4 border-yellow-400 bg-yellow-50">
          <p className="text-sm font-medium text-yellow-800">
            ⚠️ Por favor, seleccione una gestión académica para visualizar los horarios.
          </p>
        </div>
      )}

      {/* Mensaje cuando no hay datos */}
      {filterGestion && asignaciones.length === 0 && !loading && (
        <div className="content-section text-center py-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No hay asignaciones
          </h3>
          <p className="text-gray-500 text-sm">
            No se encontraron asignaciones para los filtros seleccionados.
          </p>
        </div>
      )}
    </div>
  );
}

export default HorarioVisualizado;
