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
  const [recipientAddr, setRecipientAddr] = useState("")
  const [editingNote, setEditingNote] = useState(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState(null)
  const [txStatus, setTxStatus] = useState("")

  const DEFAULT_RECIPIENT = "addr_test1..." // fallback recipient
  const FIXED_LOVELACE = 1000000n

  // Initialize Lucid
  useEffect(() => {
    const initLucid = async () => {
      try {
        const lucidInstance = await Lucid.new(
          new Blockfrost(
            "https://cardano-preview.blockfrost.io/api/v0",
            "previewa6B1zxRtfxmIUpzmtf0JMv8dV0NUUgLS" // replace with your Project ID
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

  // Connect wallet
  const connectWallet = async () => {
    if (!lucid) {
      alert("Lucid not ready yet. Please wait...")
      return
    }
    setConnecting(true)
    try {
      if (!window.cardano) {
        alert("No Cardano wallet found")
        return
      }
      const walletPriority = ["lace", "nami", "eternl", "flint"]
      const selected = walletPriority.find(w => window.cardano[w])
      if (!selected) {
        alert("No supported wallet found.")
        return
      }

      const walletApi = await window.cardano[selected].enable()
      lucid.selectWallet(walletApi)
      const address = await lucid.wallet.address()

      setWalletAddr(address)
      setWalletConnected(true)
      setTxStatus("Wallet connected!")
      console.log("Wallet connected:", address)
    } catch (err) {
      console.error("Wallet connect error:", err)
      alert("Wallet connection failed")
    } finally {
      setConnecting(false)
    }
  }

  const fetchNotes = async () => {
    if (!walletConnected) {
      setNotes([])
      return
    }
    try {
      const response = await axios.get(`/api/notes?owner=${walletAddr}`)
      const notesData = Array.isArray(response.data) ? response.data : []
      setNotes(notesData)
    } catch (err) {
      console.error("Error fetching notes:", err)
      setNotes([])
    }
  }

  // Send transaction
  const sendTransaction = async (recipient) => {
    if (!lucid || !walletConnected) {
      setTxStatus("Wallet not connected")
      return null
    }
    setTxStatus("Building transaction...")
    try {
      const tx = await lucid.newTx()
        .payToAddress(recipient || DEFAULT_RECIPIENT, { lovelace: FIXED_LOVELACE })
        .complete()

      setTxStatus("Please sign the transaction in your wallet...")
      const signedTx = await tx.sign().complete()
      const txHash = await signedTx.submit()
      setTxStatus(`Transaction sent! Tx: ${txHash.slice(0,16)}...`)
      console.log("Transaction successful:", `https://preview.cardanoscan.io/transaction/${txHash}`)
      return txHash
    } catch (err) {
      console.error("Transaction failed:", err)
      setTxStatus("Transaction failed")
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
        await sendTransaction(recipientAddr)
        setEditingNote(null)
      } else {
        const res = await axios.post("/api/notes", notePayload)
        await sendTransaction(recipientAddr)
      }
      setTitle("")
      setContent("")
      setRecipientAddr("")
      fetchNotes()
    } catch (err) {
      console.error("Save failed:", err)
      alert("Failed to save note")
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/notes/${id}`)
      await sendTransaction(recipientAddr)
      fetchNotes()
    } catch (err) {
      console.error("Delete failed:", err)
      alert("Failed to delete note")
    }
  }

  const handleEdit = (note) => {
    if (note.owner !== walletAddr) {
      alert("You can only edit your own notes")
      return
    }
    setEditingNote(note)
    setTitle(note.title)
    setContent(note.content)
    window.scrollTo(0,0)
  }

  const confirmDelete = async () => {
    if (!noteToDelete) return
    await handleDelete(noteToDelete.id)
    setShowDeleteConfirmation(false)
    setNoteToDelete(null)
  }

  // Delete modal
  if (showDeleteConfirmation) {
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <h2>Delete Note</h2>
          </div>
          <div className="modal-body">
            <p>Are you sure you want to delete this note?</p>
            <div className="note-preview">
              <h4>"{noteToDelete?.title}"</h4>
              <p>{noteToDelete?.content?.substring(0, 100)}</p>
            </div>
          </div>
          <div className="modal-actions">
            <button onClick={() => setShowDeleteConfirmation(false)} className="btn btn-secondary">Cancel</button>
            <button onClick={confirmDelete} className="btn btn-danger">Delete</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Notes App</h1>
        <p className="app-subtitle">Your notes, forever on Cardano Testnet</p>

        <div className="wallet-section">
          {!walletConnected ? (
            <button onClick={connectWallet} disabled={connecting || !lucid} className="btn btn-primary">
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          ) : (
            <div className="connected-info">
              <span>Connected</span>
              <code>{walletAddr.slice(0,10)}...{walletAddr.slice(-6)}</code>
            </div>
          )}
          {txStatus && <div className="tx-status">{txStatus}</div>}
        </div>
      </header>

      <main className="main-content">
        <section className="form-section">
          <h2>{editingNote ? "Edit Note" : "Create New Note"}</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Title..." value={title} onChange={e => setTitle(e.target.value)} required/>
            <textarea placeholder="Write your note..." value={content} onChange={e => setContent(e.target.value)} rows="6" required/>
            <input type="text" placeholder="Recipient address (optional)" value={recipientAddr} onChange={e => setRecipientAddr(e.target.value)} />
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">{editingNote ? "Update" : "Create"}</button>
              {editingNote && <button type="button" onClick={() => {setEditingNote(null); setTitle(""); setContent(""); setRecipientAddr("")}} className="btn btn-secondary">Cancel</button>}
            </div>
          </form>
        </section>

        <section className="notes-section">
          {!walletConnected ? (
            <p>Please connect your wallet to see your notes</p>
          ) : notes.length === 0 ? (
            <p>No notes yet</p>
          ) : (
            <div className="notes-grid">
              {notes.map(note => (
                <div key={note.id} className="note-card">
                  <h3>{note.title}</h3>
                  <p>{note.content}</p>
                  <div className="note-actions">
                    <button onClick={() => handleEdit(note)}>Edit</button>
                    <button onClick={() => {setNoteToDelete(note); setShowDeleteConfirmation(true)}}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default NoteApp
