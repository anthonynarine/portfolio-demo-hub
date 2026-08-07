import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import ResumePage from './pages/ResumePage'

// # Step 1: force dark mode globally (no toggle)
document.documentElement.classList.add("dark");

// # Step 2: minimal pathname routing (single extra route doesn't warrant a router library)
const path = window.location.pathname.replace(/\/+$/, "") || "/";
const Page = path === "/resume" ? ResumePage : App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
