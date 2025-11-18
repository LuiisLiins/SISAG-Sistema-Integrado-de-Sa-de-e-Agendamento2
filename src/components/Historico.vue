<template>
    <div class="container-historico">
        <div v-if="state.carregando" class="loading">
            <i class="fi fi-rr-spinner-alt"></i>
            <p>Carregando histórico...</p>
        </div>
        
        <div v-else-if="state.historico.length === 0" class="vazio">
            <i class="fi fi-rr-time-past"></i>
            <p>Nenhum histórico de encaminhamento</p>
        </div>
        
        <div v-else class="lista-cards">
            <div v-for="encaminhamento in state.historico" :key="encaminhamento.id" class="card-historico" :class="getStatusClass(encaminhamento.status)">
                <div class="card-header">
                    <div class="especialidade">
                        <i class="fi fi-rr-stethoscope"></i>
                        <h3>{{ encaminhamento.especialidade || 'Não especificado' }}</h3>
                    </div>
                    <span class="badge-status" :class="getStatusClass(encaminhamento.status)">
                        {{ encaminhamento.status || 'Pendente' }}
                    </span>
                </div>
                
                <div class="card-body">
                    <div class="info-item" v-if="encaminhamento.unidade">
                        <i class="fi fi-rr-hospital"></i>
                        <span>{{ encaminhamento.unidade.nome }}</span>
                    </div>
                    
                    <div class="info-item" v-if="encaminhamento.data_agendamento">
                        <i class="fi fi-rr-calendar"></i>
                        <span>{{ formatarData(encaminhamento.data_agendamento) }}</span>
                    </div>
                    
                    <div class="info-item" v-if="encaminhamento.medico">
                        <i class="fi fi-rr-user-md"></i>
                        <span>{{ encaminhamento.medico }}</span>
                    </div>
                </div>
                
                <div class="card-footer">
                    <button class="btn-detalhes" @click="verDetalhes(encaminhamento)">
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
            @atualizar="buscarHistorico"
        />
    </div>
</template>

<script>
import { reactive, onMounted } from 'vue';
import api from '@/services/api';
import userStore from '@/store/userStore';
import ModalDetalhesEncaminhamento from './ModalDetalhesEncaminhamento.vue';

export default {
    name: 'HistoricoEncaminhamentos',
    components: {
        ModalDetalhesEncaminhamento
    },
    setup() {
        const state = reactive({
            historico: [],
            carregando: false,
            mostrarModal: false,
            encaminhamentoSelecionado: null
        });

        const buscarHistorico = async () => {
            state.carregando = true;
            try {
                const res = await api.get('/encaminhamentos');
                const todosEncaminhamentos = res.data || [];
                
                // Filtrar apenas encaminhamentos do usuário logado que estão confirmados, concluídos, cancelados ou perdidos
                state.historico = todosEncaminhamentos.filter(enc => {
                    const pertenceUsuario = enc.usuario_id === userStore.id || enc.usuario?.id === userStore.id;
                    const statusFinalizado = ['Confirmado', 'Concluido', 'Cancelado', 'Perdido'].includes(enc.status);
                    return pertenceUsuario && statusFinalizado;
                });
                
                console.log('Histórico de encaminhamentos:', state.historico);
            } catch (error) {
                console.error('Erro ao buscar histórico:', error);
                state.historico = [];
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

        const verDetalhes = (encaminhamento) => {
            state.encaminhamentoSelecionado = encaminhamento;
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
            buscarHistorico();
        });

        return {
            state,
            formatarData,
            verDetalhes,
            fecharModal,
            getStatusClass,
            buscarHistorico
        };
    }
};
</script>

<style scoped>
.container-historico {
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

.card-historico {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    border-left: 4px solid #1565c0;
}

.card-historico:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-historico.status-concluido {
    border-left-color: #4caf50;
}

.card-historico.status-cancelado {
    border-left-color: #9e9e9e;
}

.card-historico.status-perdido {
    border-left-color: #f44336;
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

.badge-status.status-concluido {
    background-color: #e8f5e9;
    color: #2e7d32;
}

.badge-status.status-cancelado {
    background-color: #f5f5f5;
    color: #616161;
}

.badge-status.status-perdido {
    background-color: #ffebee;
    color: #c62828;
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