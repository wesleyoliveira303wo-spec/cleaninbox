'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Mail, Trash2, Zap, Settings, LogOut, Brain } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

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
  const sessionData = useSession?.()
  const session = sessionData?.data
  const status = sessionData?.status

  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated' && typeof window !== 'undefined') {
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

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Redirecionando para login...</p>
      </div>
    )
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const mockEmails = [
        {
          id: '1',
          from: 'banco@itau.com.br',
          subject: 'Fatura disponível',
          snippet: 'Sua fatura já está disponível...',
          date: new Date().toISOString(),
        },
        {
          id: '2',
          from: 'ofertas@magazineluiza.com.br',
          subject: 'Promoção 50% OFF',
          snippet: 'Mega promoção de eletrônicos!',
          date: new Date().toISOString(),
        },
      ]

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: mockEmails }),
      })

      const data = await res.json()
      if (data.success) setResult(data.data)
    } catch (err) {
      console.error('Erro ao analisar:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen
