import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navigation from './components/Navigation';
import VendorsPage from './pages/VendorsPage';
import TasksPage from './pages/TasksPage';
import BudgetPage from './pages/BudgetPage';
import RemindersPage from './pages/RemindersPage';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-ivory">
          <Navigation />
          <Routes>
            <Route path="/" element={<Navigate to="/vendors" replace />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
