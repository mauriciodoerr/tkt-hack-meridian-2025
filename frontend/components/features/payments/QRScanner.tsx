'use client'

import { useState, useRef, useEffect } from 'react'
import { Button, Modal, Card, CardContent, CardHeader, CardTitle } from '../../ui'
import { Camera, X, QrCode, CheckCircle, AlertCircle } from 'lucide-react'

interface QRScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan: (data: string) => void
  onError?: (error: string) => void
}

export function QRScanner({ isOpen, onClose, onScan, onError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scannedData, setScannedData] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen])

  const startCamera = async () => {
    try {
      setError(null)
      setIsScanning(true)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use rear camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      // Simulate QR Code detection (in production, use a library like jsQR)
      setTimeout(() => {
        simulateQRDetection()
      }, 2000)

    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Could not access camera. Check permissions.')
      setIsScanning(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const simulateQRDetection = () => {
    // Simulate vendor QR Code data
    const mockQRData = JSON.stringify({
      type: 'vendor_payment',
      vendorId: 'GCZHFQ5Y4TZ5A4RGMPN2YLWVBQDIF6YUBHHBZYLPLOSKHNTVFM4DDO77',
      vendorName: 'Bar do João',
      eventId: 1,
      eventName: 'Festival de Música',
      publicKey: 'GABC123...'
    })
    
    setScannedData(mockQRData)
    setIsScanning(false)
  }

  const handleConfirmPayment = () => {
    if (scannedData) {
      onScan(scannedData)
      onClose()
    }
  }

  const handleRetry = () => {
    setScannedData(null)
    setError(null)
    startCamera()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Scan QR Code
          </h2>
          <p className="text-gray-400">
            Position the vendor's QR Code within the reading area
          </p>
        </div>

        {/* Camera View */}
        <div className="relative">
          <div className="relative w-full h-64 bg-black rounded-2xl overflow-hidden">
            {isScanning ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>
            )}
            
            {/* Overlay with scanning guides */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-48 h-48 border-2 border-primary-400 rounded-lg">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary-400 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary-400 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary-400 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary-400 rounded-br-lg"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mt-4 text-center">
            {isScanning && (
              <div className="flex items-center justify-center space-x-2 text-primary-400">
                <Camera className="w-5 h-5 animate-pulse" />
                <span>Scanning...</span>
              </div>
            )}
            
            {error && (
              <div className="flex items-center justify-center space-x-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Scanned Data Preview */}
        {scannedData && (
          <Card variant="premium">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>QR Code Detected!</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-sm text-gray-400">Vendor:</p>
                  <p className="text-white font-medium">Bar do João</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-sm text-gray-400">Event:</p>
                  <p className="text-white font-medium">Music Festival</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-sm text-gray-400">Vendor ID:</p>
                  <p className="text-white font-mono text-sm">GCZHFQ5Y4TZ5A4RGMPN2YLWVBQDIF6YUBHHBZYLPLOSKHNTVFM4DDO77</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          {error ? (
            <Button onClick={handleRetry} className="flex-1">
              <Camera className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          ) : scannedData ? (
            <>
              <Button variant="outline" onClick={handleRetry} className="flex-1">
                Scan Another
              </Button>
              <Button onClick={handleConfirmPayment} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Continue Payment
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
