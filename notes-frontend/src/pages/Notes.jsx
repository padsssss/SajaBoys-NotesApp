import { useState, useEffect } from "react"
import axios from "axios"
import { useWallet } from "../context/WalletContext"
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Chip,
  Grid,
  Paper,
  Stack,
} from "@mui/material"
import {
  Wallet as WalletIcon,
  Note as NoteIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material"

function Notes() {
  const { walletAddr, walletConnected, connecting, connectWallet, txStatus, setTxStatus, sendTransaction } = useWallet()

  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [recipientAddr, setRecipientAddr] = useState("")
  const [editingNote, setEditingNote] = useState(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState(null)

  const DEFAULT_RECIPIENT = "addr_test1..." // fallback recipient
  const FIXED_LOVELACE = 1000000n

  useEffect(() => {
    fetchNotes()
  }, [walletConnected, walletAddr])

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

  // Send transaction using context
  const handleSendTransaction = async (recipient) => {
    return await sendTransaction(recipient, DEFAULT_RECIPIENT, FIXED_LOVELACE)
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
        await handleSendTransaction(recipientAddr)
        setEditingNote(null)
      } else {
        const res = await axios.post("/api/notes", notePayload)
        await handleSendTransaction(recipientAddr)
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
      await handleSendTransaction(recipientAddr)
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
          <NoteIcon 
            sx={{ 
              fontSize: 50, 
              color: "primary.main",
              filter: 'drop-shadow(0 0 20px rgba(0, 240, 255, 0.8))',
              animation: 'float 3s ease-in-out infinite',
            }} 
          />
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: "bold",
              fontFamily: '"Orbitron", monospace',
              background: 'linear-gradient(135deg, #00f0ff 0%, #ff00ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 30px rgba(0, 240, 255, 0.5)',
            }}
          >
            MY NOTES
          </Typography>
        </Stack>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ 
            mb: 3,
            fontFamily: '"Rajdhani", sans-serif',
            letterSpacing: '0.05em',
          }}
        >
          Manage your notes on the Cardano blockchain
        </Typography>

        {/* Wallet Section */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mb: 4 }}>
          {!walletConnected ? (
              <Button
                variant="contained"
                size="large"
                startIcon={<WalletIcon />}
                onClick={connectWallet}
                disabled={connecting}
                sx={{ minWidth: 200 }}
              >
                {connecting ? "Connecting..." : "Connect Wallet"}
              </Button>
          ) : (
            <Chip
              icon={<CheckCircleIcon />}
              label={`Connected: ${walletAddr.slice(0,10)}...${walletAddr.slice(-6)}`}
              sx={{ 
                fontSize: "0.9rem", 
                py: 2.5,
                bgcolor: 'rgba(0, 255, 136, 0.1)',
                color: 'success.main',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)',
                fontFamily: '"Orbitron", monospace',
                fontWeight: 600,
              }}
            />
          )}
          {txStatus && (
            <Alert severity={txStatus.includes("failed") ? "error" : "info"} sx={{ width: "100%", maxWidth: 600 }}>
              {txStatus}
            </Alert>
          )}
        </Box>
      </Box>

      {/* Main Content */}
      <Stack spacing={4}>
        {/* Form Section */}
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom 
            sx={{ 
              mb: 3, 
              fontWeight: 600,
              fontFamily: '"Orbitron", monospace',
              color: 'primary.main',
              textShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
            }}
          >
            {editingNote ? "EDIT NOTE" : "CREATE NEW NOTE"}
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Title"
                variant="outlined"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <TextField
                label="Write your note..."
                variant="outlined"
                fullWidth
                multiline
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              <TextField
                label="Recipient address (optional)"
                variant="outlined"
                fullWidth
                value={recipientAddr}
                onChange={(e) => setRecipientAddr(e.target.value)}
                helperText="Optional: Address to send transaction to when saving note"
              />
              <Stack direction="row" spacing={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ flex: 1 }}
                >
                  {editingNote ? "Update Note" : "Create Note"}
                </Button>
                {editingNote && (
                  <Button
                    type="button"
                    variant="outlined"
                    color="secondary"
                    size="large"
                    onClick={() => {
                      setEditingNote(null)
                      setTitle("")
                      setContent("")
                      setRecipientAddr("")
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </Stack>
            </Stack>
          </Box>
        </Paper>

        {/* Notes Section */}
        <Box>
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom 
            sx={{ 
              mb: 3, 
              fontWeight: 600,
              fontFamily: '"Orbitron", monospace',
              color: 'primary.main',
              textShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
            }}
          >
            YOUR NOTES ({notes.length})
          </Typography>
          {!walletConnected ? (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <WalletIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Connect Your Wallet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Please connect your wallet to see and manage your notes
              </Typography>
              <Button
                variant="contained"
                startIcon={<WalletIcon />}
                onClick={connectWallet}
                disabled={connecting}
              >
                {connecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            </Paper>
          ) : notes.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <NoteIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Notes Yet
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create your first note using the form above
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {notes.map((note) => (
                <Grid item xs={12} sm={6} md={4} key={note.id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "all 0.3s ease",
                      position: "relative",
                      overflow: "hidden",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: "-100%",
                        width: "100%",
                        height: "100%",
                        background: "linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.1), transparent)",
                        transition: "left 0.5s ease",
                      },
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 0 40px rgba(0, 240, 255, 0.4)",
                        borderColor: "primary.main",
                        "&::before": {
                          left: "100%",
                        },
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                        {note.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {note.content}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(note)}
                        color="warning"
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => {
                          setNoteToDelete(note)
                          setShowDeleteConfirmation(true)
                        }}
                        color="error"
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Stack>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "white" }}>
          Delete Note
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText>
            Are you sure you want to delete this note? This action cannot be undone.
          </DialogContentText>
          {noteToDelete && (
            <Paper sx={{ p: 2, mt: 2, bgcolor: "grey.100" }}>
              <Typography variant="h6" gutterBottom>
                "{noteToDelete.title}"
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {noteToDelete.content?.substring(0, 100)}
                {noteToDelete.content?.length > 100 && "..."}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowDeleteConfirmation(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" startIcon={<DeleteIcon />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default Notes

