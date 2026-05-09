import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor untuk memantau performa backend
apiClient.interceptors.response.use((response) => {
  const processTime = response.headers['x-process-time'];
  if (processTime) {
    console.log(`%c[Backend Efficiency]: ${processTime}`, 'color: #3b82f6; font-weight: bold;');
  }
  return response;
})

export default apiClient