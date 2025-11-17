"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import './noteapp.css'
import { Lucid, Blockfrost } from "lucid-cardano"

function NoteApp() {
  const [lucid, setLucid] = useState(null)
  const [walletAddr, setWalletAddr] = useState("")
  const [walletConnected, setWalletConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)

  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [editingNote, setEditingNote] = useState(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState(null)
  const [txStatus, setTxStatus] = useState("")

  // Initialize Lucid once
  useEffect(() => {
    const initLucid = async () => {
      try {
        const lucidInstance = await Lucid.new(
          new Blockfrost(
            "https://cardano-preview.blockfrost.io/api/v0",
            "previewa6B1zxRtfxmIUpzmtf0JMv8dV0NUUgLS" // Your real Project ID
          ),
          "Preview"
        )
        setLucid(lucidInstance)
      } catch (err) {
        console.error("Failed to initialize Lucid:", err)
        alert("Failed to initialize Lucid. Check console for details.")
      }
    }
    initLucid()
  }, [])

  useEffect(() => {
    fetchNotes()
  }, [walletConnected, walletAddr])

  // Connect to Lace Wallet (user must click!)
  const connectWallet = async () => {
    if (!lucid) {
      alert("Lucid not ready yet. Please wait...")
      return
    }
    setConnecting(true)
    try {
      if (!window.cardano) {
        alert("No Cardano wallet injected. Install Lace, Nami, Eternl, or Flint.");
        return;
      }

      const walletPriority = ["lace", "nami", "eternl", "flint"];
      let selected = walletPriority.find(w => window.cardano[w]);

      if (!selected) {
        alert("No supported wallet found.");
        return;
      }

      console.log("Connecting wallet:", selected);

      const walletApi = await window.cardano[selected].enable();

      lucid.selectWallet(walletApi);

      const address = await lucid.wallet.address();

      setWalletAddr(address);
      setWalletConnected(true);
      setTxStatus("Wallet connected!");

      console.log("Wallet connected:", address);
    } catch (err) {
      console.error("Wallet connect error:", err);
      alert("Wallet connection cancelled or failed.");
    } finally {
      setConnecting(false)
    }
  };

  const fetchNotes = async () => {
    if (!walletConnected) {
      setNotes([])
      return
    }
    try {
      const response = await axios.get(`/api/notes?owner=${walletAddr}`)
      const notesData = Array.isArray(response.data) ? response.data : []
      setNotes(notesData)
    } catch (error) {
      console.error("Error fetching notes:", error)
      setNotes([])
    }
  }

  // Send metadata to Cardano testnet
  const sendBlockchainLog = async (action, note) => {
    if (!lucid || !walletConnected) {
      setTxStatus("Wallet not connected")
      return null
    }

    setTxStatus("Building transaction...")
    try {
      const tx = await lucid
        .newTx()
        // Required: send 0 lovelace back to self (validates tx)
        .payToAddress(walletAddr, { lovelace: 0n })
        .attachMetadata(674, {
          app: "NotesApp",
          action,
          noteId: note?.id || null,
          title: note?.title || null,
          contentPreview: note?.content
            ? note.content.slice(0, 200) + (note.content.length > 200 ? "..." : "")
            : null,
          timestamp: Date.now(),
          sender: walletAddr
        })
        .complete()

      setTxStatus("Please sign the transaction in Lace...")
      const signedTx = await tx.sign().complete()
      const txHash = await signedTx.submit()

      setTxStatus(`Logged on-chain! Tx: ${txHash.slice(0, 16)}...`)
      setTimeout(() => setTxStatus(""), 8000)
      console.log("Success! Tx:", `https://testnet.cardanoscan.io/transaction/${txHash}`)
      return txHash
    } catch (err) {
      console.error("Blockchain log failed:", err)
      const msg = err.info || err.message || "Transaction failed"
      setTxStatus(`Failed: ${msg}`)
      setTimeout(() => setTxStatus(""), 10000)
      return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!walletConnected) {
      alert("Please connect your wallet first!")
      return
    }
    if (!title.trim() || !content.trim()) return

    const notePayload = { title: title.trim(), content: content.trim(), owner: walletAddr }

    try {
      if (editingNote) {
        await axios.put(`/api/notes/${editingNote.id}`, notePayload)
        await sendBlockchainLog("UPDATE", { ...notePayload, id: editingNote.id })
        setEditingNote(null)
      } else {
        const res = await axios.post("/api/notes", notePayload)
        const createdNote = res.data
        await sendBlockchainLog("CREATE", createdNote)
      }

      setTitle("")
      setContent("")
      fetchNotes()
    } catch (error) {
      console.error("Save failed:", error)
      alert("Failed to save note to database.")
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/notes/${id}`)
      fetchNotes()
    } catch (error) {
      console.error("Delete failed:", error)
      alert("Failed to delete note.")
    }
  }

  const confirmDelete = async () => {
    if (!noteToDelete) return
    await handleDelete(noteToDelete.id)
    await sendBlockchainLog("DELETE", noteToDelete)
    setShowDeleteConfirmation(false)
    setNoteToDelete(null)
  }

  const handleEdit = (note) => {
    if (note.owner !== walletAddr) {
      alert("You can only edit your own notes!")
      return
    }
    setEditingNote(note)
    setTitle(note.title)
    setContent(note.content)
    window.scrollTo(0, 0)
  }

  // Delete confirmation modal
  if (showDeleteConfirmation) {
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <div className="modal-icon">Warning</div>
            <h2>Delete Note</h2>
          </div>
          <div className="modal-body">
            <p>Are you sure you want to permanently delete this note?</p>
            <div className="note-preview">
              <h4>"{noteToDelete?.title}"</h4>
              <p className="note-preview-content">
                {noteToDelete?.content?.length > 100
                  ? `${noteToDelete.content.substring(0, 100)}...`
                  : noteToDelete?.content}
              </p>
            </div>
          </div>
          <div className="modal-actions">
            <button onClick={() => setShowDeleteConfirmation(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={confirmDelete} className="btn btn-danger">
              Delete Permanently
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">
          <span className="title-icon">Notes</span>
          Notes App
        </h1>
        <p className="app-subtitle">Your ideas, forever on Cardano Testnet</p>

        <div className="wallet-section">
          {!walletConnected ? (
            <button
              onClick={connectWallet}
              disabled={connecting || !lucid}
              className="btn btn-primary wallet-btn"
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          ) : (
            <div className="connected-info">
              <span className="connected-text">Connected</span>
              <code className="address">
                {walletAddr.slice(0, 10)}...{walletAddr.slice(-6)}
              </code>
            </div>
          )}
          {txStatus && <div className="tx-status">{txStatus}</div>}
        </div>
      </header>

      <main className="main-content">
        <section className="form-section">
          <h2 className="form-title">
            {editingNote ? 'Edit Note' : 'Create New Note'}
          </h2>
          <form className="note-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <label>Title</label>
            </div>

            <div className="form-group">
              <textarea
                placeholder="Write your note..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="6"
                required
              />
              <label>Content</label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingNote ? "Update Note" : "Create Note"}
              </button>
              {editingNote && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingNote(null)
                    setTitle("")
                    setContent("")
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="notes-section">
          {!walletConnected ? (
            <div className="empty-state">
              <div className="empty-icon">Connect Wallet</div>
              <h3>Please connect your wallet</h3>
              <p>To view and manage your personal notes</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">No notes</div>
              <h3>No notes yet</h3>
              <p>Create your first note above!</p>
            </div>
          ) : (
            <div className="notes-grid">
              {notes.map((note) => (
                <article key={note.id} className="note-card">
                  <div className="note-header">
                    <h3 className="note-title">{note.title}</h3>
                    <div className="note-actions">
                      <button onClick={() => handleEdit(note)} className="action-btn action-edit">
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setNoteToDelete(note)
                          setShowDeleteConfirmation(true)
                        }}
                        className="action-btn action-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="note-content">
                    <p>{note.content}</p>
                  </div>
                  <footer className="note-footer">
                    <small>
                      {new Date(note.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </small>
                  </footer>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default NoteApp