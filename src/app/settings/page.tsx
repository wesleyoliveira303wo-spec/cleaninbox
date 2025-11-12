'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Mail, ArrowLeft, Bell, Shield, Zap, Globe, Moon, Sun } from 'lucide-react'

export default function Settings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState({
    frequency: 'weekly',
    mode: 'manual',
    reviewBeforeDelete: true,
    theme: 'dark',
    language: 'pt-BR',
    emailNotifications: true,
    weeklyReports: true
  })

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

  const handleSave = () => {
    // Aqui você salvaria as configurações no backend
    alert('Configurações salvas com sucesso!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-800/30 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CleanInbox AI</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Configurações</h1>
          <p className="text-gray-300 text-lg">Personalize sua experiência com o CleanInbox AI</p>
        </div>

        {/* Limpeza Automática */}
        <div className="bg-slate-800/50 backdrop-blur border border-purple-700/30 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Limpeza Automática</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-white font-semibold mb-3 block">Frequência de limpeza</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['daily', 'weekly', 'monthly'].map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setSettings({ ...settings, frequency: freq })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      settings.frequency === freq
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-purple-700/30 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="text-white font-semibold">
                      {freq === 'daily' && 'Diária'}
                      {freq === 'weekly' && 'Semanal'}
                      {freq === 'monthly' && 'Mensal'}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      {freq === 'daily' && 'Todos os dias'}
                      {freq === 'weekly' && 'Uma vez por semana'}
                      {freq === 'monthly' && 'Uma vez por mês'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-white font-semibold mb-3 block">Modo de operação</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['manual', 'automatic'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSettings({ ...settings, mode })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      settings.mode === mode
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-purple-700/30 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="text-white font-semibold">
                      {mode === 'manual' ? 'Manual' : 'Automático'}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      {mode === 'manual' 
                        ? 'Você aprova cada limpeza' 
                        : 'IA limpa automaticamente'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
              <div>
                <div className="text-white font-semibold">Revisar antes de deletar</div>
                <div className="text-gray-400 text-sm">Receba lista antes da exclusão final</div>
              </div>
              <button
                onClick={() => setSettings({ ...settings, reviewBeforeDelete: !settings.reviewBeforeDelete })}
                className={`w-14 h-8 rounded-full transition-all ${
                  settings.reviewBeforeDelete ? 'bg-purple-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.reviewBeforeDelete ? 'translate-x-7' : 'translate-x-1'
                }`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Notificações */}
        <div className="bg-slate-800/50 backdrop-blur border border-purple-700/30 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Notificações</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
              <div>
                <div className="text-white font-semibold">Notificações por e-mail</div>
                <div className="text-gray-400 text-sm">Receba atualizações no seu e-mail</div>
              </div>
              <button
                onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                className={`w-14 h-8 rounded-full transition-all ${
                  settings.emailNotifications ? 'bg-purple-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.emailNotifications ? 'translate-x-7' : 'translate-x-1'
                }`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
              <div>
                <div className="text-white font-semibold">Relatórios semanais</div>
                <div className="text-gray-400 text-sm">Resumo semanal da limpeza</div>
              </div>
              <button
                onClick={() => setSettings({ ...settings, weeklyReports: !settings.weeklyReports })}
                className={`w-14 h-8 rounded-full transition-all ${
                  settings.weeklyReports ? 'bg-purple-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.weeklyReports ? 'translate-x-7' : 'translate-x-1'
                }`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Aparência */}
        <div className="bg-slate-800/50 backdrop-blur border border-purple-700/30 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Moon className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Aparência</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-white font-semibold mb-3 block">Tema</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['dark', 'light'].map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setSettings({ ...settings, theme })}
                    className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      settings.theme === theme
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-purple-700/30 hover:border-purple-500/50'
                    }`}
                  >
                    {theme === 'dark' ? <Moon className="w-6 h-6 text-white" /> : <Sun className="w-6 h-6 text-white" />}
                    <div className="text-left">
                      <div className="text-white font-semibold">
                        {theme === 'dark' ? 'Escuro' : 'Claro'}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {theme === 'dark' ? 'Tema escuro padrão' : 'Tema claro'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-white font-semibold mb-3 block">Idioma</label>
              <select 
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="w-full bg-slate-900/50 border border-purple-700/30 rounded-xl px-4 py-3 text-white"
              >
                <option value="pt-BR">🇧🇷 Português (Brasil)</option>
                <option value="en">🇺🇸 English</option>
              </select>
            </div>
          </div>
        </div>

        {/* Segurança */}
        <div className="bg-slate-800/50 backdrop-blur border border-purple-700/30 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Segurança</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-900/50 rounded-xl">
              <div className="text-white font-semibold mb-2">Conta conectada</div>
              <div className="text-gray-400 text-sm mb-3">{session.user?.email}</div>
              <button className="text-red-400 hover:text-red-300 text-sm font-semibold transition-colors">
                Desconectar conta Gmail
              </button>
            </div>

            <div className="p-4 bg-slate-900/50 rounded-xl">
              <div className="text-white font-semibold mb-2">Dados e privacidade</div>
              <div className="text-gray-400 text-sm mb-3">
                Seus dados são criptografados e nunca compartilhados
              </div>
              <button className="text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors">
                Ver política de privacidade
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 border border-purple-500 text-purple-300 hover:bg-purple-500/10 rounded-xl font-semibold transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all"
          >
            Salvar alterações
          </button>
        </div>
      </main>
    </div>
  )
}
