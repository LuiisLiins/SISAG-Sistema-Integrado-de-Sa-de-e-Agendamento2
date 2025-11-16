<template>
  <div class="conteudo-principal">
    <h1>Meu Cadastro</h1>

    <div class="informacoes-pessoais">
      <div class="comp-pessoal">
        <p><span>Nome:</span> {{ userStore.nome }}</p>
      </div>

      <div class="linha-dupla">
        <p><span>RG:</span> {{ formatarRG(userStore.rg) }}</p>
        <p><span>CPF:</span> {{ formatarCPF(userStore.cpf) }}</p>
      </div>

      <div class="linha-dupla">
        <p><span>Data de nascimento:</span> {{ formatarData(userStore.data_nascimento) }}</p>
        <p><span>Cartão SUS:</span> {{ formatarCartaoSUS(userStore.cartao_sus) }}</p>
      </div>

      <div class="linha-dupla">
        <p><span>Sexo:</span> {{ formatarSexo(userStore.sexo) }}</p>
        <p><span>Estado civil:</span> {{ formatarEstadoCivil(userStore.estado_civil) }}</p>
      </div>

      <div class="comp-pessoal">
        <p><span>E-mail:</span> {{ userStore.email }}</p>
      </div>

      <div class="comp-pessoal">
        <p><span>Endereço:</span> {{ userStore.endereco || 'Não informado' }}</p>
      </div>

      <div class="linha-tripla">
        <p><span>Cidade:</span> {{ userStore.cidade || 'Não informado' }}</p>
        <p><span>UF:</span> {{ userStore.uf || '-' }}</p>
        <p><span>CEP:</span> {{ userStore.cep || 'Não informado' }}</p>
      </div>

      <div class="comp-pessoal">
        <p><span>Telefone:</span> {{ formatarTelefone(userStore.telefone) }}</p>
      </div>
    </div>
    <p>Caso alguma informação esteja errada, vá até o seu posto de saúde ou informe o Agente Comunitário na visita domiciliar.</p>
  </div>
</template>

<script>
import userStore from '@/store/userStore';

export default {
  name: "TelaCadastro",
  data() {
    return {
      userStore
    };
  },
  methods: {
    formatarRG(rg) {
      if (!rg) return 'Não informado';
      const apenasNumeros = rg.replace(/\D/g, '');
      if (apenasNumeros.length === 9) {
        return apenasNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
      }
      return rg;
    },
    formatarCPF(cpf) {
      if (!cpf) return 'Não informado';
      const apenasNumeros = cpf.replace(/\D/g, '');
      return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    },
    formatarTelefone(telefone) {
      if (!telefone) return 'Não informado';
      const apenasNumeros = telefone.replace(/\D/g, '');
      if (apenasNumeros.length === 11) {
        return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else if (apenasNumeros.length === 10) {
        return apenasNumeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
      return telefone;
    },
    formatarCartaoSUS(cartao) {
      if (!cartao) return 'Não informado';
      const apenasNumeros = cartao.replace(/\D/g, '');
      return apenasNumeros.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
    },
    formatarData(data) {
      if (!data) return 'Não informado';
      // Extrai apenas a parte da data (YYYY-MM-DD)
      const dataLimpa = data.split('T')[0];
      const [ano, mes, dia] = dataLimpa.split('-');
      return `${dia}/${mes}/${ano}`;
    },
    formatarSexo(sexo) {
      if (!sexo) return 'Não informado';
      const sexos = {
        masculino: 'Masculino',
        feminino: 'Feminino',
        outro: 'Outro'
      };
      return sexos[sexo] || sexo;
    },
    formatarEstadoCivil(estado) {
      if (!estado) return 'Não informado';
      const estados = {
        solteiro: 'Solteiro(a)',
        casado: 'Casado(a)',
        divorciado: 'Divorciado(a)',
        viuvo: 'Viúvo(a)',
        uniao_estavel: 'União Estável'
      };
      return estados[estado] || estado;
    }
  }
};
</script>
