<template>
  <div class="tela-encaminhamentos">

    <!-- Botão de Voltar -->
    <button class="voltar" @click="$router.back()">
      ← Voltar
    </button>

    <h1>Encaminhamentos do Paciente</h1>

    <!-- ==== DADOS DO PACIENTE ==== -->
    <div class="bloco-informacoes">
      <div class="temp">
        <p class="nome-nascimento">
          <span><strong>Nome:</strong> Brunonoia</span>
        </p>
        <p>
          <span class="nascimento"><strong>Data de nascimento:</strong> 10/10/2010</span>
        </p>
      </div>

      <p><span>Telefone:</span> (14) 99999-9999</p>
      <p><span>Nome da mãe:</span> Maria do back</p>
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
export default {
  name: "TelaEncaminhamentosUsuario",

  data() {
    return {
      filtroAtivo: "todos",

      filtros: [
        { texto: "Todos", valor: "todos" },
        { texto: "Pendente", valor: "pendente" },
        { texto: "Confirmado", valor: "confirmado" },
        { texto: "Consultado", valor: "consultado" },
        { texto: "Falta Confirmação", valor: "falta" },
      ],

      encaminhamentos: [
        {
          especialidade: "Cardiologia",
          data: "05/03/2024",
          hora: "14:00",
          medico: "Dr. João Silva",
          status: "pendente",
          statusLabel: "Pendente",
        },
        {
          especialidade: "Dermatologia",
          data: "18/02/2024",
          hora: "10:30",
          medico: "Dra. Marina Costa",
          status: "confirmado",
          statusLabel: "Confirmado",
        },
        {
          especialidade: "Oftalmologia",
          data: "10/01/2024",
          hora: "08:00",
          medico: "Dr. Roberto Lima",
          status: "consultado",
          statusLabel: "Consultado",
        },
        {
          especialidade: "Ortopedia",
          data: "22/02/2024",
          hora: "16:00",
          medico: "Dr. Paulo Mendes",
          status: "falta",
          statusLabel: "Falta Confirmação",
        },
      ],
    };
  },

  computed: {
    encaminhamentosFiltrados() {
      if (this.filtroAtivo === "todos") return this.encaminhamentos;
      return this.encaminhamentos.filter(enc => enc.status === this.filtroAtivo);
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
.pendente {
  border-left: 6px solid #ffeb3b;
}

.confirmado {
  border-left: 6px solid #2196f3;
}

.consultado {
  border-left: 6px solid #4caf50;
}

.falta {
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
