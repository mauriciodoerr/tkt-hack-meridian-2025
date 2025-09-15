# Exemplos de CLI - Contrato de Pagamentos para Eventos

Este documento apresenta exemplos práticos de como usar o contrato via CLI do Stellar usando `stellar contract invoke`.

## 📋 Pré-requisitos

```bash
# 1. Deploy do contrato (substitua pelos seus valores)
CONTRACT_ID=""
ADMIN_ADDRESS=""
ORGANIZER_ADDRESS=""
USER_ADDRESS=""
FEE_PAYER_ADDRESS=""

# 2. Configurar network (testnet ou mainnet)
stellar network add testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"
```

## 🚀 1. Inicialização do Contrato

### Inicializar contrato com taxa padrão de 5%
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ADMIN_ADDRESS \
  --network local \
  -- \
  initialize \
  --admin $ADMIN_ADDRESS \
  --default_fee_rate 500
```

### Verificar configuração inicial
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ADMIN_ADDRESS \
  --network local \
  -- \
  get_config
```

## 🎪 2. Gerenciamento de Eventos

### Criar um novo evento com taxa padrão
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network local \
  -- \
  create_event \
  --organizer $ORGANIZER_ADDRESS \
  --name "Rock Festival 2024" \
  --fee_rate null
```

### Criar evento com taxa personalizada (3%)
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network local \
  -- \
  create_event \
  --organizer $ORGANIZER_ADDRESS \
  --name "Jazz Night 2024" \
  --fee_rate 300
```

### Consultar evento por ID
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network local \
  -- \
  get_event \
  --event_id 1
```

### Consultar evento por nome
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network local \
  -- \
  get_event_by_name \
  --name "Rock Festival 2024"
```

### Listar todos os eventos (limite de 10)
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network local \
  -- \
  list_events \
  --limit 10
```

### Desativar um evento (apenas organizador)
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network local \
  -- \
  set_event_status \
  --event_id 1 \
  --is_active false
```

### Atualizar taxa de um evento para 8%
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network local \
  -- \
  update_event_fee_rate \
  --event_id 1 \
  --new_fee_rate 800
```

## 💰 3. Sistema de Depósitos

### Depósito geral (sem evento específico)
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network local \
  -- \
  deposit \
  --from $USER_ADDRESS \
  --amount 1000
```

### Depósito para evento específico
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network local \
  -- \
  deposit_for_event \
  --event_id 1 \
  --from $USER_ADDRESS \
  --amount 500
```

## 🔍 4. Consultas de Saldo

### Consultar saldo geral
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network local \
  -- \
  balance \
  --address $USER_ADDRESS
```

### Consultar saldo de evento específico
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network local \
  -- \
  event_balance \
  --event_id 1 \
  --address $USER_ADDRESS
```

## 💸 5. Sistema de Pagamentos

### Pagamento para evento específico com fee payer
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network local \
  -- \
  event_payment_with_fee \
  --event_id 1 \
  --from $USER_ADDRESS \
  --to $ORGANIZER_ADDRESS \
  --fee_payer $FEE_PAYER_ADDRESS \
  --amount 200
```

### Pagamento tradicional (sem evento específico)
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network local \
  -- \
  payment_with_third_party_fee \
  --from $USER_ADDRESS \
  --to $ORGANIZER_ADDRESS \
  --fee_payer $FEE_PAYER_ADDRESS \
  --amount 100
```

## 🔐 6. Sistema de Autorização de Fees

### Autorizar pagamento automático de fees (até 1000)
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $FEE_PAYER_ADDRESS \
  --network local \
  -- \
  authorize_fee_payments \
  --fee_payer $FEE_PAYER_ADDRESS \
  --max_fee_amount 1000
```

### Pagamento com fee payer pré-autorizado
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network local \
  -- \
  payment_with_auth_fee_payer \
  --from $USER_ADDRESS \
  --to $ORGANIZER_ADDRESS \
  --fee_payer $FEE_PAYER_ADDRESS \
  --amount 150
```

### Consultar autorização restante
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network local \
  -- \
  get_fee_authorization \
  --fee_payer $FEE_PAYER_ADDRESS
```

### Revogar autorização
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $FEE_PAYER_ADDRESS \
  --network local \
  -- \
  revoke_fee_authorization \
  --fee_payer $FEE_PAYER_ADDRESS
```

## ⚙️ 7. Configurações Administrativas

### Atualizar taxa padrão para 6% (apenas admin)
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ADMIN_ADDRESS \
  --network local \
  -- \
  update_default_fee_rate \
  --new_fee_rate 600
```

## 🎯 8. Casos de Uso Práticos

### Cenário 1: Festival de Rock com taxa personalizada

```bash
# 1. Organizador cria evento com taxa de 3%
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network local \
  -- \
  create_event \
  --organizer $ORGANIZER_ADDRESS \
  --name "Rock Festival 2024" \
  --fee_rate 300

# 2. Fãs depositam fundos para o evento
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network local \
  -- \
  deposit_for_event \
  --event_id 1 \
  --from $USER_ADDRESS \
  --amount 500

# 3. Pagamento no evento (compra de bebida)
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network local \
  -- \
  event_payment_with_fee \
  --event_id 1 \
  --from $USER_ADDRESS \
  --to $ORGANIZER_ADDRESS \
  --fee_payer $FEE_PAYER_ADDRESS \
  --amount 50
```

### Cenário 2: Múltiplos eventos simultâneos

```bash
# 1. Criar evento Jazz com taxa de 2%
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network local \
  -- \
  create_event \
  --organizer $ORGANIZER_ADDRESS \
  --name "Jazz Night" \
  --fee_rate 200

# 2. Criar evento Electronic com taxa de 7%
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network local \
  -- \
  create_event \
  --organizer $ORGANIZER_ADDRESS \
  --name "Electronic Beats" \
  --fee_rate 700

# 3. Depositar em ambos eventos
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network local \
  -- \
  deposit_for_event \
  --event_id 1 \
  --from $USER_ADDRESS \
  --amount 300

stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network local \
  -- \
  deposit_for_event \
  --event_id 2 \
  --from $USER_ADDRESS \
  --amount 200
```

## 📊 9. Monitoramento e Auditoria

### Verificar volume total de um evento
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network local \
  -- \
  get_event \
  --event_id 1
# O campo 'total_volume' mostra o volume total transacionado
```

### Listar todos os eventos para auditoria
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network local \
  -- \
  list_events \
  --limit 50
```

## 🚨 Tratamento de Erros Comuns

### Erro: Event not found
```bash
# Verificar se o evento existe
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network local \
  -- \
  list_events \
  --limit 10
```

### Erro: Insufficient balance
```bash
# Verificar saldo antes do pagamento
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network local \
  -- \
  event_balance \
  --event_id 1 \
  --address $USER_ADDRESS
```

### Erro: Event not active
```bash
# Reativar evento (apenas organizador)
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network local \
  -- \
  set_event_status \
  --event_id 1 \
  --is_active true
```

## 📝 Notas Importantes

1. **Autenticação**: Sempre use o `--source` correto para cada operação
2. **Network**: Substitua `testnet` por `mainnet` para produção
3. **Addresses**: Substitua os endereços de exemplo pelos seus reais
4. **Fees**: Valores em basis points (500 = 5%, 1000 = 10%)
5. **Amounts**: Valores em stroops (1 XLM = 10^7 stroops)

## 🔧 Troubleshooting

### Verificar se o contrato está inicializado
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network local \
  -- \
  get_config
```

### Verificar eventos disponíveis
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network local \
  -- \
  list_events \
  --limit 5
```