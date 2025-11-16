import { reactive } from 'vue';

// Estado do usuário
const userStore = reactive({
  id: null,
  nome: '',
  email: '',
  cpf: '',
  rg: '',
  sexo: '',
  cartao_sus: '',
  estado_civil: '',
  tipo: '',
  telefone: '',
  data_nascimento: '',
  endereco: '',
  cidade: '',
  uf: '',
  cep: '',
  unidade_saude: null,
  isAuthenticated: false
});

// Inicializar a partir do localStorage
const init = () => {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    Object.assign(userStore, userData);
    userStore.isAuthenticated = true;
  }
};

// Fazer login
const login = (userData) => {
  userStore.id = userData.id;
  userStore.nome = userData.nome;
  userStore.email = userData.email;
  userStore.cpf = userData.cpf;
  userStore.rg = userData.rg || '';
  userStore.sexo = userData.sexo || '';
  userStore.cartao_sus = userData.cartao_sus || '';
  userStore.estado_civil = userData.estado_civil || '';
  userStore.tipo = userData.tipo;
  userStore.telefone = userData.telefone || '';
  userStore.data_nascimento = userData.data_nascimento || '';
  userStore.endereco = userData.endereco || '';
  userStore.cidade = userData.cidade || '';
  userStore.uf = userData.uf || '';
  userStore.cep = userData.cep || '';
  userStore.unidade_saude = userData.unidade_saude || null;
  userStore.isAuthenticated = true;
  
  localStorage.setItem('user', JSON.stringify(userData));
};

// Fazer logout
const logout = () => {
  userStore.id = null;
  userStore.nome = '';
  userStore.email = '';
  userStore.cpf = '';
  userStore.rg = '';
  userStore.sexo = '';
  userStore.cartao_sus = '';
  userStore.estado_civil = '';
  userStore.tipo = '';
  userStore.telefone = '';
  userStore.data_nascimento = '';
  userStore.endereco = '';
  userStore.cidade = '';
  userStore.uf = '';
  userStore.cep = '';
  userStore.unidade_saude = null;
  userStore.isAuthenticated = false;
  
  localStorage.removeItem('user');
};

// Inicializar
init();

export default userStore;
export { login, logout };


