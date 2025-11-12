import React, { useState, useEffect } from 'react';
import { FileText, Search } from 'lucide-react';
import ApiService from '../../services/ApiService';

function BitacoraManagement() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    fecha_inicio: '',
    fecha_fin: '',
  });

  // ✅ Cargar bitácora solo al montar el componente
  useEffect(() => {
    loadBitacora();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Obtiene la bitácora desde el backend con filtros opcionales
  const loadBitacora = async () => {
    try {
      setLoading(true);

      // Construir parámetros solo si existen
      const params = {};
      if (filters.fecha_inicio) params.fecha_inicio = filters.fecha_inicio;
      if (filters.fecha_fin) params.fecha_fin = filters.fecha_fin;

      const response = await ApiService.getBitacora(params);

      if (response.success && Array.isArray(response.data)) {
        setLogs(response.data);
      } else if (response.success && response.data.data) {
        setLogs(response.data.data);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error('Error al cargar bitácora:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Manejo de filtros y recarga manual
  const handleFilterSubmit = async (e) => {
    e.preventDefault();
    await loadBitacora();
  };

  return (
    <div className="content-section">
      <div className="section-header">
        <div className="header-title">
          <FileText size={24} />
          <h2>Bitácora del Sistema</h2>
        </div>
      </div>

      {/* 🔹 Filtro por fechas */}
      <form
        onSubmit={handleFilterSubmit}
        className="flex flex-wrap gap-4 items-end mb-4"
      >
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Fecha Inicio</label>
          <input
            type="date"
            name="fecha_inicio"
            value={filters.fecha_inicio}
            onChange={(e) =>
              setFilters({ ...filters, fecha_inicio: e.target.value })
            }
            className="border p-2 rounded"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Fecha Fin</label>
          <input
            type="date"
            name="fecha_fin"
            value={filters.fecha_fin}
            onChange={(e) =>
              setFilters({ ...filters, fecha_fin: e.target.value })
            }
            className="border p-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="btn-primary px-4 py-2 rounded flex items-center gap-2"
        >
          <Search size={18} />
          Aplicar Filtro
        </button>
      </form>

      {/* 🔹 Tabla de registros */}
      <div className="data-table mt-4">
        {loading ? (
          <div className="loading">Cargando registros de bitácora...</div>
        ) : logs.length === 0 ? (
          <p className="text-gray-500">No se encontraron registros.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Módulo</th>
                <th>Descripción</th>
                <th>Usuario</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{log.log_name}</td>
                  <td>{log.descripcion}</td>
                  <td>{log.usuario}</td>
                  <td>{log.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default BitacoraManagement;
