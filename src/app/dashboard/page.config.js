// 🚫 Impede completamente o Next.js de tentar pré-renderizar essa página
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0
export const runtime = 'edge'

// 🚫 Hack definitivo: evita build de SSR nessa rota
export const preferredRegion = 'auto'
export const dynamicParams = false
export const maxDuration = 1
