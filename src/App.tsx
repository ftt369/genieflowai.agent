import React from 'react';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import Layout from '@/components/layout/Layout';

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <div className="flex h-screen">
          {/* Main content area */}
          <div className="flex-1 overflow-hidden">
            {/* Your main content goes here */}
          </div>
        </div>
      </Layout>
    </ThemeProvider>
  );
}

export default App;