# Contrato Stellar - Pagamento com Taxa por Terceira Carteira

Este contrato implementa um sistema de pagamento na rede Stellar onde:
- Uma carteira (remetente) envia fundos para outra carteira (destinatário)
- Uma terceira carteira paga a taxa da transação
- A terceira carteira recebe 5% do valor da transação como recompensa

## Funcionalidades

### 1. Inicialização do Contrato
```rust
initialize(admin: Address, fee_rate: u32) -> Result<(), &'static str>
```
- Define o administrador e a taxa (em basis points: 500 = 5%)

### 2. Depósito de Fundos
```rust
deposit(from: Address, amount: i128) -> Result<(), &'static str>
```
- Permite que usuários depositem fundos no contrato

### 3. Pagamento com Taxa por Terceira Carteira
```rust
payment_with_third_party_fee(
    from: Address,      // Remetente
    to: Address,        // Destinatário
    fee_payer: Address, // Pagador da taxa
    amount: i128        // Valor a ser enviado
) -> Result<(), &'static str>
```

### 4. Consulta de Saldo
```rust
balance(address: Address) -> i128
```

### 5. Atualização da Taxa (apenas admin)
```rust
update_fee_rate(new_fee_rate: u32) -> Result<(), ContractError>
```

### 6. Sistema de Autorização Automática

#### Autorizar Pagamentos Automáticos
```rust
authorize_fee_payments(fee_payer: Address, max_fee_amount: i128) -> Result<(), ContractError>
```

#### Pagamento com Fee Payer Pré-autorizado
```rust
payment_with_auth_fee_payer(
    from: Address,
    to: Address,
    fee_payer: Address,
    amount: i128
) -> Result<(), ContractError>
```

#### Consultar Autorização
```rust
get_fee_authorization(fee_payer: Address) -> i128
```

#### Revogar Autorização
```rust
revoke_fee_authorization(fee_payer: Address)
```

## Como Funciona

1. **Setup Inicial**: Carteiras depositam fundos no contrato
2. **Transação**:
   - Remetente tem o valor total deduzido
   - Destinatário recebe valor líquido (valor - taxa de 5%)
   - Pagador de taxa recebe 5% do valor como recompensa
3. **Resultado**: Pagador de taxa ganha 5% por facilitar a transação

## Autorização Automática de Fees

O contrato oferece duas formas de usar o fee_payer:

### **Método 1: Assinatura Manual (Original)**
- Fee_payer precisa assinar cada transação
- Usa `payment_with_third_party_fee()`

### **Método 2: Autorização Prévia (Novo)**
- Fee_payer autoriza uma vez um valor máximo
- Usa `payment_with_auth_fee_payer()`
- **Apenas o remetente precisa assinar!**

## Exemplo de Uso

```rust
// Inicializar contrato com taxa de 5%
client.initialize(&admin, &500);

// Depositar fundos
client.deposit(&sender, &1000);      // Remetente deposita 1000
client.deposit(&fee_payer, &100);    // Pagador de taxa deposita 100

// Realizar pagamento de 200
client.payment_with_third_party_fee(&sender, &receiver, &fee_payer, &200);

// Resultado:
// - Sender: 1000 - 200 = 800
// - Receiver: 200 - 10 = 190 (valor líquido)
// - Fee payer: 100 + 10 = 110 (recebe 5% como recompensa)
```

## Exemplo com Autorização Automática

```rust
// 1. Fee payer autoriza até 1000 em fees (apenas uma vez)
client.authorize_fee_payments(&fee_payer, &1000);

// 2. Agora remetentes podem fazer pagamentos sem fee_payer assinar
client.payment_with_auth_fee_payer(&sender, &receiver, &fee_payer, &200);

// 3. Verificar autorização restante
let remaining = client.get_fee_authorization(&fee_payer); // 990 (1000 - 10)

// 4. Revogar autorização quando necessário
client.revoke_fee_authorization(&fee_payer);
```

## Testes Unitários

O projeto inclui testes abrangentes que validam:

1. **Inicialização do contrato**
2. **Funcionalidade de depósito**
3. **Pagamentos com validação de saldos**
4. **Cálculos precisos de taxa**
5. **Validação de fundos insuficientes**
6. **Múltiplas transações**
7. **Atualização de taxa**
8. **Sistema de autorização automática**
9. **Autorização insuficiente**
10. **Revogação de autorização**
11. **Múltiplos pagamentos autorizados**
12. **Casos extremos e validações**

### Executar Testes

```bash
cargo test
```

**Nota**: Devido a problemas de compatibilidade com a versão atual do Cargo, pode ser necessário usar uma versão mais recente do Rust/Cargo ou ajustar as dependências.

## Estrutura do Projeto

```
contracts/
├── Cargo.toml          # Configuração do projeto
├── src/
│   ├── lib.rs          # Contrato principal
│   ├── test.rs         # Testes unitários
│   └── main.rs         # Ponto de entrada
└── README.md           # Esta documentação
```

## Eventos

O contrato emite eventos `PaymentEvent` para cada transação realizada, contendo:
- Endereços das três carteiras envolvidas
- Valor da transação
- Valor da taxa
- Taxa configurada

## Segurança

- Validação de autenticação para todas as operações
- Verificação de saldos suficientes
- Proteção contra valores negativos ou zero
- Limitação da taxa máxima a 100%
- Apenas admin pode alterar configurações