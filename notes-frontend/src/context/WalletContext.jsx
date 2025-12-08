import { createContext, useContext, useState, useEffect } from 'react';
import { Lucid, Blockfrost } from 'lucid-cardano';
import { METADATA_LABEL } from '../config/chain';

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
            'previewjlxSlBwl9F6K4hnLfDIP0EDeOBG4mvxt'
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
  const sendTransaction = async (
    recipient,
    defaultRecipient = 'addr_test1qzu6vjgcfmjeeywada4usy9rnvsyzc9rf83pdp6spqv5c8p27nag6a8cnpw58ydqdkwyaw7tat9325tzgcvmewux44psrtmecq',
    fixedLovelace = 1000000n,
    noteContent = '',
    action = 'create',
    lockedAddress = undefined,
    noteId = undefined
  ) => {
    if (!lucid || !walletConnected) {
      setTxStatus('Wallet not connected');
      return null;
    }
    setTxStatus('Building transaction...');

    // Helper: FORMAT CONTENT (64-byte safe)
    // If short (<=64 bytes), return a simple string.
    // If long, split into an array of chunks, each <=64 bytes.
    const formatContent = (content) => {
      const encoder = new TextEncoder();
      const text = String(content ?? '');
      if (encoder.encode(text).length <= 64) return text;
      const chunks = [];
      let current = '';
      let currBytes = 0;
      for (const ch of text) {
        const chBytes = encoder.encode(ch).length;
        if (currBytes + chBytes > 64) {
          chunks.push(current);
          current = '';
          currBytes = 0;
        }
        current += ch;
        currBytes += chBytes;
      }
      if (current) chunks.push(current);
      return chunks;
    };

    // Helper: generic 64-byte-safe formatter for any string field (e.g., locked_address)
    const formatText64 = (value) => {
      const encoder = new TextEncoder();
      const text = String(value ?? '');
      if (encoder.encode(text).length <= 64) return text;
      const chunks = [];
      let current = '';
      let currBytes = 0;
      for (const ch of text) {
        const chBytes = encoder.encode(ch).length;
        if (currBytes + chBytes > 64) {
          chunks.push(current);
          current = '';
          currBytes = 0;
        }
        current += ch;
        currBytes += chBytes;
      }
      if (current) chunks.push(current);
      return chunks;
    };

    try {
      const label = METADATA_LABEL; // unique label for this dapp

      // Normalize/validate address and amount
      const toAddress = (recipient || '').trim() || defaultRecipient;
      const bech32Ok = /^addr(_test)?1[0-9a-z]+$/.test(toAddress);
      const safeAddress = bech32Ok ? toAddress : defaultRecipient;
      const amount = fixedLovelace && fixedLovelace > 0n ? fixedLovelace : 1000000n;

      const tx = await lucid
        .newTx()
        .payToAddress(safeAddress, { lovelace: amount })
        // Use object with desired keys; note is string or chunked list based on length
        .attachMetadata(label, {
          action,
          note: formatContent(noteContent),
          created_at: new Date().toISOString(),
          ...(lockedAddress ? { locked_address: formatText64(lockedAddress) } : {}),
          ...(noteId != null ? { note_id: String(noteId) } : {}),
        })
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

