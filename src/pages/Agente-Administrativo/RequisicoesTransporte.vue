<template>
  <div class="requisicoes-transporte">
    <div class="caixa-requisicoes">
      <h1>
        <i class="fi fi-rr-bus"></i> Requisições de Transporte
      </h1>

      <!-- Filtros -->
      <div class="filtros">
        <input
          type="text"
          v-model="filtroNome"
          @input="filtrarRequisicoes"
          placeholder="Pesquisar por nome do paciente"
        />
        <input
          type="date"
          v-model="filtroData"
          @change="filtrarRequisicoes"
        />
        <select v-model="filtroUnidade" @change="filtrarRequisicoes">
          <option value="">Todas as unidades</option>
          <option v-for="unidade in unidadesUnicas" :key="unidade" :value="unidade">
            {{ unidade }}
          </option>
        </select>
        <button class="btn-limpar" @click="limparFiltros">Limpar Filtros</button>
      </div>

      <!-- Tabela de requisições -->
      <div class="tabela-container">
        <table class="tabela-requisicoes">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Data da Consulta</th>
              <th>Horário</th>
              <th>Especialidade</th>
              <th>Unidade de Destino</th>
              <th>Endereço</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in requisicoesFiltradasPaginadas" :key="req.id">
              <td>{{ req.usuario?.nome || '-' }}</td>
              <td>{{ formatarData(req.data_agendamento) }}</td>
              <td>{{ req.horario || '-' }}</td>
              <td>{{ req.especialidade || '-' }}</td>
              <td>{{ req.unidade_agendamento?.nome || '-' }}</td>
              <td>{{ req.unidade_agendamento.endereco || '-' }}</td>
              <td>
                <span class="badge" :class="'badge-' + req.status?.toLowerCase()">
                  {{ req.status || 'Pendente' }}
                </span>
              </td>
              <td class="acoes">
                <button 
                  v-if="!req.transporte_id" 
                  class="btn-enviar" 
                  @click="abrirModalTransporte(req)" 
                  title="Enviar Veículo"
                >
                  <i class="fi fi-rr-truck-side"></i>
                  Enviar Veículo
                </button>
                <button 
                  v-else 
                  class="btn-info" 
                  @click="abrirModalInfoTransporte(req)" 
                  title="Ver Informações do Transporte"
                >
                  <i class="fi fi-rr-info"></i>
                  Ver Transporte
                </button>
              </td>
            </tr>
            <tr v-if="requisicoesFiltradasPaginadas.length === 0">
              <td colspan="8" class="nenhum">Nenhuma requisição de transporte encontrada</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginação -->
      <div class="paginacao" v-if="totalPaginas > 1">
        <button @click="mudarPagina(paginaAtual - 1)" :disabled="paginaAtual === 1">
          <i class="fi fi-rr-angle-left"></i>
        </button>
        <span>Página {{ paginaAtual }} de {{ totalPaginas }}</span>
        <button @click="mudarPagina(paginaAtual + 1)" :disabled="paginaAtual === totalPaginas">
          <i class="fi fi-rr-angle-right"></i>
        </button>
      </div>
    </div>

    <!-- Modal de Cadastro de Transporte -->
    <transition name="fade">
      <div v-if="mostrarModalTransporte" class="modal-overlay" @click="fecharModalTransporte">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2>Enviar Veículo</h2>
            <i class="fi fi-rr-cross-small" @click="fecharModalTransporte"></i>
          </div>

          <div class="modal-content">
            <div class="info-paciente">
              <h3>Informações do Paciente</h3>
              <p><strong>Nome:</strong> {{ encaminhamentoSelecionado?.usuario?.nome }}</p>
              <p><strong>Data da Consulta:</strong> {{ formatarData(encaminhamentoSelecionado?.data_agendamento) }} às {{ encaminhamentoSelecionado?.horario_atendimento }}</p>
              <p><strong>Destino:</strong> {{ encaminhamentoSelecionado?.unidade_agendamento?.nome }}</p>
              <p><strong>Endereço:</strong> {{ encaminhamentoSelecionado?.endereco_atendimento }}</p>
            </div>

            <form @submit.prevent="cadastrarTransporte" class="form-transporte">
              <div class="form-group">
                <label>Tipo de Transporte *</label>
                <select v-model="dadosTransporte.tipoTransporte" required>
                  <option value="">Selecione o tipo</option>
                  <option value="Ambulância">Ambulância</option>
                  <option value="Van">Van</option>
                  <option value="Ônibus">Ônibus</option>
                  <option value="Carro">Carro</option>
                </select>
              </div>

              <div class="form-group">
                <label>Placa do Veículo *</label>
                <input type="text" v-model="dadosTransporte.placa" required placeholder="ABC-1234" />
              </div>

              <div class="form-group">
                <label>Motorista *</label>
                <input type="text" v-model="dadosTransporte.motorista" required placeholder="Nome do motorista" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Data de Saída *</label>
                  <input type="date" v-model="dadosTransporte.dataSaida" required />
                </div>

                <div class="form-group">
                  <label>Horário de Saída *</label>
                  <input type="time" v-model="dadosTransporte.horarioSaida" required />
                </div>
              </div>

              <div class="form-group">
                <label>Observações</label>
                <textarea v-model="dadosTransporte.observacoes" placeholder="Observações adicionais" rows="3"></textarea>
              </div>

              <div class="modal-acoes">
                <button type="button" class="btn-cancelar" @click="fecharModalTransporte">Cancelar</button>
                <button type="submit" class="btn-confirmar" :disabled="carregando">
                  {{ carregando ? 'Cadastrando...' : 'Confirmar Envio' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal de Informações do Transporte -->
    <transition name="fade">
      <div v-if="mostrarModalInfo" class="modal-overlay" @click="fecharModalInfo">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2><i class="fi fi-rr-info"></i> Informações do Transporte</h2>
            <i class="fi fi-rr-cross-small" @click="fecharModalInfo"></i>
          </div>

          <div class="modal-content">
            <div class="info-paciente">
              <h3>Informações do Paciente</h3>
              <p><strong>Nome:</strong> {{ encaminhamentoSelecionado?.usuario?.nome }}</p>
              <p><strong>Data da Consulta:</strong> {{ formatarData(encaminhamentoSelecionado?.data_agendamento) }} às {{ encaminhamentoSelecionado?.horario }}</p>
              <p><strong>Destino:</strong> {{ encaminhamentoSelecionado?.unidade_agendamento?.nome }}</p>
              <p><strong>Endereço:</strong> {{ encaminhamentoSelecionado?.endereco_atendimento }}</p>
            </div>

            <div class="info-transporte" v-if="transporteInfo">
              <h3>Dados do Transporte</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Tipo de Veículo:</label>
                  <span>{{ transporteInfo.tipo_veiculo || '-' }}</span>
                </div>
                <div class="info-item">
                  <label>Placa:</label>
                  <span>{{ transporteInfo.placa_veiculo || '-' }}</span>
                </div>
                <div class="info-item">
                  <label>Motorista:</label>
                  <span>{{ transporteInfo.motorista || '-' }}</span>
                </div>
                <div class="info-item">
                  <label>Data de Saída:</label>
                  <span>{{ formatarData(transporteInfo.data_saida) }}</span>
                </div>
                <div class="info-item">
                  <label>Horário de Saída:</label>
                  <span>{{ transporteInfo.horario_saida || '-' }}</span>
                </div>
                <div class="info-item full" v-if="transporteInfo.observacoes">
                  <label>Observações:</label>
                  <span>{{ transporteInfo.observacoes }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-fechar" @click="fecharModalInfo">
              <i class="fi fi-rr-cross"></i>
              Fechar
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import api from '@/services/api';
import { useNotification } from '@/composables/useNotification';
import { addNotification } from '@/store/notificationStore';

export default {
  name: "RequisicoesTransporte",
  data() {
    return {
      filtroNome: "",
      filtroData: "",
      filtroUnidade: "",
      requisicoes: [],
      requisicoesFiltradasLista: [],
      mostrarModalTransporte: false,
      mostrarModalInfo: false,
      encaminhamentoSelecionado: null,
      transporteInfo: null,
      paginaAtual: 1,
      itensPorPagina: 10,
      carregando: false,
      dadosTransporte: {
        tipoTransporte: '',
        placa: '',
        motorista: '',
        dataSaida: '',
        horarioSaida: '',
        observacoes: ''
      },
      notification: useNotification()
    };
  },
  computed: {
    requisicoesFiltradasPaginadas() {
      const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
      const fim = inicio + this.itensPorPagina;
      return this.requisicoesFiltradasLista.slice(inicio, fim);
    },
    totalPaginas() {
      return Math.ceil(this.requisicoesFiltradasLista.length / this.itensPorPagina);
    },
    unidadesUnicas() {
      const unidades = this.requisicoes
        .map(req => req.unidade_agendamento?.nome)
        .filter(nome => nome);
      return [...new Set(unidades)].sort();
    }
  },
  methods: {
    async buscarRequisicoes() {
      try {
        const res = await api.get('/encaminhamentos');
        this.requisicoes = (res.data || []).filter(enc => enc.precisa_transporte === 1);
        this.filtrarRequisicoes();
      } catch (error) {
        console.error('Erro ao buscar requisições:', error);
        this.requisicoes = [];
        this.requisicoesFiltradasLista = [];
      }
    },
    filtrarRequisicoes() {
      this.requisicoesFiltradasLista = this.requisicoes.filter(req => {
        const nomeMatch = !this.filtroNome || (req.usuario?.nome?.toLowerCase().includes(this.filtroNome.toLowerCase()));
        const dataMatch = !this.filtroData || req.data_agendamento?.split('T')[0] === this.filtroData;
        const unidadeMatch = !this.filtroUnidade || req.unidade_agendamento?.nome === this.filtroUnidade;
        
        return nomeMatch && dataMatch && unidadeMatch;
      });
      this.paginaAtual = 1;
    },
    limparFiltros() {
      this.filtroNome = "";
      this.filtroData = "";
      this.filtroUnidade = "";
      this.requisicoesFiltradasLista = [...this.requisicoes];
      this.paginaAtual = 1;
    },
    formatarData(data) {
      if (!data) return '-';
      const dataLimpa = data.split('T')[0];
      const [ano, mes, dia] = dataLimpa.split('-');
      return `${dia}/${mes}/${ano}`;
    },
    abrirModalTransporte(requisicao) {
      this.encaminhamentoSelecionado = requisicao;
      this.mostrarModalTransporte = true;
      // Preencher data e horário da consulta como padrão
      if (requisicao.data_agendamento) {
        this.dadosTransporte.dataSaida = requisicao.data_agendamento.split('T')[0];
      }
      if (requisicao.horario_atendimento) {
        const horario = requisicao.horario_atendimento.split(':');
        // Sugerir 1 hora antes
        const horaAntes = parseInt(horario[0]) - 1;
        this.dadosTransporte.horarioSaida = `${String(horaAntes).padStart(2, '0')}:${horario[1]}`;
      }
    },
    fecharModalTransporte() {
      this.mostrarModalTransporte = false;
      this.encaminhamentoSelecionado = null;
      this.dadosTransporte = {
        tipoTransporte: '',
        placa: '',
        motorista: '',
        dataSaida: '',
        horarioSaida: '',
        observacoes: ''
      };
    },
    async cadastrarTransporte() {
      if (!this.encaminhamentoSelecionado?.id) return;

      this.carregando = true;

      try {
        // Cadastrar o transporte
        const resTransporte = await api.post('/transporte', {
        //   encaminhamento_id: this.encaminhamentoSelecionado.id,
        //   usuario_id: this.encaminhamentoSelecionado.usuario_id,
          tipo_veiculo: this.dadosTransporte.tipoTransporte,
          placa_veiculo: this.dadosTransporte.placa,
          motorista: this.dadosTransporte.motorista,
          data_saida: this.dadosTransporte.dataSaida,
          horario_saida: this.dadosTransporte.horarioSaida,
        //   endereco_partida: this.encaminhamentoSelecionado.usuario?.endereco || '',
        //   endereco_destino: this.encaminhamentoSelecionado.endereco_atendimento,
          observacoes: this.dadosTransporte.observacoes,
          status: 'Confirmado'
        });

        // Pegar o ID do transporte criado
        const transporteId = resTransporte.data.id || resTransporte.data.transporte?.id;
        console.log(transporteId)

        // Atualizar o encaminhamento com o transporte_id
        if (transporteId) {
          await api.put(`/encaminhamentos/${this.encaminhamentoSelecionado.id}`, {
            transporte_id: transporteId
          });
        }

        // Criar notificação para o paciente
        addNotification({
          tipo: 'lembrete',
          titulo: 'Transporte Confirmado',
          mensagem: `Seu transporte foi confirmado! Veículo: ${this.dadosTransporte.tipoTransporte}, Placa: ${this.dadosTransporte.placa}, Motorista: ${this.dadosTransporte.motorista}. Saída às ${this.dadosTransporte.horarioSaida} do dia ${this.formatarData(this.dadosTransporte.dataSaida)}.`,
          usuario_id: this.encaminhamentoSelecionado.usuario_id
        });

        this.notification.success('Transporte cadastrado com sucesso!');
        this.fecharModalTransporte();
        this.buscarRequisicoes();
      } catch (error) {
        console.error('Erro ao cadastrar transporte:', error);
        this.notification.error('Erro ao cadastrar transporte. Tente novamente.');
      } finally {
        this.carregando = false;
      }
    },
    mudarPagina(novaPagina) {
      if (novaPagina >= 1 && novaPagina <= this.totalPaginas) {
        this.paginaAtual = novaPagina;
      }
    },
    async abrirModalInfoTransporte(requisicao) {
      this.encaminhamentoSelecionado = requisicao;
      
      // Buscar informações do transporte
      try {
        const res = await api.get(`/transporte/${requisicao.transporte_id}`);
        this.transporteInfo = res.data;
        this.mostrarModalInfo = true;
      } catch (error) {
        console.error('Erro ao buscar informações do transporte:', error);
        this.notification.error('Erro ao carregar informações do transporte.');
      }
    },
    fecharModalInfo() {
      this.mostrarModalInfo = false;
      this.encaminhamentoSelecionado = null;
      this.transporteInfo = null;
    }
  },
  mounted() {
    this.buscarRequisicoes();
  }
};
</script>

<style scoped>
.requisicoes-transporte {
  margin-left: 80px;
  margin-top: 100px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: calc(100vh - 100px);
  padding: 20px;
}

.caixa-requisicoes {
  background-color: #e3f2fd;
  padding: 30px 40px;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1200px;
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
  gap: 10px;
}

h1 i {
  font-size: 28px;
}

.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
  margin-bottom: 20px;
}

.filtros input,
.filtros select {
  flex: 1;
  min-width: 200px;
  padding: 8px 10px;
  border: 1px solid #bbdefb;
  border-radius: 8px;
  font-size: 14px;
}

.btn-limpar {
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  color: #fff;
  background-color: #9e9e9e;
  transition: all 0.3s ease;
}

.btn-limpar:hover {
  background-color: #757575;
  transform: scale(1.05);
}

.tabela-container {
  flex: 1;
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

.tabela-requisicoes {
  width: 100%;
  border-collapse: collapse;
}

.tabela-requisicoes th,
.tabela-requisicoes td {
  padding: 10px 12px;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

.tabela-requisicoes th {
  background-color: #bbdefb;
  color: #0d47a1;
  font-size: 14px;
  font-weight: 600;
}

.tabela-requisicoes td {
  font-size: 14px;
}

.nenhum {
  text-align: center;
  color: #555;
  padding: 30px;
  font-style: italic;
}

.badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-agendado {
  background-color: #e3f2fd;
  color: #1565c0;
}

.badge-confirmado {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.badge-pendente {
  background-color: #fff3e0;
  color: #f57c00;
}

.acoes {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-enviar {
  background-color: #2e7d32;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 600;
  font-size: 13px;
}

.btn-enviar:hover {
  background-color: #1b5e20;
  transform: scale(1.05);
}

.btn-enviar i {
  font-size: 16px;
}

.btn-info {
  background-color: #1565c0;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 600;
  font-size: 13px;
}

.btn-info:hover {
  background-color: #0d47a1;
  transform: scale(1.05);
}

.btn-info i {
  font-size: 16px;
}

.paginacao {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  padding: 15px;
}

.paginacao button {
  background-color: #1565c0;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.paginacao button:hover:not(:disabled) {
  background-color: #0d47a1;
  transform: scale(1.1);
}

.paginacao button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.paginacao span {
  font-weight: 600;
  color: #0d47a1;
}

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
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: slideDown 0.3s ease-out;
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
  border-radius: 12px 12px 0 0;
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

.modal-content {
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-paciente {
  background-color: #e3f2fd;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #1565c0;
}

.info-paciente h3 {
  margin: 0 0 10px 0;
  color: #0d47a1;
  font-size: 16px;
}

.info-paciente p {
  margin: 5px 0;
  font-size: 14px;
  color: #333;
}

.info-paciente strong {
  color: #0d47a1;
}

.form-transporte {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 600;
  color: #0d47a1;
  font-size: 14px;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 10px;
  border: 1px solid #bbdefb;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #1565c0;
}

.form-group select {
  cursor: pointer;
  background-color: white;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
}

.modal-acoes {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 10px;
}

.btn-cancelar,
.btn-confirmar {
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancelar {
  background-color: #9e9e9e;
  color: white;
}

.btn-cancelar:hover {
  background-color: #757575;
}

.btn-confirmar {
  background-color: #2e7d32;
  color: white;
}

.btn-confirmar:hover {
  background-color: #1b5e20;
}

.btn-confirmar:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.info-transporte {
  background-color: #e3f2fd;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #1565c0;
}

.info-transporte h3 {
  margin: 0 0 15px 0;
  color: #0d47a1;
  font-size: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item.full {
  grid-column: 1 / -1;
}

.info-item label {
  font-size: 12px;
  font-weight: 600;
  color: #0d47a1;
  text-transform: uppercase;
}

.info-item span {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.modal-footer {
  padding: 15px 25px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
}

.btn-fechar {
  background-color: #757575;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-fechar:hover {
  background-color: #616161;
}

.btn-fechar i {
  font-size: 16px;
}

@media (max-width: 768px) {
  .filtros {
    flex-direction: column;
  }
  .filtros input,
  .filtros select,
  .btn-limpar {
    width: 100%;
  }
  .caixa-requisicoes {
    padding: 20px;
  }
  .form-row {
    flex-direction: column;
  }
  .modal-container {
    width: 95%;
  }
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
