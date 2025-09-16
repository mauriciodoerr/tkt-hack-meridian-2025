import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Navbar } from "../components/layout/Navbar";
import { 
  Wallet, 
  CreditCard, 
  Smartphone, 
  Zap, 
  Shield, 
  Users,
  ArrowRight,
  Star,
  TrendingUp,
  Clock,
  Percent,
  Eye,
  Globe,
  Lock,
  CheckCircle,
  Play,
  ExternalLink,
  Sparkles,
  Target,
  DollarSign,
  Activity
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-premium">
      <Navbar />
      
      {/* Hero Section */}
      <main className="pt-16">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                Powered by Stellar Blockchain
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              EventCoin
              <br />
              <span className="text-gradient-premium animate-gradient-x">
                A Nova Economia de Eventos
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Revolucione seus eventos com blockchain, transações gasless e tokens transferíveis. 
              Experiência Web2 com tecnologia Web3.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600">
                <Wallet className="w-6 h-6 mr-3" />
                Começar Agora
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white/20 hover:bg-white/10">
                <Play className="w-6 h-6 mr-3" />
                Ver Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Stellar Technology Section */}
        <div className="bg-dark-900/50 backdrop-blur-xl border-y border-white/10 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Powered by Stellar
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                A infraestrutura blockchain mais confiável para pagamentos globais
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card variant="premium" className="p-8 text-center group hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="w-8 h-8 text-blue-400" />
                  </div>
                  <CardTitle className="text-2xl text-white">Rede Global</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lg text-gray-300">
                    Stellar conecta bancos, sistemas de pagamento e pessoas em todo o mundo
                  </CardDescription>
                </CardContent>
              </Card>

              <Card variant="premium" className="p-8 text-center group hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-8 h-8 text-green-400" />
                  </div>
                  <CardTitle className="text-2xl text-white">Transações Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lg text-gray-300">
                    Confirmações em segundos com taxas mínimas e transparência total
                  </CardDescription>
                </CardContent>
              </Card>

              <Card variant="premium" className="p-8 text-center group hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Lock className="w-8 h-8 text-purple-400" />
                  </div>
                  <CardTitle className="text-2xl text-white">Segurança Máxima</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lg text-gray-300">
                    Infraestrutura testada e auditada por instituições financeiras globais
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Why EventCoin Section */}
        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Por que escolher o EventCoin?
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Combinamos tecnologia blockchain, inteligência artificial e automação para revolucionar a economia de eventos
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <Card variant="premium" className="p-6 text-center group hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-7 h-7 text-primary-400" />
                  </div>
                  <CardTitle className="text-xl text-white">Análise Inteligente</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    IA avançada para detectar padrões e otimizar eventos em tempo real
                  </CardDescription>
                </CardContent>
              </Card>

              <Card variant="premium" className="p-6 text-center group hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <div className="w-14 h-14 bg-gradient-to-br from-secondary-500/20 to-secondary-600/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Activity className="w-7 h-7 text-secondary-400" />
                  </div>
                  <CardTitle className="text-xl text-white">Auto-Otimização</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    Rebalanceamento automático baseado em métricas personalizáveis
                  </CardDescription>
                </CardContent>
              </Card>

              <Card variant="premium" className="p-6 text-center group hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <div className="w-14 h-14 bg-gradient-to-br from-accent-500/20 to-accent-600/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-7 h-7 text-accent-400" />
                  </div>
                  <CardTitle className="text-xl text-white">Alertas Proativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    Notificações instantâneas sobre mudanças e oportunidades
                  </CardDescription>
                </CardContent>
              </Card>

              <Card variant="premium" className="p-6 text-center group hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Smartphone className="w-7 h-7 text-green-400" />
                  </div>
                  <CardTitle className="text-xl text-white">Interface Intuitiva</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    Dashboard moderno e responsivo para gestão de eventos
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-dark-900/30 backdrop-blur-xl border-y border-white/10 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Recursos Principais
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Tecnologia de ponta para uma experiência de eventos incomparável
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card variant="premium" className="p-8 group hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-8 h-8 text-yellow-400" />
                  </div>
                  <CardTitle className="text-2xl text-white">Transações Gasless</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lg text-gray-300 mb-4">
                    Usuários não pagam taxas de rede. Experiência fluida e sem fricção.
                  </CardDescription>
                  <div className="flex items-center text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Sem taxas ocultas
                  </div>
                </CardContent>
              </Card>

              <Card variant="premium" className="p-8 group hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <CreditCard className="w-8 h-8 text-blue-400" />
                  </div>
                  <CardTitle className="text-2xl text-white">Tokens Transferíveis</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lg text-gray-300 mb-4">
                    Créditos funcionam entre eventos. Sem perda de dinheiro.
                  </CardDescription>
                  <div className="flex items-center text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Interoperabilidade total
                  </div>
                </CardContent>
              </Card>

              <Card variant="premium" className="p-8 group hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-8 h-8 text-purple-400" />
                  </div>
                  <CardTitle className="text-2xl text-white">Blockchain Seguro</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lg text-gray-300 mb-4">
                    Tecnologia Stellar. Transparência e segurança garantidas.
                  </CardDescription>
                  <div className="flex items-center text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Auditoria pública
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Números que Impressionam
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Resultados comprovados em performance e confiabilidade
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <Card variant="glow" className="p-8 text-center group hover:scale-105 transition-all duration-300">
                <div className="text-5xl font-bold text-gradient mb-4 group-hover:scale-110 transition-transform duration-300">95%</div>
                <div className="text-gray-300 text-lg mb-2">Taxa de Sucesso</div>
                <div className="text-gray-400 text-sm">Em transações</div>
                <TrendingUp className="w-8 h-8 text-primary-400 mx-auto mt-4" />
              </Card>
              
              <Card variant="glow" className="p-8 text-center group hover:scale-105 transition-all duration-300">
                <div className="text-5xl font-bold text-gradient mb-4 group-hover:scale-110 transition-transform duration-300">&lt;5s</div>
                <div className="text-gray-300 text-lg mb-2">Tempo de Transação</div>
                <div className="text-gray-400 text-sm">Confirmação média</div>
                <Clock className="w-8 h-8 text-secondary-400 mx-auto mt-4" />
              </Card>
              
              <Card variant="glow" className="p-8 text-center group hover:scale-105 transition-all duration-300">
                <div className="text-5xl font-bold text-gradient mb-4 group-hover:scale-110 transition-transform duration-300">5%</div>
                <div className="text-gray-300 text-lg mb-2">Taxa Reduzida</div>
                <div className="text-gray-400 text-sm">vs métodos tradicionais</div>
                <Percent className="w-8 h-8 text-accent-400 mx-auto mt-4" />
              </Card>
              
              <Card variant="glow" className="p-8 text-center group hover:scale-105 transition-all duration-300">
                <div className="text-5xl font-bold text-gradient mb-4 group-hover:scale-110 transition-transform duration-300">100%</div>
                <div className="text-gray-300 text-lg mb-2">Transparência</div>
                <div className="text-gray-400 text-sm">Blockchain público</div>
                <Eye className="w-8 h-8 text-primary-400 mx-auto mt-4" />
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-accent-500/10 border-y border-white/10 py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Pronto para revolucionar seus eventos?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Conecte sua carteira Stellar e comece a usar o sistema mais avançado de economia de eventos
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600">
                <Wallet className="w-6 h-6 mr-3" />
                Começar Agora
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white/20 hover:bg-white/10">
                <ExternalLink className="w-6 h-6 mr-3" />
                Documentação
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-dark-900/50 backdrop-blur-xl border-t border-white/10 py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-eventcoin rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <span className="text-xl font-bold text-white">EventCoin</span>
              </div>
              <p className="text-gray-400">
                A nova economia de eventos com blockchain.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Eventos</li>
                <li>Pagamentos</li>
                <li>Analytics</li>
                <li>API</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Recursos</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Documentação</li>
                <li>Tutoriais</li>
                <li>Suporte</li>
                <li>Status</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Sobre</li>
                <li>Blog</li>
                <li>Carreiras</li>
                <li>Contato</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EventCoin. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
