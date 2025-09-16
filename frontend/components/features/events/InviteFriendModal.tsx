'use client'

import { useState } from 'react'
import { Button } from '../../ui'
import { 
  X, 
  UserPlus, 
  Copy, 
  Mail,
  Share2,
  CheckCircle
} from 'lucide-react'

interface InviteFriendModalProps {
  isOpen: boolean
  onClose: () => void
  event: {
    id: string
    title: string
    description: string
  }
}

export function InviteFriendModal({ isOpen, onClose, event }: InviteFriendModalProps) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [copied, setCopied] = useState(false)

  const eventLink = `https://eventcoin.com/events/${event.id}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const handleShareEvent = async (platform: string) => {
    const shareText = `Confira este evento incrível: ${event.title}\n\n${event.description}\n\n${eventLink}`
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventLink)}`, '_blank')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventLink)}`, '_blank')
        break
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(eventLink)}&text=${encodeURIComponent(shareText)}`, '_blank')
        break
      default:
        if (navigator.share) {
          navigator.share({
            title: event.title,
            text: event.description,
            url: eventLink
          })
        }
    }
  }

  const handleSendEmail = async () => {
    if (!email) return
    
    setIsSending(true)
    try {
      // Simular envio de e-mail
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Aqui seria feita a integração com o backend
      console.log('Enviando convite por e-mail:', { email, message, eventId: event.id })
      
      setEmail('')
      setMessage('')
      alert('Convite enviado com sucesso!')
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Erro ao enviar convite. Tente novamente.')
    } finally {
      setIsSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-5 w-full max-w-md border border-gray-700 shadow-2xl max-h-[85vh] overflow-y-auto scrollbar-modal mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Convide um Amigo</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-300 text-base mb-1">
            É sempre mais divertido com amigos! 🎉
          </p>
          <p className="text-gray-400 text-sm">
            Avisaremos quando seus amigos aceitarem seu convite e você ganhará pontos de fidelidade.
          </p>
        </div>

        {/* Social Media Sharing */}
        <div className="mb-4">
          <h3 className="text-white font-semibold mb-2 text-sm">Compartilhar nas redes sociais</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: 'WhatsApp', icon: '💬', color: 'bg-green-500/20 text-green-400', platform: 'whatsapp' },
              { name: 'Facebook', icon: '📘', color: 'bg-blue-500/20 text-blue-400', platform: 'facebook' },
              { name: 'X (Twitter)', icon: '🐦', color: 'bg-gray-500/20 text-gray-400', platform: 'twitter' },
              { name: 'LinkedIn', icon: '💼', color: 'bg-blue-600/20 text-blue-500', platform: 'linkedin' },
              { name: 'Instagram', icon: '📷', color: 'bg-pink-500/20 text-pink-400', platform: 'instagram' },
              { name: 'Telegram', icon: '✈️', color: 'bg-blue-400/20 text-blue-300', platform: 'telegram' }
            ].map((social) => (
              <button
                key={social.name}
                className={`flex flex-col items-center space-y-1 p-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:scale-105 ${social.color}`}
                onClick={() => handleShareEvent(social.platform)}
              >
                <div className="text-lg">{social.icon}</div>
                <span className="text-xs font-medium text-center leading-tight">
                  {social.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Direct Link Sharing */}
        <div className="mb-4">
          <h3 className="text-white font-semibold mb-2 text-sm">Compartilhar link direto</h3>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={eventLink}
              readOnly
              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
            />
            <Button 
              size="sm" 
              onClick={handleCopyLink}
              className={`px-3 py-2 text-xs ${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Email Invitation */}
        <div className="mb-4">
          <h3 className="text-white font-semibold mb-2 text-sm">Convidar por e-mail</h3>
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Digite o e-mail do seu amigo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
            />
            <textarea
              placeholder="Mensagem personalizada (opcional)"
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none text-sm"
            />
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2"
              onClick={handleSendEmail}
              disabled={!email || isSending}
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-3 h-3 mr-2" />
                  Enviar Convite
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <h4 className="text-blue-400 font-semibold mb-2 text-sm">🎁 Benefícios de convidar amigos</h4>
          <ul className="text-xs text-blue-300 space-y-1">
            <li>• Ganhe 10 TKT por cada amigo que se inscrever</li>
            <li>• Desconto de 5% em sua próxima compra</li>
            <li>• Acesso antecipado a novos eventos</li>
            <li>• Badges especiais de convidador</li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="flex-1 text-sm py-2"
              onClick={() => {
                setEmail('')
                setMessage('')
              }}
            >
              Limpar
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
              onClick={onClose}
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
