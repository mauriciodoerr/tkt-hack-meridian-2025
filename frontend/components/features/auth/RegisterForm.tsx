'use client'

import { useState } from 'react'
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '../../ui'
import { Mail, Lock, Eye, EyeOff, User, Fingerprint } from 'lucide-react'
import {
  ensurePasskeyWithPrf,
  invokeWithPasskeyWallet,
  getStoredCredentialId,
} from '../../../app/lib/passkeySoroban'
import { getContractAddress } from '../../../app/utils/api-config'

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false)
  const [passkeyError, setPasskeyError] = useState<string | null>(null)
  const [passkeySuccess, setPasskeySuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simular registro
    setTimeout(() => {
      setIsLoading(false)
      // Redirecionar para dashboard
    }, 2000)
  }

  const handlePasskeyRegister = async () => {
    try {
      setIsPasskeyLoading(true)
      setPasskeyError(null)
      setPasskeySuccess(null)

      // 1) Verifica se já existe uma passkey registrada
      const existingCredentialId = getStoredCredentialId()
      
      if (existingCredentialId) {
        setPasskeySuccess('Você já possui uma passkey registrada! Use o botão "Entrar" para fazer login.')
        return
      }

      // 2) Registra uma nova passkey
      const credentialId = await ensurePasskeyWithPrf()
      setPasskeySuccess('Passkey registrada com sucesso!')

      // 3) Testa a autenticação chamando o contrato
      const contractId = getContractAddress()
      const res = await invokeWithPasskeyWallet({
        credentialIdBase64Url: credentialId,
        contractId: contractId,
        method: "get_config", // Método simples para testar autenticação
        args: [],
      })

      // 4) Verifica o resultado
      if (res.status === "SIMULATION_FAILED") {
        throw new Error("Falha na configuração inicial: " + JSON.stringify(res.diag))
      }

      if (res.status === "ERROR" || res.status === "TRY_AGAIN_LATER") {
        throw new Error("Erro na transação: " + res.status)
      }

      // 5) Sucesso - conta criada
      setPasskeySuccess(`Conta criada com sucesso! Wallet: ${res.publicKey?.slice(0, 8)}...`)
      
      // Simular redirecionamento para dashboard
      setTimeout(() => {
        // window.location.href = '/dashboard'
        console.log('Redirecionando para dashboard...')
      }, 2000)

    } catch (error: any) {
      console.error('Erro no registro com passkey:', error)
      setPasskeyError(error?.message || 'Erro desconhecido no registro com passkey')
    } finally {
      setIsPasskeyLoading(false)
    }
  }

  return (
    <Card variant="premium" className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">Criar Conta EventCoin</CardTitle>
        <p className="text-gray-400">Preencha os dados ou use passkey</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nome completo"
            type="text"
            placeholder="Seu nome completo"
            icon={<User className="w-5 h-5" />}
            required
          />
          
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            icon={<Mail className="w-5 h-5" />}
            required
          />
          
          <Input
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            placeholder="Sua senha"
            icon={<Lock className="w-5 h-5" />}
            required
          />
          
          <Input
            label="Confirmar senha"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirme sua senha"
            icon={<Lock className="w-5 h-5" />}
            required
          />
          
          <div className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-600 bg-dark-700 text-primary-600 focus:ring-primary-500"
              required
            />
            <span className="ml-2 text-sm text-gray-300">
              Aceito os{' '}
              <button className="text-primary-400 hover:text-primary-300">
                termos de uso
              </button>{' '}
              e{' '}
              <button className="text-primary-400 hover:text-primary-300">
                política de privacidade
              </button>
            </span>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
          >
            Criar Conta
          </Button>
        </form>
        
        {/* Passkey Registration Section */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-dark-800 text-gray-400">Ou crie com</span>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            {/* Passkey Registration Button */}
            <Button 
              onClick={handlePasskeyRegister}
              loading={isPasskeyLoading}
              disabled={isPasskeyLoading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white"
            >
              <Fingerprint className="w-5 h-5 mr-2" />
              {isPasskeyLoading ? 'Criando conta...' : 'Criar com Passkey'}
            </Button>

            {/* Passkey Status Messages */}
            {passkeyError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{passkeyError}</p>
              </div>
            )}
            
            {passkeySuccess && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-sm">{passkeySuccess}</p>
              </div>
            )}
          </div>
        </div>
        
        <p className="mt-6 text-center text-sm text-gray-400">
          Já tem uma conta?{' '}
          <button 
            className="text-primary-400 hover:text-primary-300 font-medium"
            onClick={() => window.location.href = '/login'}
          >
            Fazer login
          </button>
        </p>
      </CardContent>
    </Card>
  )
}
