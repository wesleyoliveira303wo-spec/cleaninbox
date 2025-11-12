'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Mail, Trash2, HardDrive, Zap, Settings, LogOut, Brain, Calendar, Filter, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
    }, 3000)
  }

  const stats = [
    {
      icon: <Mail className="w-8 h-8" />,
      label: "E-mails analisados",
      value: "12.847",
      change: "+2.341 hoje",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Trash2 className="w-8 h-8" />,
      label: "E-mails deletados",
      value: "8.234",
      change: "+1.892 hoje",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <HardDrive className="w-8 h-8" />,
      label: "Espaço liberado",
      value: "3.2 GB",
      change: "+450 MB hoje",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      label: "Taxa de precisão",
      value: "98.5%",
      change: "IA em evolução",
      color: "from-orange-500 to-yellow-500"
    }
  ]

  const recentActivity = [
    { type: "Promoções", count: 234, action: "Arquivadas", time: "Há 2 horas" },
    { type: "Newsletters", count: 156, action: "Deletadas", time: "Há 5 horas" },
    { type: "Notificações", count: 89, action: "Deletadas", time: "Há 1 dia" },
    { type: "Spam", count: 445, action: "Deletadas", time: "Há 2 dias" }
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
            <div className="hidden md:flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-lg">
              <img 
                src={session.user?.image || ''} 
                alt={session.user?.name || ''} 
                className="w-8 h-8 rounded-full"
              />
              <div>
                <div className="text-sm font-semibold text-white">{session.user?.name}</div>
                <div className="text-xs text-gray-400">{session.user?.email}</div>
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
            Bem-vindo, {session.user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-300 text-lg">
            Sua caixa de entrada está {stats[3].value} mais limpa com nossa IA
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
            {isAnalyzing ? 'Analisando com IA...' : 'Analisar Agora'}
          </button>
          
          <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-8 rounded-2xl font-semibold text-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-2xl">
            <Zap className="w-8 h-8" />
            Limpeza Automática
          </button>
        </div>

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
                <option>Promoções</option>
                <option>Newsletters</option>
                <option>Spam</option>
                <option>Notificações</option>
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

        {/* Recent Activity */}
        <div className="bg-slate-800/50 backdrop-blur border border-purple-700/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Atividade Recente</h2>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl hover:bg-slate-900/70 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {activity.count}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{activity.type}</div>
                    <div className="text-gray-400 text-sm">{activity.action}</div>
                  </div>
                </div>
                <div className="text-gray-400 text-sm">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Panel */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-700/30 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Status da Conta</h3>
              <p className="text-gray-300">Plano Gratuito • 347 de 500 e-mails analisados este mês</p>
            </div>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all">
              Fazer Upgrade
            </button>
          </div>
          
          <div className="mt-4 bg-slate-900/50 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full" style={{ width: '69.4%' }}></div>
          </div>
        </div>
      </main>
    </div>
  )
}
