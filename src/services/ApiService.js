const API_BASE_URL =
  process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000/api';

class ApiService {
  static async request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');

  // si hay body, se agrega Content-Type automáticamente
  const hasBody = typeof options.body !== 'undefined';

  const config = {
    method: options.method || 'GET',
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    ...options,
  };

  // agrega Authorization si hay token guardado
  if (token && !options.skipAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);

    // ✅ manejo automático de sesión expirada o token inválido
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return;
    }

    // intenta parsear la respuesta como JSON
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

  
  // Auth endpoints
  static async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      skipAuth: true,
    });
  }
  
  static async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }
  
  // User endpoints
  static async getUsers() {
    return this.request('/usuarios');
  }
  
  static async createUser(userData) {
    return this.request('/usuarios', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }
  
  static async updateUser(id, userData) {
    return this.request(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }
  
  static async deleteUser(id) {
    return this.request(`/usuarios/${id}`, {
      method: 'DELETE',
    });
  }
  
  // Toggle estado (activo <-> inactivo)
static async toggleUser(id) {
  // Intento con PATCH
  try {
    return await this.request(`/usuarios/${id}/toggle-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
  } catch (e) {
    // Fallback si el servidor/proxy bloquea PATCH (405)
    try {
      return await this.request(`/usuarios/${id}/toggle-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-HTTP-Method-Override': 'PATCH',
        },
        body: '{}',
      });
    } catch (err) {
      throw err;
    }
  }
}

  // Role endpoints
  static async getRoles() {
    return this.request('/roles');
  }
  
  static async createRole(roleData) {
    return this.request('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  }
  
  static async updateRole(id, roleData) {
    return this.request(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  }
  
  static async deleteRole(id) {
    return this.request(`/roles/${id}`, {
      method: 'DELETE',
    });
  }
  
  // Permission endpoints
  static async getPermissions() {
    return this.request('/permisos');
  }
  
  static async createPermission(permissionData) {
    return this.request('/permisos', {
      method: 'POST',
      body: JSON.stringify(permissionData),
    });
  }
  
  static async updatePermission(id, permissionData) {
    return this.request(`/permisos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(permissionData),
    });
  }
  
  static async deletePermission(id) {
    return this.request(`/permisos/${id}`, {
      method: 'DELETE',
    });
  }
  
  // Docente endpoints
  static async getDocentes() {
    return this.request('/docentes');
  }
  
  static async createDocente(docenteData) {
    return this.request('/docentes', {
      method: 'POST',
      body: JSON.stringify(docenteData),
      skipAuth: true,
    });
  }
  
  static async updateDocente(id, docenteData) {
    return this.request(`/docentes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(docenteData),
    });
  }
  
  static async deleteDocente(id) {
    return this.request(`/docentes/${id}`, {
      method: 'DELETE',
    });
  }
  
  // Coordinador endpoints
  static async getCoordinadores() {
    return this.request('/coordinadores');
  }
  
  static async createCoordinador(coordinadorData) {
    return this.request('/coordinadores', {
      method: 'POST',
      body: JSON.stringify(coordinadorData),
      skipAuth: true,
    });
  }
  
  static async updateCoordinador(id, coordinadorData) {
    return this.request(`/coordinadores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(coordinadorData),
    });
  }
  
  static async deleteCoordinador(id) {
    return this.request(`/coordinadores/${id}`, {
      method: 'DELETE',
    });
  }

  // Materia endpoints
  static async getMaterias() {
    return this.request('/materias');
  }
  
  static async createMateria(materiaData) {
    return this.request('/materias', {
      method: 'POST',
      body: JSON.stringify(materiaData),
    });
  }
  
  static async updateMateria(id, materiaData) {
    return this.request(`/materias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(materiaData),
    });
  }
  
  static async deleteMateria(id) {
    return this.request(`/materias/${id}`, {
      method: 'DELETE',
    });
  }

  // Aula endpoints
  static async getAulas() {
    return this.request('/aulas');
  }
  
  static async createAula(aulaData) {
    return this.request('/aulas', {
      method: 'POST',
      body: JSON.stringify(aulaData),
    });
  }
  
  static async updateAula(id, aulaData) {
    return this.request(`/aulas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(aulaData),
    });
  }
  
  static async deleteAula(id) {
    return this.request(`/aulas/${id}`, {
      method: 'DELETE',
    });
  }

  // Horario endpoints
  static async getHorarios() {
    return this.request('/horarios');
  }
  
  static async createHorario(horarioData) {
    return this.request('/horarios', {
      method: 'POST',
      body: JSON.stringify(horarioData),
    });
  }
  
  static async updateHorario(id, horarioData) {
    return this.request(`/horarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(horarioData),
    });
  }
  
  static async deleteHorario(id) {
    return this.request(`/horarios/${id}`, {
      method: 'DELETE',
    });
  }

  // Carrera endpoints
  static async getCarreras() {
    return this.request('/carreras');
  }
  
  static async createCarrera(carreraData) {
    return this.request('/carreras', {
      method: 'POST',
      body: JSON.stringify(carreraData),
    });
  }
  
  static async updateCarrera(id, carreraData) {
    return this.request(`/carreras/${id}`, {
      method: 'PUT',
      body: JSON.stringify(carreraData),
    });
  }
  
  static async deleteCarrera(id) {
    return this.request(`/carreras/${id}`, {
      method: 'DELETE',
    });
  }

  // Facultad endpoints
  static async getFacultades() {
    return this.request('/facultades');
  }
  
  static async createFacultad(facultadData) {
    return this.request('/facultades', {
      method: 'POST',
      body: JSON.stringify(facultadData),
    });
  }
  
  static async updateFacultad(id, facultadData) {
    return this.request(`/facultades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(facultadData),
    });
  }
  
  static async deleteFacultad(id) {
    return this.request(`/facultades/${id}`, {
      method: 'DELETE',
    });
  }

  // Gestion endpoints
  static async getGestiones() {
    return this.request('/gestiones');
  }
  
  static async createGestion(gestionData) {
    return this.request('/gestiones', {
      method: 'POST',
      body: JSON.stringify(gestionData),
    });
  }
  
  static async updateGestion(id, gestionData) {
    return this.request(`/gestiones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(gestionData),
    });
  }
  
  static async deleteGestion(id) {
    return this.request(`/gestiones/${id}`, {
      method: 'DELETE',
    });
  }


  // ✅ Bitácora (Activity Log) endpoints
  static async getBitacora(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/bitacora${query ? `?${query}` : ''}`);
  }

  static async getBitacoraById(id) {
    return this.request(`/bitacora/${id}`);
  }
}

export default ApiService;