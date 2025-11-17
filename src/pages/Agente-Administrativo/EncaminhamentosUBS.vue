<template>
  <div class="meus-pacientes">
    <div class="caixa-pacientes">
      <h1>
        <span class="icon">&#128100;</span> Encaminhamentos
      </h1>

      <!-- Campos de pesquisa -->
      <div class="filtros">
        <input
          type="text"
          v-model="filtroNome"
          @input="filtrarPacientes"
          placeholder="Pesquisar por nome"
        />
        <input
          type="text"
          v-model="filtroEspecialidade"
          @input="filtrarPacientes"
          placeholder="Pesquisar por especialidade"
        />
        <select v-model="filtroStatus" @change="filtrarPacientes">
          <option value="">Todos os status</option>
          <option value="Pendente">Pendente</option>
          <option value="Confirmado">Confirmado</option>
          <option value="Cancelado">Cancelado</option>
          <option value="Realizado">Realizado</option>
        </select>
        <input
          type="date"
          v-model="filtroData"
          @change="filtrarPacientes"
        />
        <button class="btn-limpar" @click="limparFiltros">Limpar Filtros</button>
      </div>

      <!-- Lista de pacientes -->
      <div class="tabela-container">
        <table class="tabela-pacientes">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Data de Solicitação</th>
              <th>Data de Agendamento</th>
              <th>Consulta / Especialidade</th>
              <th>Unidade de saúde</th>
              <th>Prioridade</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(encaminhamento, index) in pacientesFiltrados" :key="index">
              <td>{{ encaminhamento.usuario.nome}}</td>
              <td>{{ formatarData(encaminhamento.data_solicitacao) }}</td>
              <td>
                  {{ encaminhamento.data_agendamento
                      ? formatarData(encaminhamento.data_agendamento)
                      : 'Não agendado'
                  }}
              </td>
              <td>{{ encaminhamento.especialidade || '-' }}</td>
              <td>{{ encaminhamento.unidade.nome }}</td>
              <td>{{ encaminhamento.nivel_urgencia }}</td>
              <td>{{ encaminhamento.status || 'Pendente' }}</td>
              <td class="acoes">
                <button v-if="!encaminhamento.data_agendamento" class="btn-agendar" @click="agendarEncaminhamento(encaminhamento)" title="Agendar">
                  Agendar
                </button>
                <button v-else class="btn-info" @click="verInformacoes(encaminhamento)" title="Informações">
                  <i class="fi fi-rr-info"></i>
                </button>
                <button v-if="!encaminhamento.data_agendamento" class="btn-editar" @click="editarEncaminhamento(encaminhamento)" title="Editar">
                  <i class="fi fi-rr-edit"></i>
                </button>
                <button v-if="!encaminhamento.data_agendamento" class="btn-apagar" @click="confirmarExclusao(encaminhamento)" title="Apagar">
                  <i class="fi fi-rr-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="pacientesFiltrados.length === 0">
              <td colspan="8" class="nenhum">Nenhum encaminhamento encontrado</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de edição -->
    <ModalEditaEncaminhamento 
      :mostrar="mostrarModal" 
      :encaminhamento="encaminhamentoSelecionado" 
      @fechar="fecharModal"
      @atualizado="encaminhamentoAtualizado"
    />

    <!-- Modal de agendamento -->
    <ModalAgendarEncaminhamento 
      :mostrar="mostrarModalAgendamento" 
      :encaminhamento="encaminhamentoParaAgendar" 
      @fechar="fecharModalAgendamento"
      @agendado="encaminhamentoAtualizado"
    />

    <!-- Modal de informações -->
    <ModalInfoEncaminhamento 
      :mostrar="mostrarModalInfo" 
      :encaminhamento="encaminhamentoInfo" 
      @fechar="fecharModalInfo"
    />
  </div>
</template>

<script>
import api from '@/services/api';
import ModalEditaEncaminhamento from '@/components/ModalEditaEncaminhamento.vue';
import ModalAgendarEncaminhamento from '@/components/ModalAgendarEncaminhamento.vue';
import ModalInfoEncaminhamento from '@/components/ModalInfoEncaminhamento.vue';

export default {
  name: "MeusPacientes",
  components: {
    ModalEditaEncaminhamento,
    ModalAgendarEncaminhamento,
    ModalInfoEncaminhamento
  },
  data() {
    return {
      filtroNome: "",
      filtroData: "",
      filtroEspecialidade: "",
      filtroStatus: "",
      pacientes: [],
      pacientesFiltrados: [],
      mostrarModal: false,
      encaminhamentoSelecionado: null,
      mostrarModalAgendamento: false,
      encaminhamentoParaAgendar: null,
      mostrarModalInfo: false,
      encaminhamentoInfo: null,
    };
  },
  methods: {
    async buscarEncaminhamentos() {
      try {
        const res = await api.get('/encaminhamentos');
        this.pacientes = res.data || [];
        this.pacientesFiltrados = [...this.pacientes];
      } catch (error) {
        console.error('Erro ao buscar encaminhamentos:', error);
        this.pacientes = [];
        this.pacientesFiltrados = [];
      }
    },
    filtrarPacientes() {
      this.pacientesFiltrados = this.pacientes.filter(p => {
        const nomeMatch = !this.filtroNome || (p.usuario?.nome?.toLowerCase().includes(this.filtroNome.toLowerCase()));
        const dataMatch = !this.filtroData || p.data_solicitacao?.split('T')[0] === this.filtroData;
        const especialidadeMatch = !this.filtroEspecialidade || (p.especialidade?.toLowerCase().includes(this.filtroEspecialidade.toLowerCase()));
        const statusMatch = !this.filtroStatus || p.status === this.filtroStatus;
        
        return nomeMatch && dataMatch && especialidadeMatch && statusMatch;
      });
    },
    limparFiltros() {
      this.filtroNome = "";
      this.filtroData = "";
      this.filtroEspecialidade = "";
      this.filtroStatus = "";
      this.pacientesFiltrados = [...this.pacientes];
    },
    formatarTelefone(telefone) {
      if (!telefone) return '-';
      const apenasNumeros = telefone.replace(/\D/g, '');
      if (apenasNumeros.length === 11) {
        return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else if (apenasNumeros.length === 10) {
        return apenasNumeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
      return telefone;
    },
    formatarData(data) {
      if (!data) return '-';
      const dataLimpa = data.split('T')[0];
      const [ano, mes, dia] = dataLimpa.split('-');
      return `${dia}/${mes}/${ano}`;
    },
    verDetalhes(paciente) {
      alert(`Detalhes de ${paciente.nome}`);
    },
    editarEncaminhamento(encaminhamento) {
      this.encaminhamentoSelecionado = encaminhamento;
      this.mostrarModal = true;
    },
    fecharModal() {
      this.mostrarModal = false;
      this.encaminhamentoSelecionado = null;
    },
    agendarEncaminhamento(encaminhamento) {
      this.encaminhamentoParaAgendar = encaminhamento;
      this.mostrarModalAgendamento = true;
    },
    fecharModalAgendamento() {
      this.mostrarModalAgendamento = false;
      this.encaminhamentoParaAgendar = null;
    },
    verInformacoes(encaminhamento) {
      this.encaminhamentoInfo = encaminhamento;
      this.mostrarModalInfo = true;
    },
    fecharModalInfo() {
      this.mostrarModalInfo = false;
      this.encaminhamentoInfo = null;
    },
    encaminhamentoAtualizado() {
      this.buscarEncaminhamentos();
    },
    async confirmarExclusao(encaminhamento) {
      const confirmacao = confirm(`Tem certeza que deseja excluir o encaminhamento do paciente ${encaminhamento.usuario.nome}?`);
      
      if (confirmacao) {
        try {
          await api.delete(`/encaminhamentos/${encaminhamento.id}`);
          alert('Encaminhamento excluído com sucesso!');
          this.buscarEncaminhamentos();
        } catch (error) {
          console.error('Erro ao excluir encaminhamento:', error);
          alert('Erro ao excluir encaminhamento. Tente novamente.');
        }
      }
    }
  },
  mounted() {
    this.buscarEncaminhamentos();
  }
};
</script>

<style scoped>
.meus-pacientes {
  margin-left: 80px; /* mantém espaço para menu lateral */
  margin-top: 100px; /* abaixo do cabeçalho */
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: calc(100vh - 100px);
  padding: 20px;
}

.caixa-pacientes {
  background-color: #e3f2fd;
  padding: 30px 40px;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
}

h1 {
  color: #1565c0;
  font-size: 24px;
  text-align: center;
  margin-bottom: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.icon {
  font-size: 28px;
}

.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
  margin-bottom: 20px;
}

.filtros input {
  flex: 1;
  min-width: 200px;
  padding: 8px 10px;
  border: 1px solid #bbdefb;
  border-radius: 8px;
  font-size: 14px;
}

.btn-filtrar,
.btn-limpar {
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  color: #fff;
  transition: all 0.3s ease;
}

.btn-filtrar {
  background-color: #1565c0;
}

.btn-limpar {
  background-color: #9e9e9e;
}

.btn-filtrar:hover {
  background-color: #0d47a1;
  transform: scale(1.05);
}

.btn-limpar:hover {
  background-color: #757575;
  transform: scale(1.05);
}

.tabela-container {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
  border-radius: 8px;
  background-color: #fff;
  scrollbar-width: thin;
  scrollbar-color: #90caf9 #e3f2fd;
}

.tabela-container::-webkit-scrollbar {
  width: 8px;
}

.tabela-container::-webkit-scrollbar-track {
  background: #e3f2fd;
  border-radius: 8px;
}

.tabela-container::-webkit-scrollbar-thumb {
  background-color: #90caf9;
  border-radius: 8px;
}

.tabela-pacientes {
  width: 100%;
  border-collapse: collapse;
}

.tabela-pacientes th,
.tabela-pacientes td {
  padding: 10px 12px;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

.tabela-pacientes th {
  background-color: #bbdefb;
  color: #0d47a1;
  font-size: 14px;
}

.tabela-pacientes td {
  font-size: 14px;
}

.nenhum {
  text-align: center;
  color: #555;
  padding: 15px;
}

.btn-detalhes {
  background-color: #1565c0;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-detalhes:hover {
  background-color: #0d47a1;
  transform: scale(1.05);
}

.acoes {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-agendar,
.btn-info,
.btn-editar,
.btn-apagar {
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-agendar {
  background-color: #2e7d32;
  color: white;
  font-size: 13px;
  font-weight: 600;
}

.btn-agendar:hover {
  background-color: #1b5e20;
  transform: scale(1.1);
}

.btn-info {
  background-color: #0288d1;
  color: white;
}

.btn-info:hover {
  background-color: #01579b;
  transform: scale(1.1);
}

.btn-editar {
  background-color: #1565c0;
  color: white;
}

.btn-editar:hover {
  background-color: #0d47a1;
  transform: scale(1.1);
}

.btn-apagar {
  background-color: #d32f2f;
  color: white;
}

.btn-apagar:hover {
  background-color: #b71c1c;
  transform: scale(1.1);
}

.btn-editar i,
.btn-info i,
.btn-apagar i {
  font-size: 16px;
}

/* Responsividade */
@media (max-width: 768px) {
  .filtros {
    flex-direction: column;
  }
  .filtros input,
  .btn-filtrar,
  .btn-limpar {
    width: 100%;
  }
  .caixa-pacientes {
    padding: 20px;
  }
}
</style>
