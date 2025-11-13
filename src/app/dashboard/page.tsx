'use client'
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0
export const runtime = 'edge'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Mail, Trash2, HardDrive, Zap, Settings, LogOut, Brain, Calendar, Filter, TrendingUp, CheckCircle, AlertCircle, ShoppingBag } from 'lucide-react'

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

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl">Carregando...</div>
        </div>
      </div>
    )
  }

  // Unauthenticated state
  if (status === 'unauthenticated' || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Redirecionando...</div>
        </div>
      </div>
    )
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setShowResults(false)
    
    try {
      // Simulação de e-mails para análise (em produção, viriam da API do Gmail)
      const mockEmails = [
        {
          id: '1',
          from: 'banco@itau.com.br',
          subject: 'Fatura do cartão disponível',
          snippet: 'Sua fatura do cartão de crédito já está disponível...',
          date: new Date().toISOString()
        },
        {
          id: '2',
          from: 'ofertas@magazineluiza.com.br',
          subject: '50% OFF em eletrônicos',
          snippet: 'Aproveite nossa mega promoção de eletrônicos...',
          date: new Date().toISOString()
        },
        {
          id: '3',
          from: 'noreply@spam.com',
          subject: 'Você ganhou um prêmio!',
          snippet: 'Clique aqui para resgatar seu prêmio...',
          date: new Date().toISOString()
        },
        {
          id: '4',
          from: 'rh@empresa.com.br',
          subject: 'Reunião importante amanhã',
          snippet: 'Lembrando da reunião de planejamento...',
          date: new Date().toISOString()
        },
        {
          id: '5',
          from: 'newsletter@shopee.com.br',
          subject: 'Frete grátis hoje!',
          snippet: 'Aproveite frete grátis em todas as compras...',
          date: new Date().toISOString()
        }
      ]

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emails: mockEmails }),
      })

      if (!response.ok) {
        throw new Error('Erro ao analisar e-mails')
      }

      const data = await response.json()
      
      if (data.success) {
        setAnalysisResult(data.data)
        setShowResults(true)
      }
    } catch (error) {
      console.error('Erro ao analisar:', error)
      alert('Erro ao analisar e-mails. Tente novamente.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Importante':
        return 'from-green-500 to-emerald-500'
      case 'Promoção':
        return 'from-blue-500 to-cyan-500'
      case 'Lixo':
        return 'from-red-500 to-pink-500'
      default:
        return 'from-gray-500 to-slate-500'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Importante':
        return <CheckCircle className="w-5 h-5" />
      case 'Promoção':
        return <ShoppingBag className="w-5 h-5" />
      case 'Lixo':
        return <Trash2 className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  const stats = [
    {
      icon: <Mail className="w-8 h-8" />,
      label: "E-mails analisados",
      value: analysisResult ? analysisResult.classifications.length.toString() : "0",
      change: analysisResult ? `${analysisResult.classifications.length} agora` : "Aguardando análise",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Trash2 className="w-8 h-8" />,
      label: "Classificados como Lixo",
      value: analysisResult ? analysisResult.summary.junk.toString() : "0",
      change: analysisResult ? `${analysisResult.summary.junk} detectados` : "Aguardando análise",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      label: "Promoções",
      value: analysisResult ? analysisResult.summary.promotion.toString() : "0",
      change: analysisResult ? `${analysisResult.summary.promotion} encontradas` : "Aguardando análise",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      label: "Taxa de precisão",
      value: "98.5%",
      change: "IA GPT-4 ativa",
      color: "from-green-500 to-emerald-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-800/30 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">CleanInbox AI</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-lg border border-green-500/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              {session?.user?.image && (
                <img 
                  src={session.user.image} 
                  alt={session.user.name || 'User'} 
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div>
                <div className="text-sm font-semibold text-white">Conectado como {session?.user?.name}</div>
                <div className="text-xs text-gray-400">{session?.user?.email}</div>
              </div>
            </div>
            
            <button 
              onClick={() => router.push('/settings')}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-300" />
            </button>
            
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Bem-vindo, {session?.user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-300 text-lg">
            Sua caixa de entrada está sendo protegida pela nossa IA brasileira 🇧🇷
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-slate-800/50 backdrop-blur border border-purple-700/30 rounded-2xl p-6 hover:border-purple-500/50 transition-all"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-4 text-white`}>
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-gray-400 text-sm mb-1">{stat.label}</div>
              <div className="text-green-400 text-xs font-semibold">{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-8 rounded-2xl font-semibold text-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Brain className="w-8 h-8" />
            {isAnalyzing ? 'Analisando com GPT-4...' : 'Analisar Agora'}
          </button>
          
          <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-8 rounded-2xl font-semibold text-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-2xl">
            <Zap className="w-8 h-8" />
            Limpeza Automática
          </button>
        </div>

        {/* Analysis Results */}
        {showResults && analysisResult && (
          <div className="bg-slate-800/50 backdrop-blur border border-purple-700/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Brain className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Resultados da Análise IA</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-semibold">Importantes</span>
                </div>
                <div className="text-3xl font-bold text-white">{analysisResult.summary.important}</div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-semibold">Promoções</span>
                </div>
                <div className="text-3xl font-bold text-white">{analysisResult.summary.promotion}</div>
              </div>
              
              <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-semibold">Lixo</span>
                </div>
                <div className="text-3xl font-bold text-white">{analysisResult.summary.junk}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white mb-4">Classificações Detalhadas:</h3>
              {analysisResult.classifications.map((classification, index) => (
                <div 
                  key={index}
                  className="bg-slate-900/50 rounded-xl p-4 border border-purple-700/20 hover:border-purple-500/40 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-10 h-10 bg-gradient-to-r ${getCategoryColor(classification.category)} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                        {getCategoryIcon(classification.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white">E-mail #{classification.index}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            classification.category === 'Importante' ? 'bg-green-500/20 text-green-400' :
                            classification.category === 'Promoção' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {classification.category}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">{classification.reason}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur border border-purple-700/30 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Filtros</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Data</label>
              <select className="w-full bg-slate-900/50 border border-purple-700/30 rounded-lg px-4 py-2 text-white">
                <option>Últimos 7 dias</option>
                <option>Últimos 30 dias</option>
                <option>Últimos 90 dias</option>
                <option>Todo período</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Categoria</label>
              <select className="w-full bg-slate-900/50 border border-purple-700/30 rounded-lg px-4 py-2 text-white">
                <option>Todas</option>
                <option>Importante</option>
                <option>Promoção</option>
                <option>Lixo</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Ação</label>
              <select className="w-full bg-slate-900/50 border border-purple-700/30 rounded-lg px-4 py-2 text-white">
                <option>Todas</option>
                <option>Deletadas</option>
                <option>Arquivadas</option>
                <option>Mantidas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Panel */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-700/30 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Status da Conta</h3>
              <p className="text-gray-300">Plano Gratuito • Análise ilimitada com IA GPT-4</p>
            </div>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all">
              Fazer Upgrade
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
