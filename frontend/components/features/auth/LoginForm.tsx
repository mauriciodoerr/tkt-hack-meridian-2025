'use client'

import { useState } from 'react'
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '../../ui'
import { Mail, Lock, Eye, EyeOff, Fingerprint, Wallet } from 'lucide-react'
import {
  ensurePasskeyWithPrf,
  invokeWithPasskeyWallet,
  getStoredCredentialId,
} from '../../../app/lib/passkeySoroban'
import { getContractAddress } from '../../../app/utils/api-config'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false)
  const [passkeyError, setPasskeyError] = useState<string | null>(null)
  const [passkeySuccess, setPasskeySuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate login
    setTimeout(() => {
      setIsLoading(false)
      // Redirect to dashboard
    }, 2000)
  }

  const handlePasskeyLogin = async () => {
    try {
      setIsPasskeyLoading(true)
      setPasskeyError(null)
      setPasskeySuccess(null)

      // 1) Check if passkey is already registered
      const existingCredentialId = getStoredCredentialId()
      let credentialId = existingCredentialId

      // 2) If not exists, register a new passkey
      if (!credentialId) {
        credentialId = await ensurePasskeyWithPrf()
        setPasskeySuccess('Passkey registered successfully!')
      }

      // 3) Test authentication by calling contract
      const contractId = getContractAddress()
      const res = await invokeWithPasskeyWallet({
        credentialIdBase64Url: credentialId,
        contractId: contractId,
        method: "get_config", // Simple method to test authentication
        args: [],
      })

      // 4) Check result
      if (res.status === "SIMULATION_FAILED") {
        throw new Error("Authentication failed: " + JSON.stringify(res.diag))
      }

      if (res.status === "ERROR" || res.status === "TRY_AGAIN_LATER") {
        throw new Error("Transaction error: " + res.status)
      }

      // 5) Success - user authenticated
      setPasskeySuccess(`Login successful! Wallet: ${res.publicKey?.slice(0, 8)}...`)
      
      // Simulate redirect to dashboard
      setTimeout(() => {
        // window.location.href = '/dashboard'
        console.log('Redirecting to dashboard...')
      }, 2000)

    } catch (error: any) {
      console.error('Passkey login error:', error)
      setPasskeyError(error?.message || 'Unknown passkey login error')
    } finally {
      setIsPasskeyLoading(false)
    }
  }

  return (
    <Card variant="premium" className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">Login to EventCoin</CardTitle>
        <p className="text-gray-400">Access your account to continue</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            icon={<Mail className="w-5 h-5" />}
            required
          />
          
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Your password"
            icon={<Lock className="w-5 h-5" />}
            required
          />
          
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-600 bg-dark-700 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-300">Remember me</span>
            </label>
            <button
              type="button"
              className="text-sm text-primary-400 hover:text-primary-300"
            >
              Forgot password?
            </button>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
          >
            Login
          </Button>
        </form>
        
        {/* Passkey Login Section */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-dark-800 text-gray-400">Or login with</span>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            {/* Passkey Login Button */}
            <Button 
              onClick={handlePasskeyLogin}
              loading={isPasskeyLoading}
              disabled={isPasskeyLoading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white"
            >
              <Fingerprint className="w-5 h-5 mr-2" />
              {isPasskeyLoading ? 'Authenticating...' : 'Login with Passkey'}
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

            {/* Traditional Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button variant="outline" className="w-full">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
            </div>
          </div>
        </div>
        
        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <button className="text-primary-400 hover:text-primary-300 font-medium">
            Create account
          </button>
        </p>
      </CardContent>
    </Card>
  )
}
