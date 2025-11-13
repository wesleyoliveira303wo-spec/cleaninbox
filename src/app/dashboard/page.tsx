'use client'

import dynamic from 'next/dynamic'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Mail, Trash2, Zap, Settings, LogOut, Brain } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

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

function DashboardContent() {
  const { data: session, status } = useSession()
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
      <d
