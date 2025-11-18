<template>
  <div class="novo-encaminhamento">
    <div class="caixa-encaminhamento">
      <h1>Novo Encaminhamento</h1>

      <form class="encaminhamento-form" @submit.prevent="criarEncaminhamento">
        <div class="linha">
          <div class="form-group">
            <label>Paciente</label>
            <button type="button" class="btn-buscar-paciente" @click="abrirModalBusca">
              {{ pacienteSelecionado ? pacienteSelecionado.nome : 'Buscar Paciente' }}
              <i class="fi fi-rr-search"></i>
            </button>
          </div>
        </div>

                <div class="linha">
          <div class="form-group">
            <label>Unidade de Saúde</label>
            <select v-model="unidadeSaudeId" required>
              <option value="">Selecione uma unidade</option>
              <option v-for="unidade in unidades" :key="unidade.id" :value="unidade.id">
                {{ unidade.nome }}
              </option>
            </select>
          </div>
        </div>

                <div class="linha">
          <div class="form-group">
            <label>Nome da mãe</label>
            <input type="text" v-model="nomeMae" placeholder="Digite o nome da mãe" :disabled="nomeMae != ''"/>
          </div>
                    <div class="form-group">
            <label>Nome do pai</label>
            <input type="text" v-model="nomePai" placeholder="Digite o nome do pai" :disabled="nomePai != ''"/>
          </div>
        </div>

        <div class="linha">
          <div class="form-group">
            <label>Prioridade</label>
            <select v-model="prioridade">
              <option value="">Selecione</option>
              <option value="urgente">Urgência</option>
              <option value="eletivo">Eletivo</option>
              <option value="prioritario">Prioritário</option>
              <option value="emergente">Emergente</option>
            </select>
          </div>

          <div class="form-group">
            <label>Especialidade / Exame</label>
            <input type="text" v-model="especialidade" placeholder="Digite a especialidade ou exame" />
          </div>
        </div>

        <div class="linha">
          <div class="form-group">
            <label>Médico Solicitante</label>
            <input type="text" v-model="medico" placeholder="Digite o nome do médico" />
          </div>
        </div>

        <div class="linha">
          <div class="form-group">
            <label>Telefone para contato</label>
            <input type="tel" v-model="telefone" @input="formatarTelefone" placeholder="(xx) xxxxx-xxxx" maxlength="15" />
          </div>
        </div>

        <div class="linha">
          <div class="form-group">
            <label>Data de solicitação</label>
            <input type="date" v-model="dataSolicitacao" />
          </div>
        </div>

        <div class="form-group-checkbox">
          <label>
            <input type="checkbox" v-model="precisaTransporte" />
            Precisa de transporte?
          </label>
        </div>

                <div class="linha">
          <div class="form-group">
            <label>Observações gerais</label>
            <input type="text" v-model="observacoesGerais" placeholder="Digite suas observações" />
          </div>
        </div>

        <button type="submit" class="btn-confirmar" :disabled="carregando">
          {{ carregando ? 'Salvando...' : 'Salvar Encaminhamento' }}
        </button>
      </form>
    </div>

    <!-- Modal de busca de paciente -->
    <transition name="fade">
      <div v-if="mostrarModal" class="modal-overlay" @click="fecharModal">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2>Buscar Paciente</h2>
            <i class="fi fi-rr-cross-small" @click="fecharModal"></i>
          </div>

          <div class="modal-body">
            <div class="busca-campos">
              <input 
                type="text" 
                v-model="buscaNome" 
                @input="buscarPacientes"
                placeholder="Buscar por nome"
              />
              <input 
                type="text" 
                v-model="buscaCPF" 
                @input="buscarPacientes"
                placeholder="Buscar por CPF"
                maxlength="14"
              />
            </div>

            <div class="lista-pacientes">
              <div 
                v-for="paciente in pacientesFiltrados" 
                :key="paciente.id"
                class="paciente-item"
                @click="selecionarPaciente(paciente)"
              >
                <div class="paciente-info">
                  <strong>{{ paciente.nome }}</strong>
                  <span>CPF: {{ formatarCPF(paciente.cpf) }}</span>
                  <span>Data Nasc: {{ formatarData(paciente.data_nascimento) }}</span>
                </div>
              </div>
              <div v-if="pacientesFiltrados.length === 0" class="nenhum-resultado">
                Nenhum paciente encontrado
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: "AdicionarEncaminhamento",
  data() {
    return {
      mostrarModal: false,
      buscaNome: '',
      buscaCPF: '',
      pacientes: [],
      pacientesFiltrados: [],
      pacienteSelecionado: null,
      telefone: '',
      precisaTransporte: false,
      prioridade: '',
      especialidade: '',
      medico: '',
      carregando: false,
      unidades: [],
      unidadeSaudeId: ''
    };
  },
  computed: {
    nomeMae() {
      return this.pacienteSelecionado?.nome_mae || '';
    },
    nomePai() {
      return this.pacienteSelecionado?.nome_pai || '';
    }
  },
  mounted() {
    this.carregarUnidades();
  },
  methods: {
    abrirModalBusca() {
      this.mostrarModal = true;
      this.carregarPacientes();
    },
    async carregarUnidades() {
      try {
        const res = await api.get('/unidades-saude');
        this.unidades = res.data || [];
      } catch (error) {
        console.error('Erro ao carregar unidades:', error);
        this.unidades = [];
      }
    },
    fecharModal() {
      this.mostrarModal = false;
      this.buscaNome = '';
      this.buscaCPF = '';
    },
    async carregarPacientes() {
      try {
        const res = await api.get('/usuarios?tipo=paciente');
        this.pacientes = res.data.usuarios || res.data.data || res.data || [];
        this.pacientesFiltrados = [...this.pacientes];
      } catch (error) {
        console.error('Erro ao carregar pacientes:', error);
        this.pacientes = [];
        this.pacientesFiltrados = [];
      }
    },
    buscarPacientes() {
      if (!this.buscaNome && !this.buscaCPF) {
        this.pacientesFiltrados = [...this.pacientes];
        return;
      }

      this.pacientesFiltrados = this.pacientes.filter(p => {
        let nomeMatch = true;
        let cpfMatch = true;

        if (this.buscaNome) {
          nomeMatch = p.nome && p.nome.toLowerCase().includes(this.buscaNome.toLowerCase());
        }
        
        if (this.buscaCPF) {
          const cpfPaciente = p.cpf ? p.cpf.replace(/\D/g, '') : '';
          const cpfBusca = this.buscaCPF.replace(/\D/g, '');
          cpfMatch = cpfPaciente.includes(cpfBusca);
        }
        
        return nomeMatch && cpfMatch;
      });
    },
    selecionarPaciente(paciente) {
      console.log('Paciente selecionado:', paciente);
      console.log('Nome da mãe:', paciente.nome_mae);
      console.log('Nome do pai:', paciente.nome_pai);
      this.pacienteSelecionado = paciente;
      this.fecharModal();
    },
    formatarCPF(cpf) {
      if (!cpf) return '-';
      const apenasNumeros = cpf.replace(/\D/g, '');
      return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    },
    formatarData(data) {
      if (!data) return '-';
      const dataLimpa = data.split('T')[0];
      const [ano, mes, dia] = dataLimpa.split('-');
      return `${dia}/${mes}/${ano}`;
    },
    async criarEncaminhamento() {
      console.log(this.pacienteSelecionado);
      if (!this.pacienteSelecionado) {
        alert('Por favor, selecione um paciente.');
        return;
      }

      if (!this.prioridade || !this.especialidade) {
        alert('Por favor, preencha a prioridade e especialidade.');
        return;
      }

      this.carregando = true;

      try {
        const encaminhamento = {
          usuario_id: this.pacienteSelecionado.id,
          unidade_id: this.unidadeSaudeId,
          nivel_urgencia: this.prioridade,
          especialidade: this.especialidade,
          medico: this.medico,
          telefone: this.telefone.replace(/\D/g, ''),
          precisa_transporte: this.precisaTransporte,
          observacoes: this.observacoesGerais,
          dt_agendamento: this.dataAgendamento,
          dt_solicitacao: this.dataSolicitacao
        };

        await api.post('/encaminhamentos', encaminhamento);
        alert('Encaminhamento criado com sucesso!');
        
        // Limpar formulário
        this.pacienteSelecionado = null;
        this.unidadeSaudeId = '';
        this.prioridade = '';
        this.especialidade = '';
        this.medico = '';
        this.telefone = '';
        this.precisaTransporte = false;
        
      } catch (error) {
        console.error('Erro ao criar encaminhamento:', error);
        if (error.response?.status === 422) {
          alert('Dados inválidos. Verifique os campos e tente novamente.');
        } else {
          alert('Erro ao criar encaminhamento. Tente novamente.');
        }
      } finally {
        this.carregando = false;
      }
    },
    formatarTelefone(event) {
      let valor = event.target.value.replace(/\D/g, '');
      
      if (valor.length <= 11) {
        if (valor.length === 11) {
          valor = valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (valor.length === 10) {
          valor = valor.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else if (valor.length > 6) {
          valor = valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else if (valor.length > 2) {
          valor = valor.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        } else if (valor.length > 0) {
          valor = valor.replace(/(\d*)/, '($1');
        }
      }
      
      this.telefone = valor;
    }
  }
};
</script>

<style scoped>
.novo-encaminhamento {
  margin-left: 100px; /* espaço para o menu lateral */
  margin-top: 80px; /* espaço para o cabeçalho */
  min-height: calc(100vh - 100px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.caixa-encaminhamento {
  background-color: #e3f2fd;
  padding: 25px 35px;
  border-radius: 14px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 520px;
  text-align: left;
}

h1 {
  color: #1565c0;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 25px;
  text-align: center;
}

.encaminhamento-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.linha {
  display: flex;
  gap: 10px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 600;
  color: #0d47a1;
  margin-bottom: 4px;
  font-size: 14px;
}

input,
select {
  padding: 8px 10px;
  border: 1px solid #bbdefb;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
}

input:focus,
select:focus {
  border-color: #1565c0;
}

.form-group-checkbox {
  display: flex;
  align-items: center;
  margin: 10px 0;
}

.form-group-checkbox label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #0d47a1;
  font-size: 14px;
}

.form-group-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #1565c0;
}

.btn-transporte {
  background-color: #1565c0;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: fit-content;
}

.btn-transporte:hover {
  background-color: #0d47a1;
  transform: scale(1.05);
}

.btn-confirmar {
  background-color: #0d47a1;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 15px;
  width: 100%;
  transition: all 0.3s ease;
}

.btn-confirmar:hover {
  background-color: #083b88;
  transform: scale(1.02);
}

.btn-buscar-paciente {
  background-color: #fff;
  border: 1px solid #bbdefb;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  color: #333;
}

.btn-buscar-paciente:hover {
  border-color: #1565c0;
  background-color: #f5f5f5;
}

.btn-buscar-paciente i {
  margin-left: 8px;
  color: #1565c0;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: slideDown 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  background-color: #0d47a1;
  color: white;
  padding: 20px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.modal-header i {
  cursor: pointer;
  font-size: 24px;
  transition: transform 0.2s;
}

.modal-header i:hover {
  transform: rotate(90deg);
}

.modal-body {
  padding: 20px 25px;
  overflow-y: auto;
  flex: 1;
}

.busca-campos {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.busca-campos input {
  flex: 1;
}

.lista-pacientes {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.paciente-item {
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.paciente-item:hover {
  background-color: #e3f2fd;
  border-color: #1565c0;
  transform: translateX(5px);
}

.paciente-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.paciente-info strong {
  color: #0d47a1;
  font-size: 16px;
}

.paciente-info span {
  color: #666;
  font-size: 14px;
}

.nenhum-resultado {
  text-align: center;
  color: #999;
  padding: 30px;
  font-style: italic;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.lista-pacientes::-webkit-scrollbar {
  width: 8px;
}

.lista-pacientes::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 8px;
}

.lista-pacientes::-webkit-scrollbar-thumb {
  background-color: #90caf9;
  border-radius: 8px;
}
</style>
