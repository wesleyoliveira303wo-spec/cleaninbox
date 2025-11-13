'use client'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Mail, Trash2, Zap, Settings, LogOut, Brain, Filter, TrendingUp, CheckCircle, AlertCircle, ShoppingBag } from 'lucide-react'

interface EmailClassification {
  index: number
  category: 'Importante' | 'Promoção' | 'Lixo'
  reason: string
}

interface AnalysisResult {
  classifications: EmailClassification[]
  summary: {
    important: number
    promotion: number
    junk: number
  }
}

export default function Dashboard() {
  const sessionData = useSession()
  const session = sessionData?.data
  const status = sessionData?.status
  const router = useRouter()

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Carregando sessão...</p>
      </div>
    )
  }

  if (status === 'unauthenticated' || !session) {
    if (typeof window !== 'undefined') {
      window.location.href = '/api/auth/signin'
    }
    return null
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setShowResults(false)
    try {
      const mockEmails = [
        { id: '1', from: 'banco@itau.com.br', subject: 'Fatura disponível', snippet: 'Sua fatura já está disponível...', date: new Date().toISOString() },
        { id: '2', from: 'ofertas@magazineluiza.com.br', subject: '50% OFF', snippet: 'Mega promoção...', date: new Date().toISOString() }
      ]

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: mockEmails }),
      })

      const data = await response.json()
      if (data.success) {
        setAnalysisResult(data.data)
        setShowResults(true)
      }
    } catch (err) {
      console.error('Erro ao analisar e-mails:', err)
      alert('Erro ao analisar e-mails.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">CleanInbox AI</h1>
        <button onClick={() => signOut()} className="bg-red-500 hover:bg-red-400 px-4 py-2 rounded-md">Sair</button>
      </header>

      <main>
        <h2 className="text-xl mb-4">Bem-vindo, {session.user?.name?.split(' ')[0]} 👋</h2>
        <p className="text-gray-300 mb-8">Sua IA está pronta para classificar e-mails.</p>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 rounded-md font-semibold disabled:opacity-50"
        >
          {isAnalyzing ? 'Analisando com GPT-4...' : 'Analisar E-mails'}
        </button>

        {showResults && analysisResult && (
          <div className="mt-8 p-4 border border-purple-700 rounded-md">
            <h3 className="text-lg font-semibold mb-3">Resumo:</h3>
            <p>Importantes: {analysisResult.summary.important}</p>
            <p>Promoções: {analysisResult.summary.promotion}</p>
            <p>Lixo: {analysisResult.summary.junk}</p>
          </div>
        )}
      </main>
    </div>
  )
}
