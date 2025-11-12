'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Mail, Zap, Shield, Star, Check, ArrowRight, Trash2, BarChart3, Settings, Users, Clock, Brain } from 'lucide-react'

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Empresária",
      content: "Liberou 15GB da minha conta! Agora encontro e-mails importantes em segundos.",
      rating: 5
    },
    {
      name: "João Santos",
      role: "Desenvolvedor",
      content: "A IA é impressionante. Deletou 8.000 e-mails promocionais sem tocar nos importantes.",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Advogada",
      content: "Economizo 2 horas por semana organizando e-mails. Vale cada centavo!",
      rating: 5
    }
  ]

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "IA Brasileira",
      description: "Treinada para entender português e domínios .br"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Limpeza Automática",
      description: "Agenda limpezas e receba relatórios semanais"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "100% Seguro",
      description: "OAuth Google oficial, sem acesso às suas senhas"
    }
  ]

  const plans = [
    {
      name: "Gratuito",
      price: "R$ 0",
      period: "/mês",
      description: "Para começar",
      features: [
        "Até 500 e-mails/mês",
        "Limpeza manual",
        "Relatórios básicos",
        "Suporte por e-mail"
      ],
      popular: false
    },
    {
      name: "PRO",
      price: "R$ 19,90",
      period: "/mês",
      description: "Mais popular",
      features: [
        "E-mails ilimitados",
        "IA ativa 24/7",
        "Limpeza automática",
        "Relatórios detalhados",
        "Suporte prioritário"
      ],
      popular: true
    },
    {
      name: "Business",
      price: "R$ 39,90",
      period: "/mês",
      description: "Para empresas",
      features: [
        "Múltiplas contas",
        "IA personalizada",
        "Dashboard empresarial",
        "API de integração",
        "Suporte dedicado"
      ],
      popular: false
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
          <nav className="hidden md:flex items-center gap-6">
            <a href="#como-funciona" className="text-gray-300 hover:text-white transition-colors">Como funciona</a>
            <a href="#precos" className="text-gray-300 hover:text-white transition-colors">Preços</a>
            <a href="#depoimentos" className="text-gray-300 hover:text-white transition-colors">Depoimentos</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-purple-900/30 border border-purple-700/50 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-sm text-purple-200">🇧🇷 Primeira IA brasileira para e-mails</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Seu e-mail limpo,
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              automaticamente.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Deixe a IA eliminar o lixo digital pra você. Libere espaço, encontre o importante e tenha uma caixa de entrada sempre organizada.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button 
              onClick={handleGoogleSignIn}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-2 transition-all transform hover:scale-105 shadow-2xl"
            >
              <Mail className="w-5 h-5" />
              Conectar minha conta Gmail
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="border border-purple-500 text-purple-300 hover:bg-purple-500/10 px-8 py-4 rounded-xl font-semibold text-lg transition-all">
              Ver demonstração
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur border border-purple-700/30 rounded-2xl p-6">
              <div className="text-3xl font-bold text-blue-400 mb-2">10.000+</div>
              <div className="text-gray-300">E-mails deletados hoje</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur border border-purple-700/30 rounded-2xl p-6">
              <div className="text-3xl font-bold text-purple-400 mb-2">2.5GB</div>
              <div className="text-gray-300">Espaço liberado em média</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur border border-purple-700/30 rounded-2xl p-6">
              <div className="text-3xl font-bold text-green-400 mb-2">98%</div>
              <div className="text-gray-300">Precisão da IA</div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-20 px-4 bg-slate-800/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Como funciona</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              3 passos simples para ter sua caixa de entrada sempre limpa
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">1. Conecte sua conta</h3>
              <p className="text-gray-300">
                Login seguro com OAuth Google. Sem senhas, sem riscos. Acesso apenas aos e-mails.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">2. IA analisa tudo</h3>
              <p className="text-gray-300">
                Nossa IA brasileira classifica seus e-mails: importantes, promoções e lixo digital.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">3. Limpeza automática</h3>
              <p className="text-gray-300">
                Deletamos o lixo, arquivamos promoções antigas e mantemos apenas o importante.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Por que escolher o CleanInbox AI?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur border border-purple-700/30 rounded-2xl p-8 hover:border-purple-500/50 transition-all">
                <div className="text-purple-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="py-20 px-4 bg-slate-800/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Planos e preços</h2>
            <p className="text-xl text-gray-300">Escolha o plano ideal para você</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div key={index} className={`relative bg-slate-800/50 backdrop-blur border rounded-2xl p-8 ${
                plan.popular 
                  ? 'border-purple-500 scale-105 shadow-2xl shadow-purple-500/20' 
                  : 'border-purple-700/30'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Mais popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-white mb-2">
                    {plan.price}
                    <span className="text-lg text-gray-400">{plan.period}</span>
                  </div>
                  <p className="text-gray-300">{plan.description}</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={handleGoogleSignIn}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                    : 'border border-purple-500 text-purple-300 hover:bg-purple-500/10'
                }`}>
                  {plan.name === 'Gratuito' ? 'Começar grátis' : 'Assinar agora'}
                </button>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-300 mb-4">Pagamento seguro via:</p>
            <div className="flex justify-center items-center gap-6">
              <div className="bg-slate-800/50 px-4 py-2 rounded-lg text-purple-300 font-semibold">PIX</div>
              <div className="bg-slate-800/50 px-4 py-2 rounded-lg text-purple-300 font-semibold">Mercado Pago</div>
              <div className="bg-slate-800/50 px-4 py-2 rounded-lg text-purple-300 font-semibold">Cartão</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">O que nossos usuários dizem</h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur border border-purple-700/30 rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-xl md:text-2xl text-white mb-6 italic">
                  "{testimonials[activeTestimonial].content}"
                </blockquote>
                <div>
                  <div className="font-semibold text-purple-300 text-lg">
                    {testimonials[activeTestimonial].name}
                  </div>
                  <div className="text-gray-400">
                    {testimonials[activeTestimonial].role}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === activeTestimonial 
                        ? 'bg-purple-500' 
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-900/50 to-blue-900/50">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pronto para ter uma caixa de entrada limpa?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de brasileiros que já liberaram espaço e tempo com nossa IA.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button 
              onClick={handleGoogleSignIn}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-2 transition-all transform hover:scale-105 shadow-2xl"
            >
              <Mail className="w-5 h-5" />
              Conectar Gmail agora
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-sm text-gray-400">
            ✅ Sem compromisso • ✅ Cancele quando quiser • ✅ Dados 100% seguros
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-800/30 bg-slate-900/50 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">CleanInbox AI</span>
              </div>
              <p className="text-gray-400 mb-4">
                A primeira IA brasileira para limpeza inteligente de e-mails.
              </p>
              <p className="text-sm text-gray-500">
                🇧🇷 Feito com ❤️ no Brasil
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Como funciona</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Segurança</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre nós</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Termos de uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Política de privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LGPD</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-purple-800/30 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 CleanInbox AI BR. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
