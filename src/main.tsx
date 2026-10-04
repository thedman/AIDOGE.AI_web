import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './config/wagmi'
import App from './App'
import './styles/archive.css'
import './styles/dashboard.css'
import { initializeAnalytics } from './analytics'

const queryClient = new QueryClient()
initializeAnalytics(import.meta.env.VITE_GA_MEASUREMENT_ID)
document.documentElement.style.setProperty('--archive-background', `url("${import.meta.env.BASE_URL}assets/background2.jpg")`)
createRoot(document.getElementById('root')!).render(
  <StrictMode><WagmiProvider config={config}><QueryClientProvider client={queryClient}><App /></QueryClientProvider></WagmiProvider></StrictMode>,
)
