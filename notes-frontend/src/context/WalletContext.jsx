import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  const [walletBalance, setWalletBalance] = useState(null);
  const [utxos, setUtxos] = useState([]);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [walletInfoError, setWalletInfoError] = useState('');

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
        console.error('Failed to initialize Blaze:', err);
        alert('Failed to initialize Blaze. Check console for details.');
      }
    };
    initLucid();
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    if (!lucid) {
      alert('Blaze not ready yet. Please wait...');
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
    setWalletBalance(null);
    setUtxos([]);
    if (lucid) {
      // Clear the selected wallet from Lucid
      lucid.selectWallet(null);
    }
    console.log('Wallet disconnected');
  };

  // Fetch wallet balance and UTXOs
  const fetchWalletInfo = useCallback(async () => {
    if (!walletAddr || !lucid) return;
    
    setLoadingBalance(true);
    setWalletInfoError('');
    try {
      // Fetch balance using Lucid
      const balance = await lucid.wallet.getBalance();
      // Handle BigInt conversion
      const balanceValue = typeof balance === 'bigint' ? Number(balance) : Number(balance);
      const balanceInAda = balanceValue / 1_000_000;
      setWalletBalance(balanceInAda);

      // Fetch UTXOs using Lucid
      const walletUtxos = await lucid.wallet.getUtxos();
      setUtxos(walletUtxos || []);
    } catch (err) {
      console.error('Failed to fetch wallet info:', err);
      setWalletInfoError('Failed to fetch wallet info');
      // Fallback: try Blockfrost API directly
      try {
        const response = await fetch(
          `https://cardano-preview.blockfrost.io/api/v0/addresses/${walletAddr}`,
          {
            headers: {
              'project_id': 'previewjlxSlBwl9F6K4hnLfDIP0EDeOBG4mvxt'
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          const balanceInAda = (data.amount || []).find(a => a.unit === 'lovelace')?.quantity 
            ? Number((data.amount || []).find(a => a.unit === 'lovelace').quantity) / 1_000_000 
            : 0;
          setWalletBalance(balanceInAda);
        }

        // Fetch UTXOs from Blockfrost
        const utxoResponse = await fetch(
          `https://cardano-preview.blockfrost.io/api/v0/addresses/${walletAddr}/utxos`,
          {
            headers: {
              'project_id': 'previewjlxSlBwl9F6K4hnLfDIP0EDeOBG4mvxt'
            }
          }
        );
        if (utxoResponse.ok) {
          const utxoData = await utxoResponse.json();
          setUtxos(utxoData || []);
        }
      } catch (fallbackErr) {
        console.error('Fallback fetch failed:', fallbackErr);
        setWalletInfoError('Failed to fetch wallet info');
      }
    } finally {
      setLoadingBalance(false);
    }
  }, [walletAddr, lucid]);

  // Prevent overlapping fetches when polling
  const isFetchingRef = useRef(false);

  // Auto-fetch wallet info when wallet connects
  useEffect(() => {
    if (walletConnected && walletAddr && lucid) {
      fetchWalletInfo();
      // Refresh every 30 seconds
      const interval = setInterval(fetchWalletInfo, 30000);
      return () => clearInterval(interval);
    }
  }, [walletConnected, walletAddr, lucid, fetchWalletInfo]);

  // Auto-fetch wallet info when wallet connects.
  // Use a visibility-aware polling loop and avoid overlapping requests.
  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      if (!mounted) return;
      // don't poll when document is hidden to avoid unnecessary network usage
      if (typeof document !== 'undefined' && document.hidden) {
        // check again after 30s
        setTimeout(poll, 30000);
        return;
      }

      if (isFetchingRef.current) {
        // schedule next poll
        setTimeout(poll, 30000);
        return;
      }

      if (walletConnected && walletAddr && lucid) {
        try {
          isFetchingRef.current = true;
          await fetchWalletInfo();
        } finally {
          isFetchingRef.current = false;
        }
      }

      // schedule next run
      setTimeout(poll, 30000);
    };

    if (walletConnected && walletAddr && lucid) {
      poll();
    }

    const onVisibilityChange = () => {
      // when tab becomes visible, trigger an immediate refresh
      if (!document.hidden && walletConnected && walletAddr && lucid) {
        // fire-and-forget
        fetchWalletInfo().catch(() => {});
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibilityChange);
    }

    return () => {
      mounted = false;
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibilityChange);
      }
    };
  }, [walletConnected, walletAddr, lucid, fetchWalletInfo]);

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

    // Helper: extract pure bech32 address from any prefixed text like "You sent <addr...>"
    const sanitizeAddress = (value) => {
      const text = String(value ?? '').trim();
      const match = text.match(/(addr(?:_test)?1[0-9a-z]+)/i);
      return match ? match[1] : text;
    };

    try {
      const label = METADATA_LABEL; // unique label for this dapp

      // Normalize/validate address and amount
      const toAddress = sanitizeAddress((recipient || '')) || defaultRecipient;
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
          ...(lockedAddress ? { address: formatText64(sanitizeAddress(lockedAddress)) } : {}),
          ...(noteId != null ? { note_id: String(noteId) } : {}),
        })
        .complete();

      setTxStatus('Please sign the transaction in your wallet...');
      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();
      setTxStatus(`Transaction sent! Tx: ${txHash.slice(0, 16)}...`);
      console.log('Transaction successful:', `https://preview.cardanoscan.io/transaction/${txHash}`);
      // Refresh wallet info after transaction
      setTimeout(() => fetchWalletInfo(), 2000);
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
    walletBalance,
    utxos,
    loadingBalance,
    fetchWalletInfo,
    walletInfoError,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

