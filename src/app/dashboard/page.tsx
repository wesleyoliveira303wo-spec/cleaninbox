'use client'

import dynamic from 'next/dynamic'

export const runtime = 'edge'
export const dynamicParams = false
export const fetchCache = 'force-no-store'
export const revalidate = 0

const DashboardContent = dynamic(() => import('@/components/DashboardContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center text-white">
      <p>Carregando Dashboard...</p>
    </div>
  ),
})

export default function DashboardPage() {
  return <DashboardContent />
}
