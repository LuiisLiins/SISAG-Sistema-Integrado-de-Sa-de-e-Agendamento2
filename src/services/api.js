import axios from 'axios';

// Configuração base do Axios
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor de resposta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Tratamento de erros globais
    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Acesso negado');
          break;
        case 404:
          console.error('Recurso não encontrado');
          break;
        case 500:
          console.error('Erro interno do servidor');
          break;
        default:
          console.error('Erro na requisição:', error.response.data);
      }
    } else if (error.request) {
      console.error('Erro de conexão com o servidor');
    } else {
      console.error('Erro:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
