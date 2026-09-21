import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import ResumePage from './pages/ResumePage'
import HandbookPage from './pages/HandbookPage'

// # Step 2: minimal pathname routing (a couple of extra routes don't warrant a router library)
const path = window.location.pathname.replace(/\/+$/, "") || "/";
const ROUTES: Record<string, typeof App> = {
  "/resume": ResumePage,
  "/hipaa": HandbookPage,
};
const Page = ROUTES[path] ?? App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
