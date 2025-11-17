<template>
  <transition name="fade">
    <div v-if="mostrar" class="modal-overlay" @click="fechar">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2>Informações do Encaminhamento</h2>
          <i class="fi fi-rr-cross-small" @click="fechar"></i>
        </div>

        <div class="modal-content">
          <!-- Dados do Paciente -->
          <div class="info-section">
            <h3>Dados do Paciente</h3>
            
            <div class="info-linha">
              <div class="info-item">
                <label>Nome:</label>
                <span>{{ encaminhamento?.usuario?.nome || '-' }}</span>
              </div>
            </div>

            <div class="info-linha">
              <div class="info-item">
                <label>CPF:</label>
                <span>{{ formatarCPF(encaminhamento?.usuario?.cpf) }}</span>
              </div>
              <div class="info-item">
                <label>Telefone:</label>
                <span>{{ formatarTelefone(encaminhamento?.usuario?.telefone) }}</span>
              </div>
            </div>

            <div class="info-linha">
              <div class="info-item">
                <label>Email:</label>
                <span>{{ encaminhamento?.usuario?.email || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- Dados do Encaminhamento -->
          <div class="info-section">
            <h3>Dados do Encaminhamento</h3>
            
            <div class="info-linha">
              <div class="info-item">
                <label>Data de Solicitação:</label>
                <span>{{ formatarData(encaminhamento?.data_solicitacao) }}</span>
              </div>
              <div class="info-item">
                <label>Data de Agendamento:</label>
                <span>{{ encaminhamento?.data_agendamento ? formatarData(encaminhamento.data_agendamento) : 'Não agendado' }}</span>
              </div>
            </div>

            <div class="info-linha">
              <div class="info-item">
                <label>Especialidade / Consulta:</label>
                <span>{{ encaminhamento?.especialidade || '-' }}</span>
              </div>
            </div>

            <div class="info-linha">
              <div class="info-item">
                <label>Unidade de Saúde:</label>
                <span>{{ encaminhamento?.unidade?.nome || '-' }}</span>
              </div>
            </div>

            <div class="info-linha">
              <div class="info-item">
                <label>Nível de Urgência:</label>
                <span :class="getBadgeClass(encaminhamento?.nivel_urgencia)">
                  {{ encaminhamento?.nivel_urgencia || '-' }}
                </span>
              </div>
              <div class="info-item">
                <label>Status:</label>
                <span :class="getBadgeClass(encaminhamento?.status)">
                  {{ encaminhamento?.status || 'Pendente' }}
                </span>
              </div>
            </div>

            <div class="info-linha" v-if="encaminhamento?.observacoes">
              <div class="info-item full">
                <label>Observações:</label>
                <span class="observacoes">{{ encaminhamento.observacoes }}</span>
              </div>
            </div>
          </div>

          <div class="modal-acoes">
            <button type="button" class="btn-fechar" @click="fechar">Fechar</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ModalInfoEncaminhamento',
  props: {
    mostrar: {
      type: Boolean,
      default: false
    },
    encaminhamento: {
      type: Object,
      default: null
    }
  },
  methods: {
    formatarData(data) {
      if (!data) return '-';
      const dataLimpa = data.split('T')[0];
      const [ano, mes, dia] = dataLimpa.split('-');
      return `${dia}/${mes}/${ano}`;
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
    getBadgeClass(valor) {
      const badges = {
        'urgente': 'badge badge-urgente',
        'emergente': 'badge badge-emergente',
        'prioritario': 'badge badge-prioritario',
        'eletivo': 'badge badge-eletivo',
        'Pendente': 'badge badge-pendente',
        'Agendado': 'badge badge-agendado',
        'Concluido': 'badge badge-concluido',
        'Cancelado': 'badge badge-cancelado',
        'Perdido': 'badge badge-perdido'
      };
      return badges[valor] || '';
    },
    fechar() {
      this.$emit('fechar');
    }
  }
};
</script>

<style scoped>
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
  max-width: 800px;
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
  gap: 25px;
}

.info-section {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.info-section h3 {
  color: #0d47a1;
  font-size: 18px;
  margin-bottom: 15px;
  border-bottom: 2px solid #bbdefb;
  padding-bottom: 8px;
  margin-top: 0;
}

.info-linha {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}

.info-linha:last-child {
  margin-bottom: 0;
}

.info-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item.full {
  flex: 1 1 100%;
}

.info-item label {
  font-weight: 600;
  color: #0d47a1;
  font-size: 13px;
}

.info-item span {
  color: #333;
  font-size: 14px;
  padding: 10px 12px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.info-item span.observacoes {
  min-height: 60px;
  white-space: pre-wrap;
}

.badge {
  display: inline-block;
  padding: 10px 12px;
  border-radius: 6px;
  font-weight: 600;
  text-align: center;
  font-size: 13px;
}

.badge-urgente {
  background-color: #d32f2f;
  color: white;
}

.badge-emergente {
  background-color: #f57c00;
  color: white;
}

.badge-prioritario {
  background-color: #fbc02d;
  color: #333;
}

.badge-eletivo {
  background-color: #388e3c;
  color: white;
}

.badge-pendente {
  background-color: #ff9800;
  color: white;
}

.badge-agendado {
  background-color: #2196f3;
  color: white;
}

.badge-concluido {
  background-color: #4caf50;
  color: white;
}

.badge-cancelado {
  background-color: #9e9e9e;
  color: white;
}

.badge-perdido {
  background-color: #e91e63;
  color: white;
}

.modal-acoes {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 10px;
}

.btn-fechar {
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #0d47a1;
  color: white;
}

.btn-fechar:hover {
  background-color: #083b88;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scrollbar customizada */
.modal-container::-webkit-scrollbar {
  width: 8px;
}

.modal-container::-webkit-scrollbar-track {
  background: #f0f0f0;
}

.modal-container::-webkit-scrollbar-thumb {
  background-color: #90caf9;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .info-linha {
    flex-direction: column;
    gap: 12px;
  }
  
  .modal-container {
    width: 95%;
    max-height: 90vh;
  }
}
</style>
