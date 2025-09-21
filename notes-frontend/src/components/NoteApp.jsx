import { useState, useEffect } from 'react';
import axios from 'axios';

function NoteApp() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await axios.get('/api/notes'); // Use relative URL
      console.log('Response:', response.data);
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error.message, error.config, error.response);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return;

    const note = { title, content };

    try {
      if (editingNote) {
        await axios.put(`/api/notes/${editingNote.id}`, note); // Use relative URL
        setEditingNote(null);
      } else {
        await axios.post('/api/notes', note); // Use relative URL
      }
      setTitle('');
      setContent('');
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error.message, error.config, error.response);
    }
  };

  return (
    <div className="container">
      <h1>Notes App</h1>
      <div className="form-container">
        <h2>{editingNote ? 'Edit Note' : 'Create Note'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div>
            <button
              type="submit"
              className={editingNote ? 'update-btn' : 'create-btn'}
            >
              {editingNote ? 'Update' : 'Create'}
            </button>
            {editingNote && (
              <button
                type="button"
                onClick={() => {
                  setEditingNote(null);
                  setTitle('');
                  setContent('');
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      <div>
        {notes.length === 0 ? (
          <p className="no-notes">No notes available</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="note">
              <div className="note-content">
                <h3>{note.title}</h3>
                <p>{note.content}</p>
                <small>
                  Created: {new Date(note.createdAt).toLocaleString()}
                </small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NoteApp;