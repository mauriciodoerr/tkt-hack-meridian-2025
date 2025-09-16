'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getStoredCredentialId, ensurePasskeyWithPrf, deriveKeyFromPasskey, generateStellarKeypair } from '../lib/passkeySoroban'

interface User {
  id: string
  publicKey: string
  credentialId: string
  isAuthenticated: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: () => Promise<void>
  logout: () => void
  checkAuthStatus: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true)
      const credentialId = getStoredCredentialId()
      
      if (credentialId) {
        // Deriva a chave pública do passkey
        const keyMaterial = await deriveKeyFromPasskey(credentialId)
        const keypair = generateStellarKeypair(keyMaterial)
        
        const userData = {
          id: credentialId,
          publicKey: keypair.publicKey(),
          credentialId,
          isAuthenticated: true
        }
        
        setUser(userData)
        
        // Console.log da conta existente
        console.log('🔐 === CONTA DO PASSKEY (EXISTENTE) ===')
        console.log('📱 Credential ID:', credentialId)
        console.log('🔑 Chave Pública Stellar:', keypair.publicKey())
        console.log('🔒 Chave Privada (derivada):', keypair.secret())
        console.log('🌐 Network:', 'Stellar Testnet')
        console.log('💾 Dados do Usuário:', userData)
        console.log('✅ Usuário já autenticado via passkey')
        console.log('🔐 === FIM DA CONTA ===')
        
      } else {
        setUser(null)
        console.log('👤 Usuário não autenticado')
      }
    } catch (error) {
      console.error('Erro ao verificar status de autenticação:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async () => {
    try {
      setIsLoading(true)
      
      // Registra ou obtém o passkey
      const credentialId = await ensurePasskeyWithPrf()
      
      // Deriva a chave pública
      const keyMaterial = await deriveKeyFromPasskey(credentialId)
      const keypair = generateStellarKeypair(keyMaterial)
      
      const userData = {
        id: credentialId,
        publicKey: keypair.publicKey(),
        credentialId,
        isAuthenticated: true
      }
      
      setUser(userData)
      
      // Console.log detalhado da conta do passkey
      console.log('🔐 === CONTA DO PASSKEY ===')
      console.log('📱 Credential ID:', credentialId)
      console.log('🔑 Chave Pública Stellar:', keypair.publicKey())
      console.log('🔒 Chave Privada (derivada):', keypair.secret())
      console.log('🌐 Network:', 'Stellar Testnet')
      console.log('💾 Dados do Usuário:', userData)
      console.log('✅ Login realizado com sucesso via passkey')
      console.log('🔐 === FIM DA CONTA ===')
      
    } catch (error) {
      console.error('❌ Erro no login:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Console.log antes do logout
    if (user) {
      console.log('🚪 === LOGOUT DA CONTA ===')
      console.log('📱 Credential ID removido:', user.credentialId)
      console.log('🔑 Chave Pública removida:', user.publicKey)
      console.log('💾 Dados limpos do localStorage')
      console.log('🚪 Logout realizado com sucesso')
      console.log('🚪 === FIM DO LOGOUT ===')
    }
    
    // Remove dados do localStorage
    localStorage.removeItem('webauthnCredId')
    localStorage.removeItem('passkeyWalletPub')
    
    setUser(null)
  }

  // Verifica status de autenticação na inicialização
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
