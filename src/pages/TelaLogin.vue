<template>
  <div class="container-login">
    <form class="form-login" @submit.prevent="entrar">
      <h1>Tela de Login</h1>

      <div class="input-box">
        <input
          v-model="cpf"
          @input="formatarCPF"
          @keypress="permitirSomenteNumeros"
          placeholder="Usuário (CPF)"
          type="text"
          id="CPF"
          maxlength="14"
          required
        />
      </div>

      <div class="input-box">
        <input
          v-model="senha"
          placeholder="Senha"
          type="password"
          id="password"
          required
        />
      </div>

      <div class="remember-forgot">
        <label>
          <input type="checkbox" v-model="lembrar" />
          Lembrar senha
        </label>
        <a href="#">Esqueci a senha</a>
      </div>

      <button type="submit" class="login-btn" :disabled="carregando">
        {{ carregando ? 'Entrando...' : 'Entrar' }}
      </button>

      <div v-if="erro" class="erro-mensagem">{{ erro }}</div>

      <div class="register-link">
        <p>
          Não tem uma conta?
          <a href="#">Registre-se</a>
        </p>
      </div>
    </form>
  </div>
</template>

<script>
import api from '@/services/api';
import userStore, { login } from '@/store/userStore';
import { useNotification } from '@/composables/useNotification';

export default {
  name: "TelaLogin",
  data() {
    return {
      cpf: "",
      senha: "",
      lembrar: false,
      carregando: false,
      erro: "",
      notification: useNotification()
    };
  },
  methods: {
    // Bloqueia letras e outros caracteres (só permite números)
    permitirSomenteNumeros(event) {
      const tecla = event.key;
      if (!/[0-9]/.test(tecla)) {
        event.preventDefault();
      }
    },

    // Formata o CPF enquanto digita
    formatarCPF() {
      let valor = this.cpf.replace(/\D/g, ""); // remove tudo que não é número

      if (valor.length <= 3) {
        valor = valor.replace(/(\d{3})/, "$1");
      } else if (valor.length <= 6) {
        valor = valor.replace(/(\d{3})(\d{1,3})/, "$1.$2");
      } else if (valor.length <= 9) {
        valor = valor.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
      } else {
        valor = valor.replace(
          /(\d{3})(\d{3})(\d{3})(\d{1,2}).*/,
          "$1.$2.$3-$4"
        );
      }

      this.cpf = valor;
    },

    async entrar() {
      // Validação básica
      if (this.cpf === "" || this.senha === "") {
        this.notification.warning("Por favor, preencha CPF e senha.");
        return;
      }

      this.carregando = true;
      this.erro = "";

      try {
        // Remove formatação do CPF para enviar ao backend
        const cpfLimpo = this.cpf.replace(/\D/g, "");

        // Faz a requisição de login
        const response = await api.post('/login', {
          cpf: cpfLimpo,
          senha: this.senha
        });


        // Salva os dados do usuário na store
        if (response.data) {
          console.log('Resposta completa da API:', response.data);
          
          // Os dados vêm em response.data.usuario
          const userData = response.data.usuario;
          console.log('Dados do usuário:', userData);
          
          // Salva na store
          login(userData);
          
          console.log('Store após login:', {
            nome: userStore.nome,
            email: userStore.email,
            cpf: userStore.cpf,
            tipo: userStore.tipo,
            isAuthenticated: userStore.isAuthenticated
          });
          
          // Mensagem de sucesso
          this.notification.success('Login realizado com sucesso!');
          
          // Redireciona para o menu inicial
          await this.$router.push('/Menu/inicial');
        }

      } catch (error) {
        console.error('Erro ao fazer login:', error);
        
        if (error.response) {
          // Erro de resposta da API
          if (error.response.status === 401) {
            this.erro = "CPF ou senha incorretos.";
            this.notification.error("CPF ou senha incorretos.");
          } else if (error.response.status === 404) {
            this.erro = "Usuário não encontrado.";
            this.notification.error("Usuário não encontrado.");
          } else {
            this.erro = "Erro ao fazer login. Tente novamente.";
            this.notification.error("Erro ao fazer login. Tente novamente.");
          }
        } else {
          // Erro de conexão
          this.erro = "Erro de conexão com o servidor.";
          this.notification.error("Erro de conexão com o servidor.");
        }
      } finally {
        this.carregando = false;
      }
    },
  },
};
</script>

<style scoped>
.container-login {
  height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #003366, #0099cc);
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-login {
  background: #fff;
  padding: 40px 30px;
  border-radius: 15px;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
  width: 350px;
  text-align: center;
}

.form-login h1 {
  font-size: 28px;
  margin-bottom: 25px;
  color: #003366;
}

.input-box {
  display: flex;
  align-items: center;
  background: #f3f3f3;
  border-radius: 8px;
  margin-bottom: 15px;
  padding: 10px;
}

.input-box input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 20px;
  color: #003366;
}

.login-btn {
  width: 100%;
  background: #003366;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.login-btn:hover {
  background: #005fa3;
}

.login-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.erro-mensagem {
  color: #d32f2f;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
}

.register-link {
  margin-top: 20px;
  font-size: 14px;
  color: #003366;
}

.register-link a {
  color: #0099cc;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
