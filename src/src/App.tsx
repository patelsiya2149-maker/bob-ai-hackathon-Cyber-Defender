import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SecurityEngineProvider } from './hooks/useSecurityEngine';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { IncidentDetail } from './pages/IncidentDetail';

export default function App() {
  return (
    <BrowserRouter>
      <SecurityEngineProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/incident/:id" element={<IncidentDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </SecurityEngineProvider>
    </BrowserRouter>
  );
}
