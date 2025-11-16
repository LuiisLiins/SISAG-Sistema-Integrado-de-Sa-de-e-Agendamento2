import { reactive } from 'vue';

// Estado do usuário
const userStore = reactive({
  nome: '',
  email: '',
  cpf: '',
  tipo: '',
  isAuthenticated: false
});

// Inicializar a partir do localStorage
const init = () => {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    userStore.nome = userData.nome;
    userStore.email = userData.email;
    userStore.cpf = userData.cpf;
    userStore.tipo = userData.tipo;
    userStore.isAuthenticated = true;
  }
};

// Fazer login
const login = (userData) => {
  userStore.nome = userData.nome;
  userStore.email = userData.email;
  userStore.cpf = userData.cpf;
  userStore.tipo = userData.tipo;
  userStore.isAuthenticated = true;
  
  localStorage.setItem('user', JSON.stringify(userData));
};

// Fazer logout
const logout = () => {
  userStore.nome = '';
  userStore.email = '';
  userStore.cpf = '';
  userStore.tipo = '';
  userStore.isAuthenticated = false;
  
  localStorage.removeItem('user');
};

// Inicializar
init();

export default userStore;
export { login, logout };

