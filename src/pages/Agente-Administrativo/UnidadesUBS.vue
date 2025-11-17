<template>
  <div class="meus-pacientes">
    <div class="caixa-pacientes">
      <h1>
        <span class="icon">&#128100;</span> Unidades de saúde
      </h1>

      <!-- Campos de pesquisa -->
      <div class="filtros">
        <input
          type="text"
          v-model="filtroNome"
          @input="filtrarPacientes"
          placeholder="Pesquisar por nome"
        />
        <button class="btn-limpar" @click="limparFiltros">Limpar Filtros</button>
      </div>

      <!-- Lista de pacientes -->
      <div class="tabela-container">
        <table class="tabela-pacientes">
          <thead>
            <tr>
              <th>Email</th>
              <th>Endereço</th>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(paciente, index) in pacientesFiltrados" :key="index">
              <td>{{ paciente.email || '-' }}</td>
              <td>{{ paciente.endereco || '-' }}</td>
              <td>{{ paciente.nome }}</td>
              <td>{{ formatarTelefone(paciente.telefone) }}</td>
              <td class="acoes">
                <button class="btn-editar" @click="editarUnidade(paciente)" title="Editar">
                  <i class="fi fi-rr-edit"></i>
                </button>
                <button class="btn-apagar" @click="confirmarExclusao(paciente)" title="Apagar">
                  <i class="fi fi-rr-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="pacientesFiltrados.length === 0">
              <td colspan="5" class="nenhum">Nenhuma unidade encontrada</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de edição -->
    <ModalEditaUnidade 
      :mostrar="mostrarModal" 
      :unidade="unidadeSelecionada" 
      @fechar="fecharModal"
      @atualizado="unidadeAtualizada"
    />
  </div>
</template>

<script>
import api from '@/services/api';
import ModalEditaUnidade from '@/components/ModalEditaUnidade.vue';

export default {
  name: "UnidadesUBS",
  components: {
    ModalEditaUnidade
  },
  data() {
    return {
      filtroNome: "",
      pacientes: [],
      pacientesFiltrados: [],
      mostrarModal: false,
      unidadeSelecionada: null
    };
  },
  methods: {
    filtrarPacientes() {
      this.pacientesFiltrados = this.pacientes.filter(p => {
        const nomeMatch = p.nome.toLowerCase().includes(this.filtroNome.toLowerCase());
        return nomeMatch;
      });
    },
    async buscarPacientes() {
        try {
          const res = await api.get('/unidades-saude');
          console.log('Pacientes recebidos:', res.data);
          this.pacientes = res.data;
          this.pacientesFiltrados = [...this.pacientes];
        } catch (error) {
          console.error('Erro ao buscar pacientes:', error);
        }
    },  
    limparFiltros() {
      this.filtroNome = "";
      this.pacientesFiltrados = [...this.pacientes];
    },
    verDetalhes(paciente) {
      alert(`Detalhes de ${paciente.nome}`);
    },
    formatarCPF(cpf) {
      if (!cpf) return '-';
      const apenasNumeros = cpf.replace(/\D/g, '');
      return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
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
    formatarTipo(tipo) {
      const tipos = {
        paciente: 'Paciente',
        agente: 'Agente',
        admin: 'Administrador'
      };
      return tipos[tipo] || tipo;
    },
    editarUnidade(unidade) {
      this.unidadeSelecionada = unidade;
      this.mostrarModal = true;
    },
    fecharModal() {
      this.mostrarModal = false;
      this.unidadeSelecionada = null;
    },
    unidadeAtualizada() {
      this.buscarPacientes();
    },
    async confirmarExclusao(unidade) {
      const confirmacao = confirm(`Tem certeza que deseja excluir a unidade ${unidade.nome}?`);
      
      if (confirmacao) {
        try {
          await api.delete(`/unidades-saude/${unidade.id}`);
          alert('Unidade excluída com sucesso!');
          this.buscarPacientes(); // Recarregar lista
        } catch (error) {
          console.error('Erro ao excluir unidade:', error);
          alert('Erro ao excluir unidade. Tente novamente.');
        }
      }
    }
  },
  mounted() {
    this.buscarPacientes();
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
  max-width: 1400px;
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
  overflow-x: auto;
  overflow-y: auto;
  max-height: 500px;
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
