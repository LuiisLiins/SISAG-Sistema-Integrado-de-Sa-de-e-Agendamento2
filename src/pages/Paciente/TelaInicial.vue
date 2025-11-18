<template>
  <div>
    <div class="conteudo-principal">
      <h1>Bem-vindo, {{userStore.nome}}</h1>

      <div class="janelas">

        <!-- Bloco 1: consultas -->
        <div class="janela janela-consulta">
          <div class="header-card">
            <i class="fi fi-rr-calendar-check"></i>
            <p><strong>Próxima Consulta/Exame</strong></p>
          </div>
          
          <div v-if="carregandoConsulta" class="loading-mini">
            <i class="fi fi-rr-spinner-alt"></i>
            <span>Carregando...</span>
          </div>
          
          <div v-else-if="!proximaConsulta" class="vazio-mini">
            <i class="fi fi-rr-calendar-minus"></i>
            <span>Nenhuma consulta agendada</span>
          </div>
          
          <div v-else class="detalhes-consulta">
            <div class="info-principal">
              <div class="especialidade-destaque">
                <i class="fi fi-rr-stethoscope"></i>
                <span>{{ proximaConsulta.especialidade }}</span>
              </div>
              <span class="badge-status-mini" :class="getStatusClass(proximaConsulta.status)">
                {{ proximaConsulta.status }}
              </span>
            </div>
            
            <div class="info-data">
              <i class="fi fi-rr-calendar"></i>
              <div>
                <span class="label">Data</span>
                <span class="valor">{{ formatarData(proximaConsulta.data_agendamento) }}</span>
              </div>
            </div>
            
            <div v-if="proximaConsulta.unidade" class="local-consulta">
              <i class="fi fi-rr-marker"></i>
              <div>
                <span class="label">Local</span>
                <span class="valor">{{ proximaConsulta.unidade.nome }}</span>
              </div>
            </div>
            
            <div v-if="proximaConsulta.medico" class="medico-consulta">
              <i class="fi fi-rr-user-md"></i>
              <div>
                <span class="label">Médico</span>
                <span class="valor">{{ proximaConsulta.medico_agendado }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bloco 2: encaminhamentos -->
        <div class="janela janela-encaminhamentos" @click="$router.push('/menu/agendamentos/lista')" style="cursor: pointer;">
          <div class="header-card">
            <i class="fi fi-rr-document-signed"></i>
            <p><strong>Meus Encaminhamentos</strong></p>
          </div>
          
          <div v-if="carregandoEnc" class="loading-mini">
            <i class="fi fi-rr-spinner-alt"></i>
            <span>Carregando...</span>
          </div>
          
          <div v-else-if="encaminhamentos.length === 0" class="vazio-mini">
            <i class="fi fi-rr-inbox"></i>
            <span>Nenhum encaminhamento</span>
          </div>
          
          <div v-else class="lista-encaminhamentos">
            <div 
              v-for="enc in encaminhamentosLimitados" 
              :key="enc.id" 
              class="item-encaminhamento"
            >
              <div class="info-enc">
                <i class="fi fi-rr-stethoscope"></i>
                <span class="especialidade">{{ enc.especialidade }}</span>
              </div>
              <span class="badge-status-mini" :class="getStatusClass(enc.status)">
                {{ enc.status }}
              </span>
            </div>
            
            <div v-if="encaminhamentos.length > 3" class="ver-mais">
              <span>+{{ encaminhamentos.length - 3 }} encaminhamento(s)</span>
              <i class="fi fi-rr-arrow-right"></i>
            </div>
          </div>
        </div>

        <!-- Bloco 3: notificações gerais -->
        <div class="janela-notificacao">
          <p><strong>Notificações:</strong></p>
          <p>📢 Lembrete: Atualize seu cadastro!</p>
          <p>📅 Novo exame disponível para agendamento.</p>
        </div>

        <!-- BLOCOS EXCLUSIVOS DO agente (ACS) -->
        <!-- Mostra apenas se for agente -->
        
        <div class="janela-notificacao" v-if="userStore.tipo === 'agente'">
          <p style="color: red; font-size: 25px;"><strong>Pacientes com confirmação pendente!</strong></p>
          <p style="color: red; font-size: 40px; text-align: center;">
            {{ encaminhamentosPendentes }}
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, computed } from 'vue';
import userStore from "@/store/userStore.js";
import api from '@/services/api';

export default {
  name: "TelaInicial",

  setup() {
    const encaminhamentos = ref([]);
    const carregandoEnc = ref(false);
    const proximaConsulta = ref(null);
    const carregandoConsulta = ref(false);

    const encaminhamentosLimitados = computed(() => {
      return encaminhamentos.value.slice(0, 3);
    });

    const encaminhamentosPendentes = computed(() => {
      return encaminhamentos.value.filter(enc => enc.status === 'Pendente').length;
    });

    const buscarEncaminhamentos = async () => {
      carregandoEnc.value = true;
      try {
        const res = await api.get('/encaminhamentos');
        const todosEncaminhamentos = res.data || [];
        
        // Filtrar encaminhamentos do usuário logado com status Pendente ou Agendado
        encaminhamentos.value = todosEncaminhamentos.filter(enc => {
          const pertenceUsuario = enc.usuario_id === userStore.id || enc.usuario?.id === userStore.id;
          const statusAtivo = ['Pendente', 'Agendado', 'Confirmado'].includes(enc.status);
          return pertenceUsuario && statusAtivo;
        });
      } catch (error) {
        console.error('Erro ao buscar encaminhamentos:', error);
        encaminhamentos.value = [];
      } finally {
        carregandoEnc.value = false;
      }
    };

    const buscarProximaConsulta = async () => {
      carregandoConsulta.value = true;
      try {
        const res = await api.get('/encaminhamentos');
        const todosEncaminhamentos = res.data || [];
        
        // Filtrar encaminhamentos agendados do usuário
        const consultasAgendadas = todosEncaminhamentos.filter(enc => {
          const pertenceUsuario = enc.usuario_id === userStore.id || enc.usuario?.id === userStore.id;
          const statusAgendado = ['Agendado', 'Confirmado'].includes(enc.status);
          const temData = enc.data_agendamento;
          return pertenceUsuario && statusAgendado && temData;
        });

        // Filtrar apenas datas futuras
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const consultasFuturas = consultasAgendadas.filter(enc => {
          const dataConsulta = new Date(enc.data_agendamento);
          return dataConsulta >= hoje;
        });

        // Ordenar e pegar a mais próxima
        consultasFuturas.sort((a, b) => {
          return new Date(a.data_agendamento) - new Date(b.data_agendamento);
        });

        proximaConsulta.value = consultasFuturas.length > 0 ? consultasFuturas[0] : null;
      } catch (error) {
        console.error('Erro ao buscar próxima consulta:', error);
        proximaConsulta.value = null;
      } finally {
        carregandoConsulta.value = false;
      }
    };

    const formatarData = (data) => {
      if (!data) return '-';
      const dataLimpa = data.split('T')[0];
      const [ano, mes, dia] = dataLimpa.split('-');
      return `${dia}/${mes}/${ano}`;
    };

    const formatarHora = (dataHora) => {
      if (!dataHora) return '-';
      const [, hora] = dataHora.split('T');
      return hora ? hora.substring(0, 5) : '-';
    };

    const getStatusClass = (status) => {
      const classes = {
        'Pendente': 'status-pendente',
        'Agendado': 'status-agendado',
        'Confirmado': 'status-confirmado'
      };
      return classes[status] || 'status-pendente';
    };

    onMounted(() => {
      buscarEncaminhamentos();
      buscarProximaConsulta();
    });

    return {
      userStore,
      encaminhamentos,
      encaminhamentosLimitados,
      carregandoEnc,
      proximaConsulta,
      carregandoConsulta,
      getStatusClass,
      formatarData,
      formatarHora,
      encaminhamentosPendentes  
    };
  }
};
</script>

<style scoped>
.janela-consulta {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border: none;
}

.detalhes-consulta {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-principal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(21, 101, 192, 0.2);
}

.especialidade-destaque {
  display: flex;
  align-items: center;
  gap: 10px;
}

.especialidade-destaque i {
  font-size: 28px;
  color: #1565c0;
}

.especialidade-destaque span {
  font-size: 18px;
  font-weight: 700;
  color: #0d47a1;
}

.info-data,
.local-consulta,
.medico-consulta {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.info-data i,
.local-consulta i,
.medico-consulta i {
  font-size: 20px;
  color: #1565c0;
  min-width: 20px;
}

.info-data div,
.local-consulta div,
.medico-consulta div {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.label {
  font-size: 11px;
  text-transform: uppercase;
  color: #666;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.valor {
  font-size: 15px;
  color: #333;
  font-weight: 600;
}

.header-card {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #90caf9;
}

.header-card i {
  font-size: 24px;
  color: #1565c0;
}

.header-card p {
  margin: 0;
  font-size: 16px;
  color: #0d47a1;
}

.janela-encaminhamentos {
  transition: all 0.3s ease;
}

.janela-encaminhamentos:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(21, 101, 192, 0.2);
}

.loading-mini,
.vazio-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  color: #666;
}

.loading-mini i,
.vazio-mini i {
  font-size: 32px;
  color: #1565c0;
}

.loading-mini span,
.vazio-mini span {
  font-size: 14px;
}

.lista-encaminhamentos {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-encaminhamento {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 8px;
  border-left: 3px solid #1565c0;
  transition: all 0.2s ease;
}

.item-encaminhamento:hover {
  background: #f5f5f5;
  transform: translateX(5px);
}

.info-enc {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.info-enc i {
  font-size: 18px;
  color: #1565c0;
}

.especialidade {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.badge-status-mini {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-status-mini.status-pendente {
  background-color: #fff3e0;
  color: #f57c00;
}

.badge-status-mini.status-agendado {
  background-color: #e3f2fd;
  color: #1565c0;
}

.badge-status-mini.status-confirmado {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.ver-mais {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  margin-top: 5px;
  color: #1565c0;
  font-size: 13px;
  font-weight: 600;
  border-top: 1px dashed #90caf9;
}

.ver-mais i {
  font-size: 14px;
  animation: slideRight 1.5s ease-in-out infinite;
}

@keyframes slideRight {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(5px);
  }
}
</style>
