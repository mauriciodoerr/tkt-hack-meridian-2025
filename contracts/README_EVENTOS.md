# Contrato Stellar - Sistema de Pagamentos para Eventos e Festivais

Este contrato implementa um sistema completo de gerenciamento de pagamentos para eventos musicais, festivais e outros tipos de eventos, onde cada evento possui suas próprias configurações e saldos isolados.

## 🎯 **Funcionalidades Principais**

### **1. Gerenciamento de Eventos**
- ✅ **Criação de eventos** com nomes únicos
- ✅ **Taxa personalizada** por evento (ou padrão global)
- ✅ **Ativação/desativação** de eventos
- ✅ **Múltiplos organizadores** independentes
- ✅ **Tracking de volume** de transações por evento

### **2. Sistema de Pagamentos Isolados**
- ✅ **Saldos separados** por evento
- ✅ **Fee payer automático** com recompensa de 5%
- ✅ **Taxas configuráveis** por evento
- ✅ **Compatibilidade** com sistema original

### **3. Arquitetura Escalável**
- ✅ **Contrato único** para todos os eventos
- ✅ **Namespacing** eficiente de dados
- ✅ **Permissões hierárquicas** (Admin > Organizador)

## 🏗️ **Estrutura do Sistema**

```rust
// Estrutura de um evento
pub struct Event {
    pub id: u64,                    // ID único do evento
    pub name: String,               // Nome único do evento
    pub organizer: Address,         // Organizador do evento
    pub fee_rate: u32,             // Taxa em basis points (500 = 5%)
    pub is_active: bool,           // Status ativo/inativo
    pub created_at: u64,           // Timestamp de criação
    pub total_volume: i128,        // Volume total de transações
}
```

## 📋 **API Completa**

### **Gerenciamento de Eventos**

#### Criar Evento
```rust
create_event(
    organizer: Address,
    name: String,
    fee_rate: Option<u32>  // Se None, usa taxa padrão
) -> Result<u64, ContractError>
```

#### Consultar Evento
```rust
get_event(event_id: u64) -> Result<Event, ContractError>
get_event_by_name(name: String) -> Result<Event, ContractError>
```

#### Gerenciar Status
```rust
set_event_status(event_id: u64, is_active: bool) -> Result<(), ContractError>
update_event_fee_rate(event_id: u64, new_fee_rate: u32) -> Result<(), ContractError>
```

#### Listar Eventos
```rust
list_events(limit: u32) -> Result<Vec<Event>, ContractError>
```

### **Sistema de Pagamentos por Evento**

#### Depósitos
```rust
deposit_for_event(event_id: u64, from: Address, amount: i128) -> Result<(), ContractError>
deposit(from: Address, amount: i128) -> Result<(), ContractError>  // Geral
```

#### Consultar Saldos
```rust
event_balance(event_id: u64, address: Address) -> i128
balance(address: Address) -> i128  // Geral
```

#### Pagamentos
```rust
event_payment_with_fee(
    event_id: u64,
    from: Address,
    to: Address,
    fee_payer: Address,
    amount: i128
) -> Result<(), ContractError>

// Compatibilidade com sistema original
payment_with_third_party_fee(...) -> Result<(), ContractError>
```

## 🎪 **Casos de Uso Práticos**

### **Exemplo 1: Festival de Rock**
```rust
// 1. Organizador cria evento
let event_id = client.create_event(&organizer, &"Rock Festival 2024", &Some(300)); // 3%

// 2. Usuários depositam fundos para o evento
client.deposit_for_event(&event_id, &fan1, &500);
client.deposit_for_event(&event_id, &fan2, &300);

// 3. Transações isoladas no evento
client.event_payment_with_fee(&event_id, &fan1, &vendor, &sponsor, &100);
// Fan1 paga 100, vendor recebe 97, sponsor ganha 3 de recompensa
```

### **Exemplo 2: Múltiplos Eventos Simultâneos**
```rust
// Jazz Festival com taxa de 2%
let jazz_id = client.create_event(&organizer1, &"Jazz Night", &Some(200));

// Electronic Festival com taxa de 7%
let electronic_id = client.create_event(&organizer2, &"Electronic Beats", &Some(700));

// Cada evento opera independentemente
client.deposit_for_event(&jazz_id, &user, &1000);
client.deposit_for_event(&electronic_id, &user, &500);

// Saldos são isolados
assert_eq!(client.event_balance(&jazz_id, &user), 1000);
assert_eq!(client.event_balance(&electronic_id, &user), 500);
```

### **Exemplo 3: Sistema de Autorização Prévia (Original)**
```rust
// Fee payer autoriza até 1000 em fees (funciona globalmente)
client.authorize_fee_payments(&fee_payer, &1000);

// Pagamentos automáticos sem assinatura do fee_payer
client.payment_with_auth_fee_payer(&sender, &receiver, &fee_payer, &200);
```

## 🔐 **Sistema de Permissões**

| Função | Admin Global | Organizador do Evento | Qualquer Usuário |
|--------|-------------|----------------------|------------------|
| Criar evento | ✅ | ✅ | ✅ |
| Alterar taxa padrão | ✅ | ❌ | ❌ |
| Alterar taxa do evento | ✅ | ✅ | ❌ |
| Ativar/desativar evento | ✅ | ✅ | ❌ |
| Fazer pagamentos | ✅ | ✅ | ✅ |
| Depositar fundos | ✅ | ✅ | ✅ |

## 📊 **Eventos Emitidos**

### EventCreated
```rust
pub struct EventCreated {
    pub event_id: u64,
    pub name: String,
    pub organizer: Address,
    pub fee_rate: u32,
}
```

### PaymentEvent
```rust
pub struct PaymentEvent {
    pub event_id: u64,        // 0 = pagamento geral
    pub from: Address,
    pub to: Address,
    pub fee_payer: Address,
    pub amount: i128,
    pub fee_amount: i128,
    pub fee_rate: u32,
}
```

## 🧪 **Testes Implementados**

- ✅ **Criação de eventos** com taxas customizadas
- ✅ **Isolamento de saldos** entre eventos
- ✅ **Pagamentos com fees** específicos por evento
- ✅ **Múltiplos eventos** simultâneos
- ✅ **Gerenciamento de status** de eventos
- ✅ **Atualização de taxas** por evento
- ✅ **Busca por nome** de evento
- ✅ **Compatibilidade** com sistema original
- ✅ **Tracking de volume** por evento

### Executar Testes
```bash
cargo test --quiet
```

## 🚀 **Vantagens da Arquitetura**

### **Contrato Único vs Múltiplas Instâncias**

| Aspecto | Contrato Único (✅ Implementado) | Múltiplas Instâncias |
|---------|----------------------------------|----------------------|
| **Custo de Deploy** | Baixo (1x) | Alto (N eventos) |
| **Gestão** | Centralizada | Distribuída |
| **Upgrades** | Simples | Complexo |
| **Isolamento** | Por namespace | Total |
| **Eficiência** | Alta | Média |

### **Por que Escolhemos Contrato Único?**

1. **💰 Economia**: Um único deploy para todos os eventos
2. **🔧 Manutenção**: Atualizações centralizadas
3. **📈 Escalabilidade**: Suporta milhares de eventos
4. **🔍 Transparência**: Fácil auditoria e monitoramento
5. **⚡ Performance**: Menos overhead de infraestrutura

## 🎵 **Ideal Para**

- 🎪 **Festivais de Música**
- 🎤 **Eventos Corporativos**
- 🎭 **Shows e Espetáculos**
- 🏟️ **Eventos Esportivos**
- 🎨 **Exposições e Feiras**
- 🎊 **Qualquer evento** que precise de pagamentos isolados

O sistema oferece flexibilidade total para organizadores de eventos enquanto mantém a eficiência e segurança de um contrato único bem testado!