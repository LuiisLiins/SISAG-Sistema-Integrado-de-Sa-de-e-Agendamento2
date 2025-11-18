import { createRouter, createWebHistory } from 'vue-router'

// Login
import Login from '@/pages/TelaLogin.vue'

// Cabeçalho e menu
import MenuCabe from '@/components/MenuCabe.vue'

// Telas principais
import TelaInicial from '@/pages/Paciente/TelaInicial.vue'
import TelaAgendamentos from '@/pages/Paciente/TelaAgendamentos.vue'
import TelaCadastro from '@/pages/Paciente/TelaCadastro.vue'
import TelaInformacoes from '@/pages/Paciente/TelaInformacoes.vue'
import MeusPacientes from '@/pages/Agente-Administrativo/TelaPacientes.vue'
import AdicionarEncaminhamento from '@/pages/Agente-Administrativo/Adicionar.vue'
import EncaminhamentosUBS from '@/pages/Agente-Administrativo/EncaminhamentosUBS.vue'
import AdicionarUsuario from '@/pages/Agente-Administrativo/AdicionarUsuario.vue'
import TelaEncaminhamentosUsuario from '@/pages/Agente-Administrativo/TelaEncaminhamentosUsuario.vue'

// Componentes internos de Agendamentos
import ListaAgendamentos from '@/components/Agendamentos.vue'
import HistoricoEncaminhamentos from '@/components/Historico.vue'
import UsuariosUBS from '@/pages/Agente-Administrativo/UsuariosUBS.vue'
import AdicionarUnidade from '@/pages/Agente-Administrativo/AdicionarUnidade.vue'
import UnidadesUBS from '@/pages/Agente-Administrativo/UnidadesUBS.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
  path: '/menu',
  component: MenuCabe,
  children: [
    { path: '', redirect: '/menu/inicial' },
    { path: 'inicial', name: 'TelaInicial', component: TelaInicial, meta: { title: 'Início' } },
    {
      path: 'agendamentos',
      name: 'TelaAgendamentos',
      component: TelaAgendamentos,
      meta: { title: 'Agendamentos' },
      children: [
        { path: '', redirect: '/menu/agendamentos/lista' },
        { path: 'lista', name: 'Agendamentos', component: ListaAgendamentos, meta: { title: 'Lista de Agendamentos' } },
        { path: 'historico', name: 'Historico', component: HistoricoEncaminhamentos, meta: { title: 'Histórico de Encaminhamentos' } }
      ]
    },
    { path: 'cadastro', name: 'TelaCadastro', component: TelaCadastro, meta: { title: 'Cadastro' } },
    { path: 'adicionar', name: 'AdicionarEncaminhamento', component: AdicionarEncaminhamento, meta: { title: 'Adicionar Encaminhamento' } },
    { path: 'adicionar-usuario', name: 'AdicionarUsuario', component: AdicionarUsuario, meta: { title: 'Adicionar Usuário' } },
    { path: 'adicionar-unidade', name: 'AdicionarUnidade', component: AdicionarUnidade, meta: { title: 'Adicionar Unidade' } },
    { path: 'usuarios-ubs', name: 'UsuariosUBS', component: UsuariosUBS, meta: { title: 'Usuários da UBS' } },
    { path: 'unidades-saude', name: 'UnidadesSaude', component: UnidadesUBS, meta: { title: 'Unidades de Saúde' } },
    { path: 'meus-pacientes', name: 'MeusPacientes', component: MeusPacientes, meta: { title: 'Meus Pacientes' } },
    { path: 'encaminhamentos-ubs', name: 'EncaminhamentosUBS', component: EncaminhamentosUBS, meta: { title: 'Encaminhamentos UBS' } }
  ]
},
  {
    path: '/informacoes',
    name: 'TelaInformacoes',
    component: TelaInformacoes
  },
  {
    path: '/encaminhamentos-usuario/:id',
    name: 'TelaEncaminhamentosUsuario',
    component: TelaEncaminhamentosUsuario
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
