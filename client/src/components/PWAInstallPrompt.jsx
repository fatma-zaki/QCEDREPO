import React, { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Hide for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Don't show if already dismissed this session
  if (sessionStorage.getItem('pwa-install-dismissed') === 'true') {
    return null
  }

  if (!showInstallPrompt) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Install QCED App
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Install this app on your device for quick access and offline functionality.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleInstallClick}
                className="bg-qassim-blue text-white text-xs px-3 py-1 rounded-md hover:bg-qassim-blue-dark transition-colors flex items-center"
              >
                <Download className="w-3 h-3 mr-1" />
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="text-gray-500 text-xs px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default PWAInstallPrompt
