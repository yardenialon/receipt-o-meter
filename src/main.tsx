
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Error handler for React 18
const handleError = (error: Error) => {
  console.error('Uncaught application error:', error);
};

// Get the root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Create a root and render
try {
  const root = createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  );
} catch (error) {
  handleError(error instanceof Error ? error : new Error('Unknown render error'));
  document.body.innerHTML = '<div style="color: red; text-align: center; padding: 2rem;"><h1>האפליקציה נכשלה בטעינה</h1><p>אנא רענן את הדף או נסה שוב מאוחר יותר.</p></div>';
}

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});
