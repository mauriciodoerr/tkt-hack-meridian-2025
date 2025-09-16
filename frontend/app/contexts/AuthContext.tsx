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
        // Derive public key from passkey
        const keyMaterial = await deriveKeyFromPasskey(credentialId)
        const keypair = generateStellarKeypair(keyMaterial)
        
        const userData = {
          id: credentialId,
          publicKey: keypair.publicKey(),
          credentialId,
          isAuthenticated: true
        }
        
        setUser(userData)
        
        // Console.log of existing account
        console.log('🔐 === PASSKEY ACCOUNT (EXISTING) ===')
        console.log('📱 Credential ID:', credentialId)
        console.log('🔑 Stellar Public Key:', keypair.publicKey())
        console.log('🔒 Private Key (derived):', keypair.secret())
        console.log('🌐 Network:', 'Stellar Testnet')
        console.log('💾 User Data:', userData)
        console.log('✅ User already authenticated via passkey')
        console.log('🔐 === END OF ACCOUNT ===')
        
      } else {
        setUser(null)
        console.log('👤 User not authenticated')
      }
    } catch (error) {
      console.error('Error checking authentication status:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async () => {
    try {
      setIsLoading(true)
      
      // Register or get passkey
      const credentialId = await ensurePasskeyWithPrf()
      
      // Derive public key
      const keyMaterial = await deriveKeyFromPasskey(credentialId)
      const keypair = generateStellarKeypair(keyMaterial)
      
      const userData = {
        id: credentialId,
        publicKey: keypair.publicKey(),
        credentialId,
        isAuthenticated: true
      }
      
      setUser(userData)
      
      // Detailed console.log of passkey account
      console.log('🔐 === PASSKEY ACCOUNT ===')
      console.log('📱 Credential ID:', credentialId)
      console.log('🔑 Stellar Public Key:', keypair.publicKey())
      console.log('🔒 Private Key (derived):', keypair.secret())
      console.log('🌐 Network:', 'Stellar Testnet')
      console.log('💾 User Data:', userData)
      console.log('✅ Login successful via passkey')
      console.log('🔐 === END OF ACCOUNT ===')
      
    } catch (error) {
      console.error('❌ Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Console.log before logout
    if (user) {
      console.log('🚪 === ACCOUNT LOGOUT ===')
      console.log('📱 Credential ID removed:', user.credentialId)
      console.log('🔑 Public Key removed:', user.publicKey)
      console.log('💾 Data cleared from localStorage')
      console.log('🚪 Logout successful')
      console.log('🚪 === END OF LOGOUT ===')
    }
    
    // Remove data from localStorage
    localStorage.removeItem('webauthnCredId')
    localStorage.removeItem('passkeyWalletPub')
    
    setUser(null)
  }

  // Check authentication status on initialization
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
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
