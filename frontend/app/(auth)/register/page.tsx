'use client'

import { RegisterForm } from '../../../components/features/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-premium flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-eventcoin rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">E</span>
            </div>
            <span className="text-3xl font-bold text-white">EventCoin</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Crie sua conta!
          </h1>
          <p className="text-gray-400">
            Junte-se à nova economia de eventos
          </p>
        </div>
        
        <RegisterForm />
      </div>
    </div>
  )
}
