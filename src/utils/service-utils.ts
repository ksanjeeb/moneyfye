import { getBearerToken } from "./custom";

const BASE_URL = import.meta.env.VITE_API_URL;

const fetchData = async (url: string, options: RequestInit): Promise<any> => {
  const response = await fetch(url, options);

  if (response.status === 401) {
    localStorage.clear();
    window.location.href = '/login';
    return; 
  }

  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

interface ApiService {
  get: (endpoint: string) => Promise<any>;
  post: (endpoint: string, data: any) => Promise<any>;
  patch: (endpoint: string, data: any) => Promise<any>;
  delete: (endpoint: string) => Promise<any>;
  downloadFile: (endpoint: string, data: any) => Promise<void>; 
}

const apiService: ApiService = {
  get: async (endpoint: string) => {
    const token = getBearerToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    return fetchData(`${BASE_URL}${endpoint}`, { method: 'GET', headers });
  },

  post: async (endpoint: string, data: any) => {
    const token = getBearerToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    return fetchData(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  },

  patch: async (endpoint: string, data: any) => {
    const token = getBearerToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    return fetchData(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
  },

  delete: async (endpoint: string) => {
    const token = getBearerToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    return fetchData(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
  },

  downloadFile: async (endpoint: string, data: any) => {
    const token = getBearerToken();
    const headers: HeadersInit = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // Make the POST request to download the file
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    // Check if the response is ok (status code in the range 200-299)
    if (!response.ok) {
      throw new Error(`Error downloading file: ${response.statusText}`);
    }

    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/["']/g, '')
      : 'downloaded_file'; 

    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

export default apiService;



