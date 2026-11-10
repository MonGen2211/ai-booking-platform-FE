import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@fontsource/noto-sans/latin-400.css'
import '@fontsource/noto-sans/vietnamese-400.css'
import '@fontsource/noto-sans/latin-500.css'
import '@fontsource/noto-sans/vietnamese-500.css'
import '@fontsource/noto-sans/latin-600.css'
import '@fontsource/noto-sans/vietnamese-600.css'
import '@fontsource/noto-sans/latin-700.css'
import '@fontsource/noto-sans/vietnamese-700.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
