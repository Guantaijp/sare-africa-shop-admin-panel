import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

/**
 * The deployed demo has no server to talk to — JSON Server is a dev process,
 * not something static hosting can run. In the production build only, Mock
 * Service Worker intercepts the same REST calls at the network layer and
 * answers them from a seeded in-browser database. Application code is
 * unchanged: axios still issues real requests either way.
 *
 * In development this is skipped, so `pnpm dev` keeps hitting the real JSON
 * Server on port 4000.
 */
async function enableMocking(): Promise<void> {
  if (!import.meta.env.PROD) return

  const { worker } = await import('./mocks/browser')
  await worker.start({
    // Anything without a handler (assets, fonts) passes straight through.
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  })
}

void enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  )
})
