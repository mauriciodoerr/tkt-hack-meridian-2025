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
    
    // Simulate registration
    setTimeout(() => {
      setIsLoading(false)
      // Redirect to dashboard
    }, 2000)
  }

  const handlePasskeyRegister = async () => {
    try {
      setIsPasskeyLoading(true)
      setPasskeyError(null)
      setPasskeySuccess(null)

      // 1) Check if passkey is already registered
      const existingCredentialId = getStoredCredentialId()
      
      if (existingCredentialId) {
        setPasskeySuccess('You already have a registered passkey! Use the "Login" button to sign in.')
        return
      }

      // 2) Register a new passkey
      const credentialId = await ensurePasskeyWithPrf()
      setPasskeySuccess('Passkey registered successfully!')

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
        throw new Error("Initial configuration failed: " + JSON.stringify(res.diag))
      }

      if (res.status === "ERROR" || res.status === "TRY_AGAIN_LATER") {
        throw new Error("Transaction error: " + res.status)
      }

      // 5) Success - account created
      setPasskeySuccess(`Account created successfully! Wallet: ${res.publicKey?.slice(0, 8)}...`)
      
      // Simulate redirect to dashboard
      setTimeout(() => {
        // window.location.href = '/dashboard'
        console.log('Redirecting to dashboard...')
      }, 2000)

    } catch (error: any) {
      console.error('Passkey registration error:', error)
      setPasskeyError(error?.message || 'Unknown passkey registration error')
    } finally {
      setIsPasskeyLoading(false)
    }
  }

  return (
    <Card variant="premium" className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">Create EventCoin Account</CardTitle>
        <p className="text-gray-400">Fill in the data or use passkey</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Full name"
            type="text"
            placeholder="Your full name"
            icon={<User className="w-5 h-5" />}
            required
          />
          
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
          
          <Input
            label="Confirm password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
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
              I accept the{' '}
              <button className="text-primary-400 hover:text-primary-300">
                terms of use
              </button>{' '}
              and{' '}
              <button className="text-primary-400 hover:text-primary-300">
                privacy policy
              </button>
            </span>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
          >
            Create Account
          </Button>
        </form>
        
        {/* Passkey Registration Section */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-dark-800 text-gray-400">Or create with</span>
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
              {isPasskeyLoading ? 'Creating account...' : 'Create with Passkey'}
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
          Already have an account?{' '}
          <button 
            className="text-primary-400 hover:text-primary-300 font-medium"
            onClick={() => window.location.href = '/login'}
          >
            Sign in
          </button>
        </p>
      </CardContent>
    </Card>
  )
}
