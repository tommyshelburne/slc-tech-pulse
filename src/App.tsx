import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Spinner } from './components/ui/Spinner';
import HomePage from './pages/HomePage';

// Landing page stays eager so / renders on first paint without a chunk
// fetch. Every other route is lazy-loaded to keep the initial JS minimal.
const EventsPage = lazy(() => import('./pages/EventsPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const JobsPage = lazy(() => import('./pages/JobsPage'));
const CompaniesPage = lazy(() => import('./pages/CompaniesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

export function AppRoutes() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
