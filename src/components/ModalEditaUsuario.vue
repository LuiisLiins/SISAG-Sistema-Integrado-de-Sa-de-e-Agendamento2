<template>
  <transition name="fade">
    <div v-if="mostrar" class="modal-overlay" @click="fechar">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2>Editar Usuário</h2>
          <i class="fi fi-rr-cross-small" @click="fechar"></i>
        </div>

        <form class="modal-form" @submit.prevent="salvar">
          <div class="linha">
            <div class="form-group">
              <label>Nome</label>
              <input type="text" v-model="usuarioEdit.nome" required />
            </div>
          </div>

          <div class="linha">
            <div class="form-group">
              <label>RG</label>
              <input type="text" v-model="usuarioEdit.rg" @input="formatarRG" maxlength="12" />
            </div>
            <div class="form-group">
              <label>CPF</label>
              <input type="text" v-model="usuarioEdit.cpf" @input="formatarCPF" required maxlength="14" />
            </div>
          </div>

          <div class="linha">
            <div class="form-group">
              <label>Data de Nascimento</label>
              <input type="date" v-model="usuarioEdit.data_nascimento" />
            </div>
            <div class="form-group">
              <label>Cartão SUS</label>
              <input type="text" v-model="usuarioEdit.cartao_sus" />
            </div>
          </div>

          <div class="linha">
            <div class="form-group">
              <label>Sexo</label>
              <select v-model="usuarioEdit.sexo">
                <option value="">Selecione</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div class="form-group">
              <label>Estado Civil</label>
              <select v-model="usuarioEdit.estado_civil">
                <option value="">Selecione</option>
                <option value="solteiro">Solteiro</option>
                <option value="casado">Casado</option>
                <option value="divorciado">Divorciado</option>
                <option value="viuvo">Viúvo</option>
                <option value="uniao_estavel">União Estável</option>
              </select>
            </div>
          </div>

          <div class="linha">
            <div class="form-group">
              <label>Telefone</label>
              <input type="tel" v-model="usuarioEdit.telefone" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" v-model="usuarioEdit.email" required />
            </div>
          </div>

          <div class="linha">
            <div class="form-group">
              <label>Tipo de Usuário</label>
              <select v-model="usuarioEdit.tipo" required>
                <option value="">Selecione</option>
                <option value="paciente">Paciente</option>
                <option value="agente">Agente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          <div class="linha">
            <div class="form-group">
              <label>Endereço</label>
              <input type="text" v-model="usuarioEdit.endereco" />
            </div>
            <div class="form-group">
              <label>Cidade</label>
              <input type="text" v-model="usuarioEdit.cidade" />
            </div>
          </div>

          <div class="linha">
            <div class="form-group">
              <label>UF</label>
              <select v-model="usuarioEdit.uf">
                <option value="">Selecione</option>
                <option value="AC">AC</option>
                <option value="AL">AL</option>
                <option value="AP">AP</option>
                <option value="AM">AM</option>
                <option value="BA">BA</option>
                <option value="CE">CE</option>
                <option value="DF">DF</option>
                <option value="ES">ES</option>
                <option value="GO">GO</option>
                <option value="MA">MA</option>
                <option value="MT">MT</option>
                <option value="MS">MS</option>
                <option value="MG">MG</option>
                <option value="PA">PA</option>
                <option value="PB">PB</option>
                <option value="PR">PR</option>
                <option value="PE">PE</option>
                <option value="PI">PI</option>
                <option value="RJ">RJ</option>
                <option value="RN">RN</option>
                <option value="RS">RS</option>
                <option value="RO">RO</option>
                <option value="RR">RR</option>
                <option value="SC">SC</option>
                <option value="SP">SP</option>
                <option value="SE">SE</option>
                <option value="TO">TO</option>
              </select>
            </div>
            <div class="form-group">
              <label>CEP</label>
              <input type="text" v-model="usuarioEdit.cep" @input="formatarCEP" maxlength="9" />
            </div>
          </div>

          <div class="linha">
            <div class="form-group">
              <label>Unidade de Saúde</label>
              <select v-model="usuarioEdit.unidade_saude_id" required>
                <option value="">Selecione uma unidade</option>
                <option v-for="unidade in unidades" :key="unidade.id" :value="unidade.id">
                  {{ unidade.nome }}
                </option>
              </select>
            </div>
          </div>

          <div class="modal-acoes">
            <button type="button" class="btn-cancelar" @click="fechar">Cancelar</button>
            <button type="submit" class="btn-salvar" :disabled="carregando">
              {{ carregando ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'ModalEditaUsuario',
  props: {
    mostrar: Boolean,
    usuario: Object
  },
  data() {
    return {
      usuarioEdit: {
        nome: '',
        email: '',
        cpf: '',
        rg: '',
        sexo: '',
        cartao_sus: '',
        estado_civil: '',
        tipo: '',
        telefone: '',
        data_nascimento: '',
        endereco: '',
        cidade: '',
        uf: '',
        cep: '',
        unidade_saude_id: ''
      },
      carregando: false,
      unidades: []
    };
  },
  watch: {
    usuario: {
      immediate: true,
      handler(novoUsuario) {
        if (novoUsuario) {
          this.usuarioEdit = { ...novoUsuario };
          if (this.usuarioEdit.data_nascimento) {
            this.usuarioEdit.data_nascimento = this.usuarioEdit.data_nascimento.split('T')[0];
          }
        }
      }
    }
  },
  mounted() {
    this.carregarUnidades();
  },
  methods: {
    async carregarUnidades() {
      try {
        const res = await api.get('/unidades-saude');
        this.unidades = res.data || [];
      } catch (error) {
        console.error('Erro ao carregar unidades:', error);
        this.unidades = [];
      }
    },
    formatarCPF(event) {
      let valor = event.target.value.replace(/\D/g, '');
      if (valor.length <= 11) {
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      }
      this.usuarioEdit.cpf = valor;
    },
    formatarRG(event) {
      let valor = event.target.value.replace(/\D/g, '');
      if (valor.length <= 9) {
        valor = valor.replace(/(\d{2})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d{1})$/, '$1-$2');
      }
      this.usuarioEdit.rg = valor;
    },
    formatarCEP(event) {
      let valor = event.target.value.replace(/\D/g, '');
      if (valor.length <= 8) {
        valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
      }
      this.usuarioEdit.cep = valor;
    },
    async salvar() {
      if (!this.usuarioEdit.nome || !this.usuarioEdit.email || !this.usuarioEdit.cpf || !this.usuarioEdit.tipo || !this.usuarioEdit.unidade_saude_id) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      this.carregando = true;

      try {
        const usuarioParaEnviar = {
          ...this.usuarioEdit,
          cpf: this.usuarioEdit.cpf.replace(/\D/g, ''),
          rg: this.usuarioEdit.rg ? this.usuarioEdit.rg.replace(/\D/g, '') : '',
          cep: this.usuarioEdit.cep ? this.usuarioEdit.cep.replace(/\D/g, '') : '',
          telefone: this.usuarioEdit.telefone ? this.usuarioEdit.telefone.replace(/\D/g, '') : ''
        };

        await api.put(`/usuarios/${usuarioParaEnviar.id}`, usuarioParaEnviar);
        alert('Usuário atualizado com sucesso!');
        this.$emit('atualizado');
        this.fechar();
      } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        if (error.response?.status === 422) {
          alert('Dados inválidos. Verifique os campos e tente novamente.');
        } else {
          alert('Erro ao atualizar usuário. Tente novamente.');
        }
      } finally {
        this.carregando = false;
      }
    },
    fechar() {
      this.$emit('fechar');
    }
  }
};
</script>

<style scoped>
/* O mesmo estilo do modal anterior */
.modal-overlay { position: fixed; top:0; left:0; width:100vw; height:100vh; background-color:rgba(0,0,0,0.6); display:flex; justify-content:center; align-items:center; z-index:9999; }
.modal-container { background:white; border-radius:12px; width:90%; max-width:700px; max-height:85vh; overflow-y:auto; box-shadow:0 8px 32px rgba(0,0,0,0.2); animation: slideDown 0.3s ease-out; }
@keyframes slideDown { from { opacity:0; transform:translateY(-30px); } to { opacity:1; transform:translateY(0); } }
.modal-header { background-color:#0d47a1; color:white; padding:20px 25px; border-radius:12px 12px 0 0; display:flex; justify-content:space-between; align-items:center; }
.modal-header h2 { margin:0; font-size:20px; font-weight:600; }
.modal-header i { cursor:pointer; font-size:24px; transition: transform 0.2s; }
.modal-header i:hover { transform:rotate(90deg); }
.modal-form { padding:25px; display:flex; flex-direction:column; gap:15px; }
.linha { display:flex; gap:15px; }
.form-group { flex:1; display:flex; flex-direction:column; }
label { font-weight:600; color:#0d47a1; margin-bottom:6px; font-size:14px; }
input, select { padding:10px; border:1px solid #bbdefb; border-radius:6px; font-size:14px; outline:none; transition:border-color 0.3s ease; }
input:focus, select:focus { border-color:#1565c0; }
.modal-acoes { display:flex; gap:10px; margin-top:20px; justify-content:flex-end; }
.btn-cancelar, .btn-salvar { border:none; border-radius:6px; padding:12px 24px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.3s ease; }
.btn-cancelar { background-color:#9e9e9e; color:white; }
.btn-cancelar:hover { background-color:#757575; }
.btn-salvar { background-color:#0d47a1; color:white; }
.btn-salvar:hover { background-color:#083b88; }
.btn-salvar:disabled { background-color:#cccccc; cursor:not-allowed; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity:0; }
.modal-container::-webkit-scrollbar { width:8px; }
.modal-container::-webkit-scrollbar-track { background:#f0f0f0; }
.modal-container::-webkit-scrollbar-thumb { background-color:#90caf9; border-radius:8px; }
@media (max-width:768px) { .linha { flex-direction:column; } .modal-container { width:95%; max-height:90vh; } }
</style>
