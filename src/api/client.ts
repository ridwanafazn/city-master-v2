import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use((response) => {
  const processTime = response.headers['x-process-time'];
  if (processTime) {
    console.log(`%c[Backend Efficiency]: ${processTime}`, 'color: #3b82f6; font-weight: bold;');
  }
  return response;
})

export default apiClient