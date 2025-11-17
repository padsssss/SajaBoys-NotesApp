import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider, useWallet } from './context/WalletContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Notes from './pages/Notes';
import About from './pages/About';

function AppContent() {
  const { walletConnected, walletAddr, connectWallet, disconnectWallet, connecting } = useWallet();

  return (
    <Layout
      walletConnected={walletConnected}
      walletAddr={walletAddr}
      onConnectWallet={connectWallet}
      onDisconnectWallet={disconnectWallet}
      connecting={connecting}
    >
      <Routes>
        <Route
          path="/"
          element={
            <Home
              walletConnected={walletConnected}
              onConnectWallet={connectWallet}
              connecting={connecting}
            />
          }
        />
        <Route path="/notes" element={<Notes />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </Router>
  );
}

export default App;
