/* eslint-disable react/no-unescaped-entities */
'use client'

import React, { useState, useRef, useEffect } from 'react'

const FAQ = [
  {
    question: "Comment utiliser la transcription ?",
    answer: "Téléversez un fichier audio (max 5 Mo), puis cliquez sur 'Transcrire'. Le texte s'affichera après traitement."
  },
  {
    question: "Quels formats audio sont acceptés ?",
    answer: "MP3, WAV, M4A, FLAC, OGG."
  },
  {
    question: "Combien de temps dure la transcription ?",
    answer: "Cela dépend de la taille du fichier, généralement quelques secondes à 2 minutes."
  },
  {
    question: "Mes données sont-elles stockées ?",
    answer: "Non, les fichiers sont traités uniquement pour la transcription et ne sont pas conservés."
  },
  {
    question: "Puis-je transcrire plusieurs fichiers ?",
    answer: "Oui, vous pouvez enchaîner plusieurs transcriptions, une à la fois."
  },
  {
    question: "Comment nous contacter ?",
    answer: "Désolé, car nous ne sommes pas encore une entreprise, mais vous pouvez me contacter via l'adresse email klcomputing2023@gmail.com"
  },
  {
    question: "L’application est-elle gratuite ?",
    answer: "Oui, l'application est entièrement gratuite pour tous les utilisateurs."
  },
  {
    question: "Puis-je utiliser l’application sur mobile ?",
    answer: "Oui, l'application est accessible depuis un navigateur mobile récent."
  },
  {
    question: "Y a-t-il une limite de taille de fichier ?",
    answer: "Oui, la taille maximale d'un fichier audio est de 5 Mo."
  },
  {
    question: "La transcription est-elle précise ?",
    answer: "La précision dépend de la qualité audio, mais notre système offre généralement d'excellents résultats."
  }
]

function getAnswer(question: string) {
  const found = FAQ.find(faq => question.toLowerCase().includes(faq.question.toLowerCase().slice(0, 10)))
  if (found) return found.answer
  // Si la question n'est pas dans la liste, ne rien répondre
  return null
}

const SUGGESTED_QUESTIONS = [
  "Comment utiliser la transcription ?",
  "Quels formats audio sont acceptés ?",
  "Combien de temps dure la transcription ?",
  "Mes données sont-elles stockées ?",
  "Puis-je transcrire plusieurs fichiers ?",
  "Comment nous contacter ?",
  "L’application est-elle gratuite ?",
  "Puis-je utiliser l’application sur mobile ?",
  "Y a-t-il une limite de taille de fichier ?",
  "La transcription est-elle précise ?"
]

const FloatingAssistant: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { from: "bot", text: "Bonjour ! Je suis Mem's AI 🤖 votre assistante intelligente. Choisissez une question ci-dessous pour obtenir de l'aide." }
  ])
  const chatRef = useRef<HTMLDivElement>(null)
  const [sending, setSending] = useState(false)
  const [typingText, setTypingText] = useState("")

  useEffect(() => {
    if (open && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, open, typingText])

  const handleSend = (question: string) => {
    if (!question.trim()) return
    const userMsg = { from: "user", text: question }
    setMessages(msgs => [...msgs, userMsg])
    setSending(true)
    setTypingText("")
    setTimeout(() => {
      const answer = getAnswer(question)
      if (answer) {
        let i = 0
        setTypingText("")
        const typeNext = () => {
          i++
          setTypingText(answer.slice(0, i))
          if (i < answer.length) {
            setTimeout(typeNext, 18 + Math.random() * 30)
          } else {
            setMessages(msgs => [...msgs, { from: "bot", text: answer }])
            setTypingText("")
            setSending(false)
          }
        }
        typeNext()
      } else {
        setSending(false)
      }
    }, 400)
  }

  return (
    <>
      {/* Bouton flottant amélioré */}
      <button
        className="fixed z-40 bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl w-16 h-16 flex items-center justify-center text-4xl transition-all focus:outline-none focus:ring-4 focus:ring-blue-300/40 animate-float"
        onClick={() => setOpen(o => !o)}
        aria-label="Ouvrir l'assistant IA"
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
      >
        <span className="sr-only">Ouvrir l'assistant IA</span>
        <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
          <circle cx="12" cy="10" r="6" stroke="currentColor" strokeWidth={2} />
        </svg>
      </button>
      {/* Fenêtre de chat améliorée */}
      {open && (
        <div className="fixed z-50 bottom-24 right-4 w-[95vw] max-w-xs sm:max-w-sm bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl border border-blue-100 flex flex-col overflow-hidden animate-fade-in transition-all duration-300" style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}>
          <div className="bg-blue-600/90 text-white px-4 py-3 flex items-center justify-between">
            <span className="font-semibold">Mem's AI 🤖</span>
            <button onClick={() => setOpen(false)} className="text-white hover:text-blue-200 text-xl font-bold">×</button>
          </div>
          <div ref={chatRef} className="flex-1 px-3 py-2 overflow-y-auto max-h-60 sm:max-h-72 text-sm space-y-2 bg-blue-50/60 transition-all">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-message items-end`}>
                {msg.from === 'bot' && (
                  <span className="mr-2 text-xl select-none">🤖</span>
                )}
                <div className={`rounded-2xl px-4 py-2 max-w-[80%] shadow-md flex items-center gap-2 ${msg.from === 'user' ? 'bg-blue-600 text-white flex-row-reverse' : 'bg-white/90 text-gray-800 border border-blue-100'}`}>{msg.text}</div>
                {msg.from === 'user' && (
                  <span className="ml-2 text-xl select-none">👤</span>
                )}
              </div>
            ))}
            {sending && (
              <div className="flex justify-start animate-fade-in-message items-end">
                <span className="mr-2 text-xl select-none">🤖</span>
                <div className="rounded-2xl px-4 py-2 max-w-[80%] bg-white/90 text-gray-400 border border-blue-100 italic">
                  {typingText ? <span>{typingText}<span className="animate-pulse">|</span></span> : "L'assistant rédige une réponse…"}
                </div>
              </div>
            )}
          </div>
          <div className="w-full overflow-x-auto bg-blue-50/60 border-t border-blue-100 py-3 px-2">
            <div className="flex flex-nowrap gap-2 min-w-max">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  className="bg-white/80 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-3 py-1 text-xs font-medium transition-colors shadow-sm whitespace-nowrap flex items-center gap-1"
                  onClick={() => handleSend(q)}
                  disabled={sending}
                >
                  <span className="text-blue-400 text-base">❓</span>
                  {q}
                </button>
              ))}
            </div>
          </div>
          {/* Animations CSS */}
          <style jsx global>{`
            @keyframes fade-in {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
              animation: fade-in 0.4s cubic-bezier(.4,0,.2,1);
            }
            @keyframes fade-in-message {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-message {
              animation: fade-in-message 0.3s cubic-bezier(.4,0,.2,1);
            }
            @keyframes float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-6px); }
            }
            .animate-float {
              animation: float 2.5s ease-in-out infinite;
            }
            .animate-pulse {
              animation: pulse 1s infinite steps(1);
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.2; }
            }
          `}</style>
        </div>
      )}
    </>
  )
}

export default FloatingAssistant 