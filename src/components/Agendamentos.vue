<template>
    <div class="container-agendamentos">
        <div v-if="state.carregando" class="loading">
            <i class="fi fi-rr-spinner-alt"></i>
            <p>Carregando agendamentos...</p>
        </div>
        
        <div v-else-if="state.agendamentos.length === 0" class="vazio">
            <i class="fi fi-rr-calendar-minus"></i>
            <p>Nenhum agendamento pendente</p>
        </div>
        
        <div v-else class="lista-cards">
            <div v-for="agendamento in state.agendamentos" :key="agendamento.id" class="card-agendamento" :class="getStatusClass(agendamento.status)">
                <div class="card-header">
                    <div class="especialidade">
                        <i class="fi fi-rr-stethoscope"></i>
                        <h3>{{ agendamento.especialidade || 'Não especificado' }}</h3>
                    </div>
                    <span class="badge-status" :class="getStatusClass(agendamento.status)">
                        {{ agendamento.status || 'Pendente' }}
                    </span>
                </div>
                
                <div class="card-body">
                    <div class="info-item" v-if="agendamento.unidade">
                        <i class="fi fi-rr-hospital"></i>
                        <span>{{ agendamento.unidade.nome }}</span>
                    </div>
                    
                    <div class="info-item" v-if="agendamento.data_agendamento">
                        <i class="fi fi-rr-calendar"></i>
                        <span>{{ formatarData(agendamento.data_agendamento) }}</span>
                    </div>
                    
                    <div class="info-item" v-else>
                        <i class="fi fi-rr-calendar-clock"></i>
                        <span class="aguardando">Aguardando agendamento</span>
                    </div>
                    
                    <div class="info-item" v-if="agendamento.medico">
                        <i class="fi fi-rr-user-md"></i>
                        <span>{{ agendamento.medico }}</span>
                    </div>
                </div>
                
                <div class="card-footer">
                    <button class="btn-detalhes" @click="verDetalhes(agendamento)">
                        <i class="fi fi-rr-info"></i>
                        Ver detalhes
                    </button>
                </div>
            </div>
    </div>

    <ModalDetalhesEncaminhamento
      :mostrar="state.mostrarModal"
      :encaminhamento="state.encaminhamentoSelecionado"
      @fechar="fecharModal"
      @atualizar="buscarAgendamentos"
    />
  </div>
</template><script>
import { reactive, onMounted } from 'vue';
import api from '@/services/api';
import userStore from '@/store/userStore';
import ModalDetalhesEncaminhamento from './ModalDetalhesEncaminhamento.vue';

export default {
    name: 'ListaAgendamentos',
    components: {
        ModalDetalhesEncaminhamento
    },
    setup() {
        const state = reactive({
            agendamentos: [],
            carregando: false,
            mostrarModal: false,
            encaminhamentoSelecionado: null
        });

        const buscarAgendamentos = async () => {
            state.carregando = true;
            try {
                const res = await api.get('/encaminhamentos');
                const todosEncaminhamentos = res.data || [];
                
                // Filtrar apenas encaminhamentos do usuário logado que estão pendentes ou agendados
                state.agendamentos = todosEncaminhamentos.filter(enc => {
                    const pertenceUsuario = enc.usuario_id === userStore.id || enc.usuario?.id === userStore.id;
                    const statusPendente = ['Pendente', 'Agendado'].includes(enc.status);
                    return pertenceUsuario && statusPendente;
                });
                
                console.log('Agendamentos pendentes:', state.agendamentos);
            } catch (error) {
                console.error('Erro ao buscar agendamentos:', error);
                state.agendamentos = [];
            } finally {
                state.carregando = false;
            }
        };

        const formatarData = (data) => {
            if (!data) return '-';
            const dataLimpa = data.split('T')[0];
            const [ano, mes, dia] = dataLimpa.split('-');
            return `${dia}/${mes}/${ano}`;
        };

        const verDetalhes = (agendamento) => {
            state.encaminhamentoSelecionado = agendamento;
            state.mostrarModal = true;
        };

        const fecharModal = () => {
            state.mostrarModal = false;
            state.encaminhamentoSelecionado = null;
        };

        const getStatusClass = (status) => {
            const classes = {
                'Pendente': 'status-pendente',
                'Agendado': 'status-agendado',
                'Concluido': 'status-concluido',
                'Cancelado': 'status-cancelado',
                'Perdido': 'status-perdido'
            };
            return classes[status] || 'status-pendente';
        };

        onMounted(() => {
            buscarAgendamentos();
        });

        return {
            state,
            formatarData,
            verDetalhes,
            fecharModal,
            getStatusClass
        };
    }
}
</script>

<style scoped>
.container-agendamentos {
    width: 100%;
}

.loading,
.vazio {
    text-align: center;
    padding: 60px 20px;
    color: #666;
}

.loading i,
.vazio i {
    font-size: 48px;
    color: #1565c0;
    margin-bottom: 15px;
    display: block;
}

.loading p,
.vazio p {
    font-size: 16px;
    color: #666;
    margin: 0;
}

.lista-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
    padding: 10px 0;
}

.card-agendamento {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    border-left: 4px solid #1565c0;
}

.card-agendamento:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-agendamento.status-pendente {
    border-left-color: #ff9800;
}

.card-agendamento.status-agendado {
    border-left-color: #2196f3;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid #e0e0e0;
}

.especialidade {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
}

.especialidade i {
    font-size: 24px;
    color: #1565c0;
}

.especialidade h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #0d47a1;
}

.badge-status {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    white-space: nowrap;
}

.badge-status.status-pendente {
    background-color: #fff3e0;
    color: #f57c00;
}

.badge-status.status-agendado {
    background-color: #e3f2fd;
    color: #1565c0;
}

.card-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 15px;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #666;
}

.info-item i {
    font-size: 16px;
    color: #1565c0;
    width: 20px;
}

.info-item span {
    color: #333;
}

.info-item .aguardando {
    color: #ff9800;
    font-style: italic;
}

.card-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 15px;
    border-top: 1px solid #e0e0e0;
}

.btn-detalhes {
    background-color: #1565c0;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
}

.btn-detalhes:hover {
    background-color: #0d47a1;
    transform: scale(1.05);
}

.btn-detalhes i {
    font-size: 16px;
}

@media (max-width: 768px) {
    .lista-cards {
        grid-template-columns: 1fr;
    }
}
</style>