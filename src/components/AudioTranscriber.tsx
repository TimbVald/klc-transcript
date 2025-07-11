'use client'

import React, { useState, useRef } from 'react'

interface TranscriptionResult {
  text: string
  duration: number
}

const AudioTranscriber: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    const MAX_SIZE = 15 * 1024 * 1024 // 5 Mo
    if (file && (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|m4a|flac|ogg)$/i))) {
      if (file.size > MAX_SIZE) {
        alert('Le fichier est trop volumineux (max 5 Mo). Veuillez choisir un fichier plus petit.')
        return
      }
      setSelectedFile(file)
      setTranscriptionResult(null)
    } else {
      alert('Veuillez sélectionner un fichier audio valide (MP3, WAV, etc.)')
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleTranscribe = async () => {
    if (!selectedFile) return

    setIsTranscribing(true)
    setTranscriptionResult(null) // Réinitialiser le résultat précédent
    const startTime = Date.now()

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      console.log('Envoi du fichier:', selectedFile.name, 'Taille:', selectedFile.size)

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la transcription')
      }

      const result = await response.json()
      const duration = Date.now() - startTime

      console.log('Résultat reçu:', result)

      setTranscriptionResult({
        text: result.text || result.transcript || 'Transcription terminée',
        duration
      })
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la transcription. Veuillez réessayer.')
    } finally {
      setIsTranscribing(false)
    }
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-2 sm:py-8 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Transcription Audio
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Téléversez votre fichier audio et obtenez une transcription en temps réel
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Upload Section */}
          <div className="space-y-4 sm:space-y-6">
            {/* File Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all duration-200 shadow-sm ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : selectedFile
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              } ${isTranscribing ? 'opacity-60 pointer-events-none' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileInput}
                className="hidden"
              />
              <div className="space-y-4">
                <div className="mx-auto w-20 h-20 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-base sm:text-lg font-medium text-gray-900">
                    {selectedFile ? selectedFile.name : 'Glissez votre fichier audio ici'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    ou cliquez pour sélectionner un fichier
                  </p>
                </div>
                {selectedFile && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white rounded-lg text-left">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Taille:</span>
                      <span className="font-medium">{formatFileSize(selectedFile.size)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm mt-1">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{selectedFile.type || 'Audio'}</span>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 px-4 py-2 sm:px-6 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
              >
                Sélectionner un fichier
              </button>
              {/* Overlay d'attente sur mobile aussi */}
              {isTranscribing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur rounded-2xl z-10">
                  <div className="animate-spin rounded-full border-4 border-blue-400 border-t-transparent w-12 h-12 mb-4"></div>
                  <span className="text-blue-700 font-semibold animate-pulse text-base sm:text-lg">Transcription en cours…</span>
                </div>
              )}
            </div>
            {/* Transcribe Button */}
            <button
              onClick={handleTranscribe}
              disabled={!selectedFile || isTranscribing}
              className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 shadow-md ${
                !selectedFile || isTranscribing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105'
              }`}
            >
              {isTranscribing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Transcription en cours…</span>
                </div>
              ) : (
                'Transcrire'
              )}
            </button>
          </div>
          {/* Results Section */}
          <div className="space-y-4 sm:space-y-6 relative">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 min-h-[220px] flex flex-col justify-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                Résultat de la transcription
              </h3>
              {/* Overlay d'attente sur la zone de résultat */}
              {isTranscribing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur rounded-2xl z-20">
                  <div className="animate-spin rounded-full border-4 border-blue-400 border-t-transparent w-12 h-12 mb-4"></div>
                  <span className="text-blue-700 font-semibold animate-pulse text-base sm:text-lg">Transcription en cours…</span>
                </div>
              )}
              {transcriptionResult ? (
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                    <span>Durée de traitement :</span>
                    <span className="font-medium">{formatDuration(transcriptionResult.duration)}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <h4 className="font-medium text-gray-900 mb-1 sm:mb-2">Texte transcrit :</h4>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-xs sm:text-base">
                      {transcriptionResult.text}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(transcriptionResult.text)
                      alert('Texte copié dans le presse-papiers!')
                    }}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  >
                    Copier le texte
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-xs sm:text-base">
                    {selectedFile 
                      ? 'Cliquez sur "Transcrire" pour commencer'
                      : 'Sélectionnez un fichier audio pour commencer'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AudioTranscriber 