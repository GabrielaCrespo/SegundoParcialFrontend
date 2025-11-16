import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Consulta de Horarios</h2>
        
        {/* Filtros en línea horizontal */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          {/* Filtro de Gestión */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Gestión</label>
            <select
              value={filterGestion}
              onChange={(e) => setFilterGestion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Todos</option>
              {gestiones.map((g) => (
                <option key={g.idgestion} value={g.idgestion}>
                  {g.anio} - {g.periodo}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Docente */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Docente</label>
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
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Todos</option>
              {docentes.map((d) => (
                <option key={d.iddocente} value={d.iddocente}>
                  {d.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Aula */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Aula</label>
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
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Todas</option>
              {aulas.map((a) => (
                <option key={a.idaula} value={a.idaula}>
                  Aula {a.numero}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Materia */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Materia</label>
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
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Todas</option>
              {materias.map((m) => (
                <option key={m.idmateria} value={m.idmateria}>
                  {m.sigla}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Grupo (reemplaza el anterior) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Grupo (reemplazó día)</label>
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
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Todos</option>
              {grupos.map((g) => (
                <option key={g.idgrupo} value={g.idgrupo}>
                  {g.materia_sigla || ''} - {g.nombre_grupo}
                </option>
              ))}
            </select>
          </div>

          {/* Botón Limpiar */}
          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Horarios */}
      {filterGestion && horariosUnicos.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border border-gray-300 sticky left-0 bg-gray-50 z-10 w-24">
                    Hora
                  </th>
                  {dias.map((dia) => (
                    <th
                      key={dia.codigo}
                      className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border border-gray-300 min-w-[140px]"
                    >
                      {dia.codigo}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {horariosUnicos.map((hora, horaIdx) => (
                  <tr key={hora} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 py-2 text-center border border-gray-300 sticky left-0 bg-white z-10">
                      <div className="text-xs font-medium text-gray-600">
                        {hora.split('-')[0]}
                      </div>
                    </td>
                    {dias.map((dia) => {
                      const contenido = getCellContent(dia.codigo, hora);
                      return (
                        <td key={dia.codigo} className="px-1 py-1 border border-gray-300 align-top">
                          {contenido.length > 0 ? (
                            <div className="space-y-0.5">
                              {contenido.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="bg-gray-50 border border-gray-200 p-1.5 rounded text-center hover:bg-gray-100 transition-colors cursor-pointer"
                                  title={`${item.materia}\nGrupo: ${item.grupo}\nDocente: ${item.docente}\nAula: ${item.aula}`}
                                >
                                  <div className="font-semibold text-xs text-gray-800">
                                    {item.materiaSigna}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {item.grupo}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Aula {item.aula}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-gray-300 py-2 text-xs">-</div>
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



      {/* Mensaje cuando no hay datos */}
      {filterGestion && asignaciones.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500 text-sm">
            No se encontraron asignaciones para los filtros seleccionados.
          </p>
        </div>
      )}
    </div>
  );
}

export default HorarioVisualizado;
