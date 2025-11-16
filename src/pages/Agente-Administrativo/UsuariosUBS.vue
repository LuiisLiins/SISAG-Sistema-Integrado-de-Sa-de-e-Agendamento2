<template>
  <div class="meus-pacientes">
    <div class="caixa-pacientes">
      <h1>
        <span class="icon">&#128100;</span> Usuarios
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
          v-model="filtroCPF"
          @input="filtrarPacientes"
          placeholder="Pesquisar por CPF"
          maxlength="14"
        />
        <button class="btn-limpar" @click="limparFiltros">Limpar Filtros</button>
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
              <th>Email</th>
              <th>Tipo</th>
              <th>Cidade</th>
              <th>UF</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(paciente, index) in pacientesFiltrados" :key="index">
              <td>{{ paciente.nome }}</td>
              <td>{{ formatarCPF(paciente.cpf) }}</td>
              <td>{{ formatarData(paciente.data_nascimento) }}</td>
              <td>{{ formatarTelefone(paciente.telefone) }}</td>
              <td>{{ paciente.email }}</td>
              <td>{{ formatarTipo(paciente.tipo) }}</td>
              <td>{{ paciente.cidade || '-' }}</td>
              <td>{{ paciente.uf || '-' }}</td>
              <td class="acoes">
                <button class="btn-editar" @click="editarUsuario(paciente)" title="Editar">
                  <i class="fi fi-rr-edit"></i>
                </button>
                <button class="btn-apagar" @click="confirmarExclusao(paciente)" title="Apagar">
                  <i class="fi fi-rr-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="pacientesFiltrados.length === 0">
              <td colspan="9" class="nenhum">Nenhum paciente encontrado</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de edição -->
    <ModalEditaUsuario 
      :mostrar="mostrarModal" 
      :usuario="usuarioSelecionado" 
      @fechar="fecharModal"
      @atualizado="usuarioAtualizado"
    />
  </div>
</template>

<script>
import api from '@/services/api';
import ModalEditaUsuario from '@/components/ModalEditaUsuario.vue';

export default {
  name: "MeusPacientes",
  components: {
    ModalEditaUsuario
  },
  data() {
    return {
      filtroNome: "",
      filtroCPF: "",
      pacientes: [],
      pacientesFiltrados: [],
      mostrarModal: false,
      usuarioSelecionado: null
    };
  },
  methods: {
    filtrarPacientes() {
      this.pacientesFiltrados = this.pacientes.filter(p => {
        const nomeMatch = p.nome.toLowerCase().includes(this.filtroNome.toLowerCase());
        
        let cpfMatch = true;
        if (this.filtroCPF) {
          const cpfUsuario = p.cpf ? p.cpf.replace(/\D/g, '') : '';
          const cpfFiltro = this.filtroCPF.replace(/\D/g, '');
          cpfMatch = cpfUsuario.includes(cpfFiltro);
        }
        
        return nomeMatch && cpfMatch;
      });
    },
    async buscarPacientes() {
        try {
          const res = await api.get('/usuarios');
          console.log('Pacientes recebidos:', res.data);
          this.pacientes = res.data;
          this.pacientesFiltrados = [...this.pacientes];
        } catch (error) {
          console.error('Erro ao buscar pacientes:', error);
        }
    },  
    limparFiltros() {
      this.filtroNome = "";
      this.filtroCPF = "";
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
    editarUsuario(usuario) {
      this.usuarioSelecionado = usuario;
      this.mostrarModal = true;
    },
    fecharModal() {
      this.mostrarModal = false;
      this.usuarioSelecionado = null;
    },
    usuarioAtualizado() {
      this.buscarPacientes();
    },
    async confirmarExclusao(usuario) {
      const confirmacao = confirm(`Tem certeza que deseja excluir o usuário ${usuario.nome}?`);
      
      if (confirmacao) {
        try {
          await api.delete(`/usuarios/${usuario.id}`);
          alert('Usuário excluído com sucesso!');
          this.buscarPacientes(); // Recarregar lista
        } catch (error) {
          console.error('Erro ao excluir usuário:', error);
          alert('Erro ao excluir usuário. Tente novamente.');
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
