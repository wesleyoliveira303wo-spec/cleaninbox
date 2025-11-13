'use client'

import { useSession, signOut } from 'next-auth/react'

export default function DashboardPage() {
  const { data: session, status } = useSession()

  // Evita erro se a sessão ainda não estiver carregada
  if (status === 'loading') {
    return <p className="text-gray-400 text-center mt-10">Carregando sessão...</p>
  }

  // Redireciona se o usuário não estiver autenticado
  if (status === 'unauthenticated' || !session) {
    if (typeof window !== 'undefined') {
      window.location.href = '/api/auth/signin'
    }
    return null
  }

  // Usuário autenticado
  const user = session.user

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-semibold mb-2">Bem-vindo, {user?.name || 'Usuário'}</h1>
      <p className="text-gray-400 mb-4">{user?.email}</p>
      <button
        onClick={() => signOut()}
        className="bg-red-500 hover:bg-red-400 px-4 py-2 rounded-md transition-all"
      >
        Sair
      </button>
    </div>
  )
}
