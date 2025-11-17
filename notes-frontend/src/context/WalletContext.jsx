import { createContext, useContext, useState, useEffect } from 'react';
import { Lucid, Blockfrost } from 'lucid-cardano';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [lucid, setLucid] = useState(null);
  const [walletAddr, setWalletAddr] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [txStatus, setTxStatus] = useState('');

  // Initialize Lucid
  useEffect(() => {
    const initLucid = async () => {
      try {
        const lucidInstance = await Lucid.new(
          new Blockfrost(
            'https://cardano-preview.blockfrost.io/api/v0',
            'previewa6B1zxRtfxmIUpzmtf0JMv8dV0NUUgLS'
          ),
          'Preview'
        );
        setLucid(lucidInstance);
      } catch (err) {
        console.error('Failed to initialize Lucid:', err);
        alert('Failed to initialize Lucid. Check console for details.');
      }
    };
    initLucid();
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    if (!lucid) {
      alert('Lucid not ready yet. Please wait...');
      return;
    }
    setConnecting(true);
    try {
      if (!window.cardano) {
        alert('No Cardano wallet found');
        return;
      }
      const walletPriority = ['lace', 'nami', 'eternl', 'flint'];
      const selected = walletPriority.find((w) => window.cardano[w]);
      if (!selected) {
        alert('No supported wallet found.');
        return;
      }

      const walletApi = await window.cardano[selected].enable();
      lucid.selectWallet(walletApi);
      const address = await lucid.wallet.address();

      setWalletAddr(address);
      setWalletConnected(true);
      setTxStatus('Wallet connected!');
      console.log('Wallet connected:', address);
    } catch (err) {
      console.error('Wallet connect error:', err);
      alert('Wallet connection failed');
    } finally {
      setConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletAddr('');
    setWalletConnected(false);
    setTxStatus('');
    if (lucid) {
      // Clear the selected wallet from Lucid
      lucid.selectWallet(null);
    }
    console.log('Wallet disconnected');
  };

  // Send transaction
  const sendTransaction = async (recipient, defaultRecipient = 'addr_test1...', fixedLovelace = 1000000n) => {
    if (!lucid || !walletConnected) {
      setTxStatus('Wallet not connected');
      return null;
    }
    setTxStatus('Building transaction...');
    try {
      const tx = await lucid
        .newTx()
        .payToAddress(recipient || defaultRecipient, { lovelace: fixedLovelace })
        .complete();

      setTxStatus('Please sign the transaction in your wallet...');
      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();
      setTxStatus(`Transaction sent! Tx: ${txHash.slice(0, 16)}...`);
      console.log('Transaction successful:', `https://preview.cardanoscan.io/transaction/${txHash}`);
      return txHash;
    } catch (err) {
      console.error('Transaction failed:', err);
      setTxStatus('Transaction failed');
      return null;
    }
  };

  const value = {
    lucid,
    walletAddr,
    walletConnected,
    connecting,
    txStatus,
    setTxStatus,
    connectWallet,
    disconnectWallet,
    sendTransaction,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

