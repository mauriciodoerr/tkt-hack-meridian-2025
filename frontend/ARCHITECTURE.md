# EventCoin Frontend Architecture

## 📁 Estrutura de Pastas (Next.js 14 + App Router)

```
apps/frontend/
├── app/                          # App Router (Next.js 14)
│   ├── (auth)/                   # Route Groups
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Dashboard Routes
│   │   ├── user/
│   │   ├── organizer/
│   │   └── vendor/
│   ├── events/
│   │   ├── [id]/
│   │   └── create/
│   ├── payments/
│   │   ├── qr-scanner/
│   │   └── history/
│   ├── globals.css               # Global Styles
│   ├── layout.tsx                # Root Layout
│   ├── page.tsx                  # Home Page
│   └── loading.tsx               # Global Loading
├── components/                   # Reusable Components
│   ├── ui/                       # Base UI Components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts
│   ├── layout/                   # Layout Components
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── MobileMenu.tsx
│   ├── features/                 # Feature-specific Components
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── SocialLogin.tsx
│   │   ├── events/
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventForm.tsx
│   │   │   └── EventTimeline.tsx
│   │   ├── payments/
│   │   │   ├── QRScanner.tsx
│   │   │   ├── PaymentForm.tsx
│   │   │   └── TransactionHistory.tsx
│   │   └── dashboard/
│   │       ├── StatsCard.tsx
│   │       ├── BalanceCard.tsx
│   │       └── ActivityFeed.tsx
│   └── providers/                # Context Providers
│       ├── AuthProvider.tsx
│       ├── WebSocketProvider.tsx
│       └── ThemeProvider.tsx
├── lib/                          # Utilities & Config
│   ├── auth.ts                   # Auth Configuration
│   ├── api.ts                    # API Client
│   ├── websocket.ts              # WebSocket Client
│   ├── stellar.ts                # Stellar SDK Integration
│   ├── utils.ts                  # Utility Functions
│   └── constants.ts              # App Constants
├── hooks/                        # Custom React Hooks
│   ├── useAuth.ts
│   ├── useWebSocket.ts
│   ├── useStellar.ts
│   └── useLocalStorage.ts
├── types/                        # TypeScript Types
│   ├── auth.ts
│   ├── events.ts
│   ├── payments.ts
│   └── api.ts
├── styles/                       # Additional Styles
│   ├── components.css
│   └── animations.css
└── public/                       # Static Assets
    ├── icons/
    ├── images/
    └── manifest.json
```

## 🎯 Componentes Principais para MVP

### 1. **Hero Section** (Landing Page)
- Título impactante com gradiente
- CTA buttons principais
- Estatísticas animadas
- Background com gradiente animado

### 2. **Navbar** (Layout Global)
- Logo EventCoin
- Menu responsivo
- Botões de login/registro
- Dark mode toggle

### 3. **Timeline** (Eventos)
- Lista de eventos com cards
- Filtros por status
- Busca e ordenação
- Paginação

### 4. **Dashboard** (Multi-role)
- Cards de métricas em tempo real
- Gráficos de atividade
- Histórico de transações
- Ações rápidas

### 5. **QR Scanner** (Pagamentos)
- Interface de câmera
- Validação de QR codes
- Formulário de pagamento
- Confirmação de transação

## 🚀 Performance & SEO

### Otimizações
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Dynamic imports
- **Bundle Analysis**: @next/bundle-analyzer
- **PWA**: Service Worker + Manifest

### SEO
- **Metadata**: App Router metadata API
- **Sitemap**: Dynamic sitemap generation
- **Open Graph**: Social media optimization
- **Structured Data**: JSON-LD for events

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px (Mobile-first)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px
- **Large**: > 1440px

### Mobile Optimizations
- Touch-friendly buttons (44px min)
- Swipe gestures
- Bottom navigation
- Optimized images

## 🔧 Development Tools

### Code Quality
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **TypeScript**: Type safety

### Testing
- **Jest**: Unit tests
- **Testing Library**: Component tests
- **Playwright**: E2E tests
- **Storybook**: Component stories

## 🌐 Deployment

### Vercel (Frontend)
- Automatic deployments
- Preview deployments
- Edge functions
- Analytics

### Environment Variables
```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_WS_URL=
NEXT_PUBLIC_STELLAR_NETWORK=
NEXT_PUBLIC_APP_URL=
```

## 📊 Analytics & Monitoring

### Performance
- **Core Web Vitals**: LCP, FID, CLS
- **Bundle Size**: Monitoring
- **Error Tracking**: Sentry
- **User Analytics**: Vercel Analytics

### Business Metrics
- **Conversion Funnel**: Login → Purchase → Payment
- **User Engagement**: Time on site, pages per session
- **Feature Usage**: Most used features
- **Error Rates**: Failed transactions, crashes
