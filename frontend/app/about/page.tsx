'use client'

import { useState } from 'react'
import { Navbar } from '../../components/layout/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui'
import { Button } from '../../components/ui/Button'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Globe, 
  Moon, 
  Sun,
  Save,
  Eye,
  EyeOff,
  Key,
  Smartphone,
  Mail,
  Lock,
  Trash2,
  Download,
  Upload,
  AlertTriangle
} from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false
  })
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showBalance: false,
    allowInvites: true
  })
  const [showPassword, setShowPassword] = useState(false)

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'payments', label: 'Pagamentos', icon: CreditCard },
    { id: 'privacy', label: 'Privacidade', icon: Eye },
    { id: 'preferences', label: 'Preferências', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-premium">
      <Navbar />
      <div className="pt-24">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Configurações
            </h1>
            <p className="text-gray-400">
              Gerencie suas preferências e configurações da conta
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card variant="premium" className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </Card>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <Card variant="premium" className="p-8">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white flex items-center">
                      <User className="w-6 h-6 mr-3" />
                      Informações do Perfil
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-6">
                      <div className="w-20 h-20 bg-gradient-eventcoin rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">D</span>
                      </div>
                      <div>
                        <Button variant="outline" size="sm" className="mr-3">
                          <Upload className="w-4 h-4 mr-2" />
                          Alterar Foto
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover
                        </Button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Nome Completo
                        </label>
                        <input
                          type="text"
                          defaultValue="Daniel Roger Gorgonha"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          defaultValue="daniel@eventcoin.com"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Telefone
                        </label>
                        <input
                          type="tel"
                          defaultValue="+55 11 99999-9999"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Data de Nascimento
                        </label>
                        <input
                          type="date"
                          defaultValue="1990-01-01"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Conte um pouco sobre você..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none resize-none"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button className="bg-primary-500 hover:bg-primary-600">
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Alterações
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <Card variant="premium" className="p-8">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white flex items-center">
                      <Bell className="w-6 h-6 mr-3" />
                      Notificações
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-primary-400" />
                          <div>
                            <h4 className="text-white font-medium">Notificações por Email</h4>
                            <p className="text-gray-400 text-sm">Receba atualizações importantes por email</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.email}
                            onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Smartphone className="w-5 h-5 text-secondary-400" />
                          <div>
                            <h4 className="text-white font-medium">Notificações Push</h4>
                            <p className="text-gray-400 text-sm">Receba notificações no seu dispositivo</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.push}
                            onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Bell className="w-5 h-5 text-accent-400" />
                          <div>
                            <h4 className="text-white font-medium">SMS</h4>
                            <p className="text-gray-400 text-sm">Receba alertas importantes por SMS</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.sms}
                            onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Globe className="w-5 h-5 text-green-400" />
                          <div>
                            <h4 className="text-white font-medium">Marketing</h4>
                            <p className="text-gray-400 text-sm">Receba ofertas e novidades do EventCoin</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.marketing}
                            onChange={(e) => setNotifications({...notifications, marketing: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <Card variant="premium" className="p-8">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white flex items-center">
                      <Shield className="w-6 h-6 mr-3" />
                      Segurança
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Senha Atual
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-12 text-white focus:border-primary-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Nova Senha
                        </label>
                        <input
                          type="password"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Confirmar Nova Senha
                        </label>
                        <input
                          type="password"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                      <h4 className="text-white font-medium mb-4">Autenticação de Dois Fatores</h4>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <h5 className="text-white font-medium">2FA Ativado</h5>
                          <p className="text-gray-400 text-sm">Proteção adicional para sua conta</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Key className="w-4 h-4 mr-2" />
                          Configurar
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button className="bg-primary-500 hover:bg-primary-600">
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Alterações
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <Card variant="premium" className="p-8">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white flex items-center">
                      <Eye className="w-6 h-6 mr-3" />
                      Privacidade
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <h4 className="text-white font-medium">Perfil Público</h4>
                          <p className="text-gray-400 text-sm">Permitir que outros usuários vejam seu perfil</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacy.profilePublic}
                            onChange={(e) => setPrivacy({...privacy, profilePublic: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <h4 className="text-white font-medium">Mostrar Saldo</h4>
                          <p className="text-gray-400 text-sm">Exibir seu saldo TKT publicamente</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacy.showBalance}
                            onChange={(e) => setPrivacy({...privacy, showBalance: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <h4 className="text-white font-medium">Permitir Convites</h4>
                          <p className="text-gray-400 text-sm">Permitir que outros usuários te convidem para eventos</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacy.allowInvites}
                            onChange={(e) => setPrivacy({...privacy, allowInvites: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                        </label>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                      <h4 className="text-white font-medium mb-4">Exportar Dados</h4>
                      <p className="text-gray-400 text-sm mb-4">
                        Baixe uma cópia dos seus dados pessoais
                      </p>
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Baixar Dados
                      </Button>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                      <h4 className="text-red-400 font-medium mb-4">Zona de Perigo</h4>
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-white font-medium">Excluir Conta</h5>
                            <p className="text-gray-400 text-sm">Esta ação não pode ser desfeita</p>
                          </div>
                          <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Other tabs placeholder */}
              {(activeTab === 'payments' || activeTab === 'preferences') && (
                <Card variant="premium" className="p-8">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white flex items-center">
                      <Settings className="w-6 h-6 mr-3" />
                      {activeTab === 'payments' ? 'Pagamentos' : 'Preferências'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-white mb-2">
                        Em Desenvolvimento
                      </h3>
                      <p className="text-gray-400">
                        Esta seção estará disponível em breve.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
