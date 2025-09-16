# EventCoin Mock System

Sistema de mock centralizado para o EventCoin, seguindo o padrão do DeFi Risk Guardian.

## 🚀 Quick Start

### 1. Importar o API Client
```typescript
import { apiClient } from '@/utils/api-client'
```

### 2. Usar em Componentes
```typescript
// React Hook
const { events, loading, error } = useEvents()

// Direto
const response = await apiClient.getEvents(1, 10)
if (response.success) {
  console.log('Events:', response.data)
}
```

## 📁 Estrutura de Arquivos

```
/app/utils/
├── api-config.ts      # Configuração de endpoints
├── mock-data.ts       # Dados mock centralizados
├── mock-api.ts        # Implementação da API mock
├── api-client.ts      # Cliente API com switch mock/real
├── types/index.ts     # Tipos TypeScript
├── example-usage.ts   # Exemplos de uso
└── README.md          # Esta documentação
```

## 🔧 Configuração

### Environment Variables
```bash
# Frontend
NEXT_PUBLIC_USE_MOCK=true
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Backend
USE_MOCK=true
NODE_ENV=development
```

### Mock Automático
O mock é ativado automaticamente quando:
- `NODE_ENV === 'development'`
- `NEXT_PUBLIC_USE_MOCK === 'true'`

## 📊 Endpoints Disponíveis

### MVP (36h Roadmap)
- ✅ **Auth**: login, register, profile
- ✅ **Events**: list, get, create, join, register
- ✅ **Payments**: balance, transfer, buy tokens

### Phase 2 (Post-MVP)
- 🔄 **DEX**: pools, swap, liquidity
- 🔄 **Notifications**: list, mark read
- 🔄 **Analytics**: dashboard, stats

## 🎯 Exemplos de Uso

### React Hooks
```typescript
import { useEvents, useUserProfile, useNotifications } from '@/utils/example-usage'

function EventsPage() {
  const { events, loading, error } = useEvents()
  const { user } = useUserProfile()
  const { notifications, markAsRead } = useNotifications()
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      {events.map(event => (
        <div key={event.id}>{event.title}</div>
      ))}
    </div>
  )
}
```

### API Calls Diretos
```typescript
import { apiClient } from '@/utils/api-client'

// Get events
const events = await apiClient.getEvents(1, 10)

// Join event
const joinResult = await apiClient.joinEvent('event-1')

// Transfer TKT
const transferResult = await apiClient.transferP2P('user-2', 100)
```

### Error Handling
```typescript
import { handleApiError } from '@/utils/example-usage'

const result = await handleApiError(() => apiClient.getEvents(1, 10))
if (result.success) {
  console.log('Events:', result.data)
} else {
  console.error('Error:', result.error)
}
```

## 🗄️ Dados Mock

### Usuários
- Daniel Roger Gorgonha (rogergorgonha@gmail.com)
- Maria Silva (maria.silva@email.com)
- João Santos (joao.santos@email.com)

### Eventos
- Festival de Música Eletrônica
- Workshop de Blockchain
- Conferência de Tecnologia
- Sui Bootcamp I Brasil
- Sunset with Stellar Ambassadors
- CryptoLar x Starknet Hackathon

### Notificações
- Meta de eventos atingida
- Saldo TKT baixo
- Novo evento disponível
- Desconto especial
- Evento aprovado

## 🔄 Switch Mock/Real API

### Automático
```typescript
// Em desenvolvimento: usa mock
// Em produção: usa API real
const response = await apiClient.getEvents(1, 10)
```

### Manual
```typescript
// Forçar mock
process.env.NEXT_PUBLIC_USE_MOCK = 'true'

// Forçar API real
process.env.NEXT_PUBLIC_USE_MOCK = 'false'
```

## 📈 Performance

### Mock Delays
- **Fast**: 100ms
- **Normal**: 500ms (default)
- **Slow**: 1000ms
- **Very Slow**: 2000ms

### Error Rates
- **Network Error**: 1%
- **Validation Error**: 2%
- **Auth Error**: 0.5%

## 🧪 Testing

### Unit Tests
```typescript
import { mockAPI } from '@/utils/mock-api'

test('should return events', async () => {
  const response = await mockAPI.getEvents(1, 10)
  expect(response.success).toBe(true)
  expect(response.data.data).toHaveLength(10)
})
```

### Integration Tests
```typescript
import { apiClient } from '@/utils/api-client'

test('should switch between mock and real API', async () => {
  // Test with mock
  process.env.NEXT_PUBLIC_USE_MOCK = 'true'
  const mockResponse = await apiClient.getEvents(1, 10)
  
  // Test with real API
  process.env.NEXT_PUBLIC_USE_MOCK = 'false'
  const realResponse = await apiClient.getEvents(1, 10)
})
```

## 🚀 Próximos Passos

1. **Implementar Backend**: Criar endpoints reais
2. **Integrar Frontend**: Conectar componentes com API
3. **Adicionar Testes**: Unit e integration tests
4. **Configurar CI/CD**: Deploy automático
5. **Monitoramento**: Logs e métricas

## 📚 Referências

- [DeFi Risk Guardian](https://github.com/danielgorgonha/defi-risk-guardian/tree/main/frontend/app/utils)
- [EventCoin MVP Roadmap](./docs/features-bugs/sistema-mock-centralizado.md)
- [API Endpoints Configuration](./docs/features-bugs/sistema-mock-centralizado.md)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](../../../LICENSE) para mais detalhes.
