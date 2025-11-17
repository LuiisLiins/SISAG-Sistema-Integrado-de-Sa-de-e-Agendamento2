<template>
  <div class="tela-encaminhamentos">

    <!-- Botão de Voltar -->
    <button class="voltar" @click="$router.back()">
      ← Voltar
    </button>

    <h1>Encaminhamentos do Paciente</h1>

    <!-- ==== DADOS DO PACIENTE ==== -->
    <div class="bloco-informacoes" v-if="usuario">
      <div class="temp">
        <p class="nome-nascimento">
          <span><strong>Nome:</strong> {{ usuario.nome }}</span>
        </p>
        <p>
          <span class="nascimento"><strong>Data de nascimento:</strong> {{ formatarData(usuario.data_nascimento) }}</span>
        </p>
      </div>

      <p><span>Telefone:</span> {{ formatarTelefone(usuario.telefone) }}</p>
      <p><span>Nome da mãe:</span> {{ usuario.nome_mae || '-' }}</p>
    </div>

    <!-- ==== FILTROS ==== -->
    <div class="filtros">
      <button 
        v-for="f in filtros"
        :key="f.valor"
        @click="filtroAtivo = f.valor"
        :class="['botao-filtro', filtroAtivo === f.valor ? 'ativo' : '']"
      >
        {{ f.texto }}
      </button>
    </div>

    <!-- ==== LISTA DE ENCAMINHAMENTOS ==== -->
    <h2 class="titulo-sub">Encaminhamentos Registrados</h2>

    <div class="lista-encaminhamentos">

      <div 
        class="enc-card"
        v-for="(enc, index) in encaminhamentosFiltrados"
        :key="index"
        :class="enc.status"
      >
        <p class="status-txt">{{ enc.statusLabel }}</p>

        <div class="temp">
          <p class="especialidade-medico">
            <span>Especialidade:</span> {{ enc.especialidade }} 
          </p>
          
          <p class="especialidade-medico">
            <span>Médico:</span> {{ enc.medico }}
          </p>
        </div>

        <p>
          <span>Data da Consulta:</span> {{ enc.data }} — {{ enc.hora }}
        </p>
      </div>

    </div>

  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: "TelaEncaminhamentosUsuario",

  data() {
    return {
      filtroAtivo: "todos",
      usuario: null,
      filtros: [
        { texto: "Todos", valor: "todos" },
        { texto: "Pendente", valor: "Pendente" },
        { texto: "Agendado", valor: "Agendado" },
        { texto: "Concluido", valor: "Concluido" },
        { texto: "Cancelado", valor: "Cancelado" },
        { texto: "Perdido", valor: "Perdido" },
      ],

      encaminhamentos: [],
    };
  },

  computed: {
    encaminhamentosFiltrados() {
      if (this.filtroAtivo === "todos") return this.encaminhamentos;
      return this.encaminhamentos.filter(enc => enc.status === this.filtroAtivo);
    },
  },

  async mounted() {
    const usuarioId = this.$route.params.id;
    if (usuarioId) {
      await this.buscarDadosUsuario(usuarioId);
      await this.buscarEncaminhamentos(usuarioId);
    } else {
      console.error('ID do usuário não fornecido na rota');
      alert('Erro: Paciente não identificado.');
      this.$router.back();
    }
  },

  methods: {
    async buscarDadosUsuario(id) {
      try {
        const res = await api.get(`/usuarios/${id}`);
        this.usuario = res.data;
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        alert('Erro ao carregar dados do paciente.');
      }
    },

    async buscarEncaminhamentos(usuarioId) {
      try {
        const res = await api.get('/encaminhamentos');
        const todosEncaminhamentos = res.data || [];
        
        // Filtrar encaminhamentos do usuário específico
        const encaminhamentosUsuario = todosEncaminhamentos.filter(enc => 
          enc.usuario_id === parseInt(usuarioId) || enc.usuario?.id === parseInt(usuarioId)
        );
        
        console.log('Total de encaminhamentos:', todosEncaminhamentos.length);
        console.log('Encaminhamentos do usuário:', encaminhamentosUsuario.length);
        console.log('Dados:', encaminhamentosUsuario);
        
        this.encaminhamentos = encaminhamentosUsuario.map(enc => ({
          ...enc,
          especialidade: enc.especialidade || '-',
          medico: enc.medico || '-',
          data: enc.data_agendamento ? this.formatarData(enc.data_agendamento) : 'Não agendado',
          hora: enc.data_agendamento ? this.formatarHora(enc.data_agendamento) : '-',
          status: enc.status || 'Pendente',
          statusLabel: enc.status || 'Pendente',
        }));
      } catch (error) {
        console.error('Erro ao buscar encaminhamentos:', error);
        this.encaminhamentos = [];
      }
    },

    formatarData(data) {
      if (!data) return '-';
      const dataLimpa = data.split('T')[0];
      const [ano, mes, dia] = dataLimpa.split('-');
      return `${dia}/${mes}/${ano}`;
    },

    formatarHora(dataHora) {
      if (!dataHora) return '-';
      const hora = dataHora.split('T')[1];
      if (hora) {
        return hora.substring(0, 5);
      }
      return '-';
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
  },
};
</script>

<style scoped>
.tela-encaminhamentos {
  width: 95%;
  max-width: 800px;
  margin: 20px auto;
  background-color: #e3f2fd;
  padding: 10px;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  font-family: "Nunito", sans-serif;
  color: #0d47a1;

  display: flex;
  flex-direction: column;
  height: 94vh; /* altura fixa da tela */
}

.voltar {
  background: none;
  border: none;
  color: #1565c0;
  font-size: 18px;
  cursor: pointer;
  font-weight: 600;
  transition: color 0.3s;
  text-align: left;
}

.voltar:hover {
  color: #0d47a1;
  text-decoration: underline;
}

h1 {
  text-align: center;
  color: #1565c0;
  margin: 10px 0 20px;
}

.titulo-sub {
  font-size: 20px;
  font-weight: 700;
  margin-top: 0px;
  margin-bottom: 0px;
  color: #1565c0;
}

/* DADOS DO PACIENTE */
.bloco-informacoes {
  background: #fff;
  padding: 10px;
  border-radius: 12px;
  margin-bottom: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.bloco-informacoes p {
  font-size: 17px;
  margin: 8px 0;
  display: flex;
}

.temp {
  display: flex;
  justify-content: space-between;
}

.bloco-informacoes span {
  font-weight: 700;
  color: #0d47a1;
}

.bloco-informacoes .nascimento {
  font-weight: 700;
  color: #0d47a1;
}

/* FILTROS */
.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}

.botao-filtro {
  background: #bbdefb;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #0d47a1;
  transition: 0.2s;
}

.botao-filtro:hover {
  background: #90caf9;
}

.botao-filtro.ativo {
  background: #1565c0;
  color: #fff;
}

/* LISTA DE ENCAMINHAMENTOS */
.lista-encaminhamentos {
  display: flex;
  flex-direction: column;
  gap: 15px;

  overflow-y: auto; /* scroll apenas aqui */
  flex-grow: 1; /* ocupa espaço restante */
  padding-right: 5px;
}

/* CARD BASE */
.enc-card {
  background: #fff;
  padding: 18px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  transition: 0.2s ease;
}

.enc-card:hover {
  transform: scale(1.01);
}

/* STATUS COLORS */
.Pendente {
  border-left: 6px solid #ffeb3b;
}

.Agendado {
  border-left: 6px solid #2196f3;
}

.Concluido {
  border-left: 6px solid #4caf50;
}

.Cancelado {
  border-left: 6px solid #9e9e9e;
}

.Perdido {
  border-left: 6px solid #ff9800;
}

.status-txt {
  font-weight: 700;
  margin-bottom: 10px;
  color: #0d47a1;
}

.enc-card p {
  font-size: 17px;
  margin: 6px 0;
}

/* ESPECIALIDADE E MÉDICO LADO A LADO */
.especialidade-medico {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.especialidade-medico span {
  font-weight: 700;
  color: #1565c0;
}
</style>
