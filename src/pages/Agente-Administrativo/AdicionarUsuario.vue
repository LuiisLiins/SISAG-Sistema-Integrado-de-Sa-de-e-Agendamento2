<template>
    <div class="novo-encaminhamento">
        <div class="caixa-encaminhamento">
            <h1>Novo Usuário</h1>

            <form class="encaminhamento-form" @submit.prevent="adicionarUsuario">
                <div class="linha">
                    <div class="form-group">
                        <label>Nome</label>
                        <input type="text" v-model="usuario.nome" placeholder="Digite o nome" required />
                    </div>
                </div>

                <div class="linha">
                    <div class="form-group">
                        <label>Unidade de saúde</label>
                        <select v-model="usuario.unidade_saude_id" required>
                            <option value="">Selecione uma unidade</option>
                            <option v-for="unidade in unidades" :key="unidade.id" :value="unidade.id">
                                {{ unidade.nome }}
                            </option>
                        </select>
                    </div>
                </div>

                                <div class="linha">
                        <div class="form-group">
                            <label>Nome da mãe</label>
                            <input type="text" v-model="usuario.nome_mae" placeholder="Digite o nome da mãe" required />
                        </div>
                                            <div class="form-group">
                        <label>Nome do pai</label>
                        <input type="text" v-model="usuario.nome_pai" placeholder="Digite o nome do pai" required />
                    </div>
                </div>

                <div class="linha">
                    <div class="form-group">
                        <label>RG</label>
                        <input type="text" v-model="usuario.rg" @input="formatarRG" placeholder="Digite o RG" maxlength="12" />
                    </div>

                    <div class="form-group">
                        <label>CPF</label>
                        <input type="text" v-model="usuario.cpf" @input="formatarCPF" placeholder="Digite o CPF" required maxlength="14" />
                    </div>
                </div>
                <div class="linha">
                    <div class="form-group">
                        <label>Data de Nascimento</label>
                        <input type="date" v-model="usuario.data_nascimento" />
                    </div>

                    <div class="form-group">
                        <label>Cartão SUS</label>
                        <input type="text" v-model="usuario.cartao_sus" placeholder="Digite o Cartão SUS" maxlength="15"/>
                    </div>
                </div>

                <div class="linha">
                    <div class="form-group">
                        <label>Sexo</label>
                        <select v-model="usuario.sexo">
                            <option value="">Selecione</option>
                            <option value="masculino">Masculino</option>
                            <option value="feminino">Feminino</option>
                            <option value="outro">Outro</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <div class="form-group">
                            <label>Estado Civil</label>
                            <select v-model="usuario.estado_civil">
                                <option value="">Selecione</option>
                                <option value="solteiro">Solteiro</option>
                                <option value="casado">Casado</option>
                                <option value="divorciado">Divorciado</option>
                                <option value="viuvo">Viúvo</option>
                                <option value="uniao_estavel">União Estável</option>
                            </select>
                        </div>
                    </div>
                </div>


                <div class="linha">
                    <div class="form-group">
                        <label>Telefone</label>
                        <input type="tel" v-model="usuario.telefone" placeholder="(xx) xxxxx-xxxx" />
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" v-model="usuario.email" placeholder="Digite o Email" required />
                    </div>
                </div>

                <div class="linha">
                    <div class="form-group">
                        <label>Senha</label>
                        <input type="password" v-model="usuario.senha" placeholder="Digite a senha" required />
                    </div>
                    <div class="form-group">
                        <label>Tipo de Usuário</label>
                        <select v-model="usuario.tipo" required>
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
                        <input type="text" v-model="usuario.endereco" placeholder="Digite o endereço" />
                    </div>
                    <div class="form-group">
                        <label>Cidade</label>
                        <input type="text" v-model="usuario.cidade" placeholder="Digite a cidade" />
                    </div>
                </div>

                <div class="linha">
                    <div class="form-group">
                        <label>UF</label>
                        <select v-model="usuario.uf">
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
                        <input type="text" v-model="usuario.cep" @input="formatarCEP" placeholder="Digite o CEP" maxlength="9" />
                    </div>
                </div>

                <button type="submit" class="btn-confirmar" :disabled="carregando">
                    {{ carregando ? 'Adicionando...' : 'Adicionar usuário' }}
                </button>
            </form>
        </div>
    </div>
</template>

<script>
import api from '@/services/api';
import { useNotification } from '@/composables/useNotification';

export default {
    name: "AdicionarUsuario",
    data() {
        return {
            usuario: {
                nome: '',
                email: '',
                cpf: '',
                rg: '',
                sexo: '',
                cartao_sus: '',
                estado_civil: '',
                senha: '',
                tipo: '',
                telefone: '',
                data_nascimento: '',
                endereco: '',
                cidade: '',
                uf: '',
                cep: '',
                nome_mae: '',
                nome_pai: '',
                unidade_saude_id: ''
            },
            carregando: false,
            unidades: [],
            notification: useNotification()
        };
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
            
            this.usuario.cpf = valor;
        },
        formatarRG(event) {
            let valor = event.target.value.replace(/\D/g, '');
            
            if (valor.length <= 9) {
                valor = valor.replace(/(\d{2})(\d)/, '$1.$2');
                valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
                valor = valor.replace(/(\d{3})(\d{1})$/, '$1-$2');
            }
            
            this.usuario.rg = valor;
        },
        formatarCEP(event) {
            let valor = event.target.value.replace(/\D/g, '');
            
            if (valor.length <= 8) {
                valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
            }
            
            this.usuario.cep = valor;
        },
        async adicionarUsuario() {
            if (!this.usuario.nome || !this.usuario.email || !this.usuario.cpf || !this.usuario.senha || !this.usuario.tipo) {
                this.notification.warning('Por favor, preencha todos os campos obrigatórios (Nome, Email, CPF, Senha e Tipo).');
                return;
            }

            this.carregando = true;

            try {
                // Remover formatação dos campos antes de enviar
                const usuarioParaEnviar = {
                    ...this.usuario,
                    cpf: this.usuario.cpf.replace(/\D/g, ''),
                    rg: this.usuario.rg ? this.usuario.rg.replace(/\D/g, '') : '',
                    cep: this.usuario.cep ? this.usuario.cep.replace(/\D/g, '') : '',
                    telefone: this.usuario.telefone ? this.usuario.telefone.replace(/\D/g, '') : ''
                };

                const response = await api.post('/usuarios', usuarioParaEnviar);
                
                console.log('Usuário adicionado:', response.data);
                this.notification.success('Usuário adicionado com sucesso!');
                
                this.usuario = {
                    nome: '',
                    email: '',
                    cpf: '',
                    rg: '',
                    sexo: '',
                    cartao_sus: '',
                    estado_civil: '',
                    senha: '',
                    tipo: '',
                    telefone: '',
                    data_nascimento: '',
                    endereco: '',
                    cidade: '',
                    uf: '',
                    cep: '',
                    nome_mae: '',
                    nome_pai: '',
                    unidade_saude_id: ''
                };

            } catch (error) {
                console.error('Erro ao adicionar usuário:', error);
                
                if (error.response) {
                    if (error.response.status === 422) {
                        this.notification.error('Dados inválidos. Verifique os campos e tente novamente.');
                    } else if (error.response.status === 409) {
                        this.notification.error('CPF ou Email já cadastrado.');
                    } else {
                        this.notification.error('Erro ao adicionar usuário. Tente novamente.');
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
    margin-left: 100px;
    /* espaço para o menu lateral */
    margin-top: 80px;
    /* espaço para o cabeçalho */
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
