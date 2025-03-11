import React from 'react';
import { ThemeProvider } from '@components/theme/ThemeProvider';
import Layout from '@components/layout/Layout';
import ChatScreen from '@components/chat/ChatScreen';

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <ChatScreen />
      </Layout>
    </ThemeProvider>
  );
}

export default App;