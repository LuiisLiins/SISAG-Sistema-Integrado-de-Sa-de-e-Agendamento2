<template>
  <div class="novo-encaminhamento">
    <div class="caixa-encaminhamento">
      <h1>Nova unidade de saúde</h1>

      <form class="encaminhamento-form" @submit.prevent="adicionarUnidade">
        <div class="linha">
          <div class="form-group">
            <label>Nome da Unidade</label>
            <input type="text" v-model="unidade.nome" placeholder="Digite o nome da unidade" required />
          </div>
        </div>

        <div class="linha">
          <div class="form-group">
            <label>Endereço</label>
            <input type="text" v-model="unidade.endereco" placeholder="Digite o endereço da unidade" required />
          </div>
        </div>

        <div class="linha">
          <div class="form-group">
            <label>Telefone</label>
            <input type="tel" v-model="unidade.telefone" placeholder="(xx) xxxxx-xxxx" />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="unidade.email" placeholder="Digite o email da unidade" />
          </div>
        </div>

        <button type="submit" class="btn-confirmar" :disabled="carregando">
          {{ carregando ? 'Adicionando...' : 'Adicionar unidade' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';
import { useNotification } from '@/composables/useNotification';

export default {
  name: "AdicionarEncaminhamento",
  data() {
    return {
      unidade: {
        nome: '',
        endereco: '',
        telefone: '',
        email: ''
      },
      carregando: false,
      notification: useNotification()
    };
  },
  methods: {
    async adicionarUnidade() {
      if (!this.unidade.nome || !this.unidade.endereco) {
        this.notification.warning('Por favor, preencha os campos obrigatórios (Nome e Endereço).');
        return;
      }

      this.carregando = true;

      try {
        const response = await api.post('/unidades-saude', this.unidade);
        
        console.log('Unidade adicionada:', response.data);
        this.notification.success('Unidade de saúde adicionada com sucesso!');
        
        // Limpar formulário
        this.unidade = {
          nome: '',
          endereco: '',
          telefone: '',
          email: ''
        };

      } catch (error) {
        console.error('Erro ao adicionar unidade:', error);
        
        if (error.response) {
          if (error.response.status === 422) {
            this.notification.error('Dados inválidos. Verifique os campos e tente novamente.');
          } else {
            this.notification.error('Erro ao adicionar unidade. Tente novamente.');
          }
        } else {
          this.notification.error('Erro de conexão com o servidor.');
        }
      } finally {
        this.carregando = false;
      }
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

.btn-confirmar:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  transform: none;
}
</style>
