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
        <div class="janela janela-notificacoes" @click="abrirModalNotificacoes" style="cursor: pointer;">
          <div class="header-card">
            <i class="fi fi-rr-bell"></i>
            <p><strong>Notificações</strong></p>
            <span v-if="notificacoesNaoLidas > 0" class="badge-notif">{{ notificacoesNaoLidas }}</span>
          </div>
          
          <div v-if="notificacoes.length === 0" class="vazio-mini">
            <i class="fi fi-rr-bell-slash"></i>
            <span>Nenhuma notificação</span>
          </div>
          
          <div v-else class="lista-notificacoes-preview">
            <div 
              v-for="notif in notificacoesPreview" 
              :key="notif.id"
              class="notificacao-item"
            >
              <i :class="getTipoIcon(notif.tipo)"></i>
              <div class="notif-texto">
                <span class="notif-titulo">{{ notif.titulo }}</span>
                <span class="notif-msg">{{ notif.mensagem }}</span>
              </div>
              <div v-if="!notif.lida" class="badge-nova">Nova</div>
            </div>
            
            <div v-if="notificacoes.length > 2" class="ver-mais">
              <span>+{{ notificacoes.length - 2 }} notificação(ões)</span>
              <i class="fi fi-rr-arrow-right"></i>
            </div>
          </div>
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

    <!-- Modal de Notificações -->
    <transition name="fade">
      <div v-if="mostrarModalNotificacoes" class="modal-overlay" @click="fecharModalNotificacoes">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2><i class="fi fi-rr-bell"></i> Notificações</h2>
            <i class="fi fi-rr-cross-small" @click="fecharModalNotificacoes"></i>
          </div>

          <div class="modal-content">
            <div v-if="notificacoes.length === 0" class="sem-notificacoes">
              <i class="fi fi-rr-bell-slash"></i>
              <p>Você não tem notificações no momento</p>
            </div>

            <div v-else class="lista-notificacoes">
              <div 
                v-for="notif in notificacoes" 
                :key="notif.id"
                :class="['notificacao-card', notif.lida ? 'lida' : 'nao-lida']"
                @click="marcarComoLida(notif.id)"
              >
                <div class="notif-icon" :class="getTipoClass(notif.tipo)">
                  <i :class="getTipoIcon(notif.tipo)"></i>
                </div>
                <div class="notif-conteudo">
                  <h4>{{ notif.titulo }}</h4>
                  <p>{{ notif.mensagem }}</p>
                  <span class="notif-data">{{ formatarDataHora(notif.data) }}</span>
                </div>
                <div v-if="!notif.lida" class="indicador-nova"></div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-marcar-todas" @click="marcarTodasComoLidas" v-if="notificacoes.some(n => !n.lida)">
              <i class="fi fi-rr-check-double"></i>
              Marcar todas como lidas
            </button>
            <button class="btn-limpar" @click="limparTodasNotificacoes" v-if="notificacoes.length > 0">
              <i class="fi fi-rr-trash"></i>
              Limpar Tudo
            </button>
            <button class="btn-fechar" @click="fecharModalNotificacoes">
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
import { onMounted, ref, computed } from 'vue';
import userStore from "@/store/userStore.js";
import api from '@/services/api';
import { notificationStore, marcarComoLida as marcarLida, marcarTodasComoLidas as marcarTodasLidas, limparNotificacoes } from '@/store/notificationStore';

export default {
  name: "TelaInicial",

  setup() {
    const encaminhamentos = ref([]);
    const todosEncaminhamentospendentes = ref([]);
    const carregandoEnc = ref(false);
    const proximaConsulta = ref(null);
    const carregandoConsulta = ref(false);
    const mostrarModalNotificacoes = ref(false);

    const encaminhamentosLimitados = computed(() => {
      return encaminhamentos.value.slice(0, 3);
    });

    const encaminhamentosPendentes = computed(() => {
      return todosEncaminhamentospendentes.value.filter(enc => enc.status === 'Pendente').length;
    });

    const notificacoes = computed(() => {
      // Filtrar notificações do usuário atual ou notificações globais (sem usuario_id)
      return notificationStore.notificacoes.filter(n => 
        !n.usuario_id || n.usuario_id === userStore.id
      );
    });

    const notificacoesCount = computed(() => {
      return notificacoes.value.length;
    });

    const notificacoesNaoLidas = computed(() => {
      return notificacoes.value.filter(n => !n.lida).length;
    });

    const notificacoesPreview = computed(() => {
      return notificacoes.value.slice(0, 2);
    });

    const buscarEncaminhamentos = async () => {
      carregandoEnc.value = true;
      try {
        const res = await api.get('/encaminhamentos');
        const todosEncaminhamentos = res.data || [];

        todosEncaminhamentospendentes.value = todosEncaminhamentos;
        
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

    const abrirModalNotificacoes = () => {
      mostrarModalNotificacoes.value = true;
    };

    const fecharModalNotificacoes = () => {
      mostrarModalNotificacoes.value = false;
    };

    const marcarComoLida = (id) => {
      marcarLida(id);
    };

    const marcarTodasComoLidas = () => {
      marcarTodasLidas();
    };

    const limparTodasNotificacoes = () => {
      if (confirm('Tem certeza que deseja limpar todas as notificações? Esta ação não pode ser desfeita.')) {
        limparNotificacoes();
      }
    };

    const getTipoClass = (tipo) => {
      const classes = {
        'info': 'tipo-info',
        'agendamento': 'tipo-agendamento',
        'lembrete': 'tipo-lembrete',
        'alerta': 'tipo-alerta'
      };
      return classes[tipo] || 'tipo-info';
    };

    const getTipoIcon = (tipo) => {
      const icons = {
        'info': 'fi fi-rr-info',
        'agendamento': 'fi fi-rr-calendar',
        'lembrete': 'fi fi-rr-bell',
        'alerta': 'fi fi-rr-exclamation'
      };
      return icons[tipo] || 'fi fi-rr-info';
    };

    const formatarDataHora = (data) => {
      if (!data) return '-';
      const dataObj = new Date(data);
      const hoje = new Date();
      const ontem = new Date(hoje);
      ontem.setDate(ontem.getDate() - 1);
      
      const diaData = dataObj.toDateString();
      const diaHoje = hoje.toDateString();
      const diaOntem = ontem.toDateString();
      
      if (diaData === diaHoje) {
        return `Hoje às ${dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diaData === diaOntem) {
        return `Ontem às ${dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        return dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
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
      encaminhamentosPendentes,
      mostrarModalNotificacoes,
      notificacoes,
      notificacoesCount,
      notificacoesNaoLidas,
      notificacoesPreview,
      abrirModalNotificacoes,
      fecharModalNotificacoes,
      marcarComoLida,
      marcarTodasComoLidas,
      limparTodasNotificacoes,
      getTipoClass,
      getTipoIcon,
      formatarDataHora
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
  position: relative;
}

.header-card i {
  font-size: 24px;
  color: #1565c0;
}

.header-card p {
  margin: 0;
  font-size: 16px;
  color: #0d47a1;
  flex: 1;
}

.badge-notif {
  background: #f57c00;
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
  min-width: 24px;
  text-align: center;
  animation: pulse 2s ease-in-out infinite;
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

.janela-notificacoes {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border: none;
  transition: all 0.3s ease;
}

.janela-notificacoes:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(245, 124, 0, 0.2);
}

.lista-notificacoes-preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notificacao-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  background: white;
  border-radius: 8px;
  border-left: 3px solid #f57c00;
  position: relative;
}

.notificacao-item i {
  font-size: 18px;
  color: #f57c00;
  margin-top: 2px;
  flex-shrink: 0;
}

.notif-texto {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  overflow: hidden;
}

.notif-titulo {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.notif-msg {
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.badge-nova {
  background: #f57c00;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  align-self: flex-start;
}

/* Modal de Notificações */
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
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
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
  background: linear-gradient(135deg, #f57c00 0%, #ef6c00 100%);
  color: white;
  padding: 25px 30px;
  border-radius: 16px 16px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-header i.fi-rr-cross-small {
  cursor: pointer;
  font-size: 28px;
  transition: transform 0.2s;
}

.modal-header i.fi-rr-cross-small:hover {
  transform: rotate(90deg);
}

.modal-content {
  padding: 20px 30px;
  overflow-y: auto;
  flex: 1;
}

.sem-notificacoes {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.sem-notificacoes i {
  font-size: 64px;
  color: #ddd;
  margin-bottom: 20px;
}

.sem-notificacoes p {
  font-size: 16px;
  margin: 0;
}

.lista-notificacoes {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notificacao-card {
  display: flex;
  gap: 15px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.notificacao-card:hover {
  background: #f0f0f0;
  transform: translateX(5px);
}

.notificacao-card.nao-lida {
  background: #fff3e0;
}

.notificacao-card.lida {
  opacity: 0.7;
}

.notif-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notif-icon i {
  font-size: 20px;
}

.notif-icon.tipo-info {
  background: #e3f2fd;
  color: #1565c0;
  border-left-color: #1565c0;
}

.notificacao-card.tipo-info {
  border-left-color: #1565c0;
}

.notif-icon.tipo-agendamento {
  background: #e8f5e9;
  color: #2e7d32;
}

.notificacao-card.tipo-agendamento {
  border-left-color: #2e7d32;
}

.notif-icon.tipo-lembrete {
  background: #fff3e0;
  color: #f57c00;
}

.notificacao-card.tipo-lembrete {
  border-left-color: #f57c00;
}

.notif-icon.tipo-alerta {
  background: #ffebee;
  color: #d32f2f;
}

.notificacao-card.tipo-alerta {
  border-left-color: #d32f2f;
}

.notif-conteudo {
  flex: 1;
}

.notif-conteudo h4 {
  margin: 0 0 8px 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.notif-conteudo p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.notif-data {
  font-size: 12px;
  color: #999;
  font-style: italic;
}

.indicador-nova {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 10px;
  height: 10px;
  background: #f57c00;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}

.modal-footer {
  padding: 20px 30px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.btn-marcar-todas,
.btn-limpar,
.btn-fechar {
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-marcar-todas {
  background-color: #f57c00;
  color: white;
}

.btn-marcar-todas:hover {
  background-color: #ef6c00;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 124, 0, 0.3);
}

.btn-limpar {
  background-color: #d32f2f;
  color: white;
}

.btn-limpar:hover {
  background-color: #c62828;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
}

.btn-fechar {
  background-color: #757575;
  color: white;
}

.btn-fechar:hover {
  background-color: #616161;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(97, 97, 97, 0.3);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    max-height: 90vh;
  }

  .modal-content {
    padding: 15px 20px;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn-marcar-todas,
  .btn-fechar {
    width: 100%;
    justify-content: center;
  }
}
</style>
