import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import ResumePage from './pages/ResumePage'
import HandbookPage from './pages/HandbookPage'
import DicomHandbookPage from './pages/DicomHandbookPage'
import WritingPage from './pages/WritingPage'

// A chapter page carries the Markdown renderer, so it loads only when a chapter is opened.
const DicomChapterPage = lazy(() => import('./pages/DicomChapterPage'))

// # Step 2: minimal pathname routing (a couple of extra routes don't warrant a router library)
const path = window.location.pathname.replace(/\/+$/, "") || "/";
const ROUTES: Record<string, typeof App> = {
  "/resume": ResumePage,
  "/hipaa": HandbookPage,
  "/dicom": DicomHandbookPage,
  "/writing": WritingPage,
};
const chapterMatch = path.match(/^\/dicom\/(\d{1,2})$/);
const Page = ROUTES[path] ?? App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {chapterMatch ? (
      <Suspense fallback={null}>
        <DicomChapterPage number={Number(chapterMatch[1])} />
      </Suspense>
    ) : (
      <Page />
    )}
  </StrictMode>,
)
