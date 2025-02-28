/**
 * Service pour gérer les appels API au backend
 */

// Configuration de base pour les requêtes API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.tontine.example.com';
const API_TIMEOUT = 15000; // 15 secondes

// Types pour les réponses API
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Classe d'erreur personnalisée pour les erreurs API
export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Fonction pour obtenir les en-têtes d'authentification
 */
const getAuthHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Ajouter le token d'authentification s'il est fourni
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Fonction pour gérer les timeouts des requêtes fetch
 */
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = API_TIMEOUT): Promise<Response> => {
  const controller = new AbortController();
  const { signal } = controller;

  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { ...options, signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    throw error;
  }
};

/**
 * Fonction pour traiter les réponses API
 */
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  
  // Analyser la réponse en fonction du type de contenu
  const data = isJson ? await response.json() : await response.text();
  
  // Vérifier si la réponse est réussie (2xx)
  if (response.ok) {
    return {
      data: data as T,
      status: response.status,
      message: 'success'
    };
  }
  
  // Gérer les erreurs
  const errorMessage = isJson && data.message ? data.message : 'Une erreur est survenue';
  throw new ApiError(errorMessage, response.status, data);
};

/**
 * Méthodes API principales
 */
const apiService = {
  /**
   * Effectue une requête GET
   */
  async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const options: RequestInit = {
      method: 'GET',
      headers: getAuthHeaders(token),
    };
    
    const response = await fetchWithTimeout(url, options);
    return handleResponse<T>(response);
  },
  
  /**
   * Effectue une requête POST
   */
  async post<T>(endpoint: string, data: any, token?: string): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const options: RequestInit = {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    };
    
    const response = await fetchWithTimeout(url, options);
    return handleResponse<T>(response);
  },
  
  /**
   * Effectue une requête PUT
   */
  async put<T>(endpoint: string, data: any, token?: string): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const options: RequestInit = {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    };
    
    const response = await fetchWithTimeout(url, options);
    return handleResponse<T>(response);
  },
  
  /**
   * Effectue une requête PATCH
   */
  async patch<T>(endpoint: string, data: any, token?: string): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const options: RequestInit = {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    };
    
    const response = await fetchWithTimeout(url, options);
    return handleResponse<T>(response);
  },
  
  /**
   * Effectue une requête DELETE
   */
  async delete<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const options: RequestInit = {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    };
    
    const response = await fetchWithTimeout(url, options);
    return handleResponse<T>(response);
  }
};

export default apiService;