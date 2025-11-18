<template>
  <div class="meus-pacientes">
    <div class="caixa-pacientes">
      <h1>
        <span class="icon">&#128100;</span> Meus Pacientes
      </h1>

      <!-- Campos de pesquisa -->
      <div class="filtros">
        <input
          type="text"
          v-model="filtroNome"
          placeholder="Pesquisar por nome"
        />
        <input
          type="text"
          v-model="filtroCPF"
          placeholder="Pesquisar por CPF"
          maxlength="14"
        />
        <button class="btn-filtrar" @click="filtrarPacientes">Pesquisar</button>
        <button class="btn-limpar" @click="limparFiltros">Limpar</button>
      </div>

      <!-- Lista de pacientes -->
      <div class="tabela-container">
        <table class="tabela-pacientes">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Data de Nascimento</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(paciente, index) in pacientesFiltrados" 
              :key="index"
            >
              <td>{{ paciente.nome }}</td>
              <td>{{ formatarCPF(paciente.cpf) }}</td>
              <td>{{ formatarData(paciente.data_nascimento) }}</td>
              <td>{{ formatarTelefone(paciente.telefone) }}</td>
              <td>
                <button class="btn-detalhes" 
                        @click="$router.push(`/encaminhamentos-usuario/${paciente.id}`)"
                >
                  Detalhes
                </button>
              </td>
            </tr>

            <tr v-if="pacientesFiltrados.length === 0">
              <td colspan="5" class="nenhum">Nenhum paciente encontrado</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import userStore from '@/store/userStore';
import api from '@/services/api'; 

export default {
  name: "MeusPacientes",
  data() {
    return {
      filtroNome: "",
      filtroCPF: "",
      pacientes: [],           // pode manter o nome mesmo
      pacientesFiltrados: [],
      userStore
    };
  },
  methods: {
    filtrarPacientes() {
      this.pacientesFiltrados = this.pacientes.filter(p => {
        const nomeMatch = p.nome.toLowerCase().includes(this.filtroNome.toLowerCase());
        // Filtro por CPF (remove formatação para comparar apenas números)
        const cpfFiltroLimpo = this.filtroCPF.replace(/\D/g, '');
        const cpfPacienteLimpo = p.cpf ? p.cpf.replace(/\D/g, '') : '';
        const cpfMatch = !this.filtroCPF || cpfPacienteLimpo.includes(cpfFiltroLimpo);
        return nomeMatch && cpfMatch;
      });
    },
    async buscarPacientes() {
      try {
        const res = await api.get('/usuarios');
        console.log('Resposta da API:', res.data);
        
        let todosUsuarios = [];
        if (Array.isArray(res.data)) {
          todosUsuarios = res.data;
        } else if (res.data.usuarios && Array.isArray(res.data.usuarios)) {
          todosUsuarios = res.data.usuarios;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          todosUsuarios = res.data.data;
        } else {
          console.error('Formato de resposta inesperado:', res.data);
          todosUsuarios = [];
        }

        // **Removido filtro de tipo, agora mostra todos**
        this.pacientes = [...todosUsuarios];
        this.pacientesFiltrados = [...todosUsuarios];
        
        console.log('Todos os usuários:', this.pacientes);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        this.pacientes = [];
        this.pacientesFiltrados = [];
      }
    },
    limparFiltros() {
      this.filtroNome = "";
      this.filtroCPF = "";
      this.pacientesFiltrados = [...this.pacientes];
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
  max-width: 800px;
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
  text-align: left;
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
