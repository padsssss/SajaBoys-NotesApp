"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import './noteapp.css' // Import the CSS file

function NoteApp() {
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [editingNote, setEditingNote] = useState(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState(null)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await axios.get("/api/notes")
      console.log("Response:", response.data)
      const notesData = Array.isArray(response.data) ? response.data : []
      setNotes(notesData)
    } catch (error) {
      console.error("Error fetching notes:", error.message, error.config, error.response)
      setNotes([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !content) return

    const note = { title, content }

    try {
      if (editingNote) {
        await axios.put(`/api/notes/${editingNote.id}`, note)
        setEditingNote(null)
      } else {
        await axios.post("/api/notes", note)
      }
      setTitle("")
      setContent("")
      fetchNotes()
    } catch (error) {
      console.error("Error saving note:", error.message, error.config, error.response)
    }
  }

  const handleDeleteClick = (note) => {
    setNoteToDelete(note)
    setShowDeleteConfirmation(true)
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/notes/${id}`)
      fetchNotes()
    } catch (error) {
      console.error("Error deleting note:", error.message, error.config, error.response)
    }
  }

  const handleEdit = (note) => {
    setEditingNote(note)
    setTitle(note.title)
    setContent(note.content)
  }

  const confirmDelete = async () => {
    await handleDelete(noteToDelete.id)
    setShowDeleteConfirmation(false)
    setNoteToDelete(null)
  }

  const cancelDelete = () => {
    setShowDeleteConfirmation(false)
    setNoteToDelete(null)
  }

  if (showDeleteConfirmation) {
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <div className="modal-icon">⚠️</div>
            <h2>Delete Note</h2>
          </div>
          <div className="modal-body">
            <p>Are you sure you want to permanently delete this note?</p>
            <div className="note-preview">
              <h4>{`"${noteToDelete?.title}"`}</h4>
              <p className="note-preview-content">
                {noteToDelete?.content?.length > 100 
                  ? `${noteToDelete.content.substring(0, 100)}...` 
                  : noteToDelete?.content}
              </p>
              <small className="note-preview-date">
                Created: {new Date(noteToDelete?.createdAt).toLocaleString()}
              </small>
            </div>
          </div>
          <div className="modal-actions">
            <button onClick={cancelDelete} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={confirmDelete} className="btn btn-danger">
              Delete Note
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
          <span className="title-icon">📝</span>
          Notes App
        </h1>
        <p className="app-subtitle">Capture your ideas with elegance</p>
      </header>

      <main className="main-content">
        <section className="form-section">
          <div className="form-header">
            <h2 className="form-title">
              {editingNote ? '✏️ Edit Note' : '📝 Create New Note'}
            </h2>
          </div>
          <form className="note-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter note title..." 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <label className="form-label">Title</label>
            </div>
            
            <div className="form-group">
              <textarea 
                className="form-textarea" 
                placeholder="Your thoughts..." 
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                rows="4"
                required
              />
              <label className="form-label">Content</label>
            </div>
            
            <div className="form-actions">
              <button type="submit" className={`btn btn-primary ${editingNote ? 'btn-warning' : ''}`}>
                {editingNote ? 'Update Note' : 'Create Note'}
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
          {(!Array.isArray(notes) || notes.length === 0) ? (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <h3 className="empty-title">No notes yet</h3>
              <p className="empty-description">Start creating your first note above</p>
            </div>
          ) : (
            <div className="notes-grid">
              {notes.map((note) => (
                <article key={note.id} className="note-card">
                  <div className="note-header">
                    <div>
                      <h3 className="note-title">{note.title}</h3>
                    </div>
                    <div className="note-actions">
                      <button
                        onClick={() => handleEdit(note)}
                        className="action-btn action-edit"
                        aria-label="Edit note"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(note)} 
                        className="action-btn action-delete"
                        aria-label="Delete note"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="note-content">
                    <p className="note-text">{note.content}</p>
                  </div>
                  
                  <footer className="note-footer">
                    <time className="note-date" dateTime={note.createdAt}>
                      {new Date(note.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </time>
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