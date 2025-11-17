import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useWallet } from "../context/WalletContext"
import {
  Container,
  Box,
  Typography,
  TextField,
  Chip,
  Stack,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material"
import { Favorite, FavoriteBorder, PushPin, Archive, Edit, Delete, Note as NoteIcon, Wallet as WalletIcon, CheckCircle as CheckCircleIcon, MoreVert } from "@mui/icons-material"

function NotesGallery() {
  const { walletAddr, walletConnected, connecting, connectWallet, sendTransaction, txStatus } = useWallet()
  const navigate = useNavigate()
  const [notes, setNotes] = useState([])
  const [meta, setMeta] = useState({})
  const [query, setQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState("")
  const [folder, setFolder] = useState("")
  const [view, setView] = useState("grid")
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [menuNote, setMenuNote] = useState(null)

  // Editor state
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [recipientAddr, setRecipientAddr] = useState("")
  const [lovelaceAmount, setLovelaceAmount] = useState("1000000")
  const [selectedColor, setSelectedColor] = useState("")
  const [tagsInput, setTagsInput] = useState("")
  const [tags, setTags] = useState([])
  const [saving, setSaving] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMsg, setSnackbarMsg] = useState("")
  const [snackbarSeverity, setSnackbarSeverity] = useState("info")
  const [lovelaceError, setLovelaceError] = useState(false)

  const MIN_LOVELACE = 1000000

  const CARD_COLORS = [
    "#FFCDD2", "#F8BBD0", "#E1BEE7", "#D1C4E9", "#C5CAE9",
    "#BBDEFB", "#B2EBF2", "#C8E6C9", "#DCEDC8", "#FFF9C4",
    "#FFE0B2", "#FFCCBC"
  ]

  // Load meta from localStorage
  const metaKey = walletAddr ? `notes-meta:${walletAddr}` : null
  useEffect(() => {
    if (!walletConnected) return
    try {
      const raw = metaKey && localStorage.getItem(metaKey)
      if (raw) setMeta(JSON.parse(raw))
    } catch {}
  }, [walletConnected, metaKey])

  useEffect(() => {
    if (!walletConnected) return
    try {
      metaKey && localStorage.setItem(metaKey, JSON.stringify(meta))
    } catch {}
  }, [meta, walletConnected, metaKey])

  // Load notes from backend
  useEffect(() => {
    const load = async () => {
      if (!walletConnected) {
        setNotes([])
        return
      }
      try {
        const res = await axios.get(`/api/notes?owner=${walletAddr}`)
        setNotes(Array.isArray(res.data) ? res.data : [])
      } catch {
        setNotes([])
      }
    }
    load()
  }, [walletAddr, walletConnected])

  const allTags = useMemo(() => {
    const s = new Set()
    Object.values(meta).forEach((m) => (m?.tags || []).forEach((t) => s.add(t)))
    return Array.from(s)
  }, [meta])

  const allFolders = useMemo(() => {
    const s = new Set()
    Object.values(meta).forEach((m) => m?.folder && s.add(m.folder))
    return Array.from(s)
  }, [meta])

  const filtered = useMemo(() => {
    let list = notes.slice()
    list = list.filter((n) => !meta[n.id]?.archived && !meta[n.id]?.trashed)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
    }
    if (selectedTag) {
      list = list.filter((n) => (meta[n.id]?.tags || []).includes(selectedTag))
    }
    if (folder) {
      list = list.filter((n) => (meta[n.id]?.folder || "") === folder)
    }
    list.sort((a, b) => {
      const ma = meta[a.id] || {}
      const mb = meta[b.id] || {}
      if (ma.pinned && !mb.pinned) return -1
      if (!ma.pinned && mb.pinned) return 1
      if (ma.favorite && !mb.favorite) return -1
      if (!ma.favorite && mb.favorite) return 1
      const ta = new Date(a.createdAt || 0).getTime()
      const tb = new Date(b.createdAt || 0).getTime()
      return tb - ta
    })
    return list
  }, [notes, meta, query, selectedTag, folder])

  const toggleFlag = (id, key) => {
    setMeta((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), [key]: !(prev[id]?.[key]) } }))
  }

  const handleOpenCreate = () => {
    setEditingNote(null)
    setTitle("")
    setContent("")
    setRecipientAddr("")
    setSelectedColor("")
    setTags([])
    setTagsInput("")
    setLovelaceAmount(MIN_LOVELACE.toString())
    setEditorOpen(true)
  }

  const handleOpenEdit = (note) => {
    const m = meta[note.id] || {}
    setEditingNote(note)
    setTitle(note.title || "")
    setContent(note.content || "")
    setRecipientAddr("")
    setSelectedColor(m.color || "")
    setTags(m.tags || [])
    setTagsInput("")
    setLovelaceAmount(MIN_LOVELACE.toString())
    setEditorOpen(true)
  }

  const handleCloseEditor = () => {
    setEditorOpen(false)
  }

  const handleSendTransaction = async (recipient) => {
    const amount = BigInt(lovelaceAmount || "0")
    if (amount < BigInt(MIN_LOVELACE)) {
      showSnackbar(`Lovelace amount must be at least ${MIN_LOVELACE}`, 'error')
      return null
    }
    const txHash = await sendTransaction(recipient, amount)
    if (txHash) setLovelaceAmount(MIN_LOVELACE.toString())
    return txHash
  }

  const showSnackbar = (message, severity = "info") => {
    setSnackbarMsg(message)
    setSnackbarSeverity(severity)
    setSnackbarOpen(true)
  }

  const handleSnackbarClose = (_, reason) => {
    if (reason === 'clickaway') return
    setSnackbarOpen(false)
  }

  const handleSaveNote = async () => {
    if (!walletConnected) {
      showSnackbar("Please connect your wallet first!", 'warning')
      return
    }
    if (!title.trim() || !content.trim()) return
    if (BigInt(lovelaceAmount) < BigInt(MIN_LOVELACE)) {
      showSnackbar(`Lovelace amount must be at least ${MIN_LOVELACE}`, 'error')
      return
    }

    const payload = { title: title.trim(), content: content.trim(), owner: walletAddr, color: selectedColor }
    setSaving(true)

    try {
      if (editingNote) {
        await axios.put(`/api/notes/${editingNote.id}`, payload)
        const txHash = await handleSendTransaction(recipientAddr)
        if (!txHash) {
          showSnackbar(`Transaction failed: ${txStatus || 'unknown error'}`, 'error')
          return
        }
        setMeta((prev) => {
          const next = {
            ...prev,
            [editingNote.id]: {
              ...(prev[editingNote.id] || {}),
              color: selectedColor || (prev[editingNote.id] && prev[editingNote.id].color) || "",
              tags: tags,
            }
          }
          try { metaKey && localStorage.setItem(metaKey, JSON.stringify(next)) } catch {}
          return next
        })
      } else {
        const res = await axios.post("/api/notes", payload)
        const created = res?.data
        const txHash = await handleSendTransaction(recipientAddr)
        if (!txHash) {
          if (created?.id) {
            try { await axios.delete(`/api/notes/${created.id}`) } catch {}
          }
          showSnackbar(`Transaction failed: ${txStatus || 'unknown error'}`, 'error')
          return
        }
        if (created?.id) {
          setNotes((prev) => [created, ...prev])
          setMeta((prev) => {
            const next = {
              ...prev,
              [created.id]: {
                color: selectedColor || "",
                createdLovelace: lovelaceAmount || "0",
                tags: tags,
                txHash: txHash || null,
              }
            }
            try { metaKey && localStorage.setItem(metaKey, JSON.stringify(next)) } catch {}
            return next
          })
        }
      }
      setEditorOpen(false)
    } catch (err) {
      console.error("Save failed:", err)
      const serverMsg = err?.response?.data || err?.response?.data?.message || err?.message || 'Unknown error'
      showSnackbar(`Save failed: ${typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg)}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Menu actions
  const handleOpenMenu = (event, note) => { setMenuAnchor(event.currentTarget); setMenuNote(note) }
  const handleCloseMenu = () => { setMenuAnchor(null); setMenuNote(null) }
  const handlePin = () => { if(menuNote) { toggleFlag(menuNote.id, "pinned"); handleCloseMenu() } }
  const handleArchive = () => { if(menuNote) { toggleFlag(menuNote.id, "archived"); handleCloseMenu() } }
  const handleEdit = () => { if(menuNote) { handleOpenEdit(menuNote); handleCloseMenu() } }
  const handleDelete = async () => { 
    if(!menuNote) return
    try { await axios.delete(`/api/notes/${menuNote.id}`); setNotes(prev => prev.filter(n => n.id !== menuNote.id)) } catch {}
    handleCloseMenu() 
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
            textShadow: '0 0 30px rgba(0, 240, 255, 0.5)',
          }}
        >
          MY NOTES
        </Typography>
      </Stack>
      <Typography 
        variant="h6" 
        color="text.secondary" 
        sx={{ mb: 3, fontFamily: '"Rajdhani", sans-serif', letterSpacing: '0.05em' }}
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

    {/* Filters and Controls */}
    <Stack spacing={2} sx={{ mb: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>Your Notes</Typography>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <TextField
          fullWidth
          placeholder="Search by title or content..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button variant="contained" onClick={handleOpenCreate}>Create Note</Button>
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel id="folder-label">Folder</InputLabel>
          <Select labelId="folder-label" label="Folder" value={folder} onChange={(e) => setFolder(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {allFolders.map((f) => (
              <MenuItem key={f} value={f}>{f}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel id="tag-label">Tag</InputLabel>
          <Select labelId="tag-label" label="Tag" value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {allTags.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <ToggleButtonGroup exclusive value={view} onChange={(_, v) => v && setView(v)}>
          <ToggleButton value="grid">Grid</ToggleButton>
          <ToggleButton value="list">List</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    </Stack>

    {/* Notes Display */}
    {view === "grid" ? (
      <Grid container spacing={3}>
        {filtered.map((note) => {
          const m = meta[note.id] || {}
          const color = m.color || undefined
          return (
            <Grid item xs={12} sm={6} md={4} key={note.id}>
              <Card sx={{
                bgcolor: color,
                minHeight: 150,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 0 40px rgba(0, 240, 255, 0.4)' }
              }}>
                <CardContent sx={{ color: color ? '#000' : undefined }}>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }} alignItems="center">
                    {m.pinned && <PushPin fontSize="small" />}
                    {m.favorite && <Favorite fontSize="small" />}
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{note.title}</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ mb: 1 }}>{note.content}</Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    {(m.tags || []).map((t) => <Chip key={t} size="small" label={t} />)}
                    {m.folder && <Chip size="small" label={m.folder} color="primary" variant="outlined" />}
                  </Stack>
                  {m.createdLovelace && (
                    <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mt: 1 }}>
                      Sent: {m.createdLovelace} lovelace
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: "space-between", pt: 0 }}>
                  <IconButton onClick={() => toggleFlag(note.id, "favorite")} color={m.favorite ? "error" : "default"}>
                    {m.favorite ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                  <IconButton onClick={(e) => handleOpenMenu(e, note)}>
                    <MoreVert />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    ) : (
      <Stack spacing={2}>
        {filtered.map((note) => {
          const m = meta[note.id] || {}
          const color = m.color || undefined
          return (
            <Card key={note.id} sx={{ bgcolor: color, minHeight: 80, width: '100%', position: 'relative', overflow: 'hidden' }}>
              <CardContent sx={{ color: color ? '#000' : undefined }}>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }} alignItems="center">
                  {m.pinned && <PushPin fontSize="small" />}
                  {m.favorite && <Favorite fontSize="small" />}
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{note.title}</Typography>
                </Stack>
                <Typography variant="body2" sx={{ mb: 1 }}>{note.content}</Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                  {(m.tags || []).map((t) => <Chip key={t} size="small" label={t} />)}
                  {m.folder && <Chip size="small" label={m.folder} color="primary" variant="outlined" />}
                </Stack>
                {m.createdLovelace && (
                  <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mt: 1 }}>
                    Sent: {m.createdLovelace} lovelace
                  </Typography>
                )}
              </CardContent>
              <CardActions sx={{ justifyContent: "space-between" }}>
                <IconButton onClick={() => toggleFlag(note.id, "favorite")} color={m.favorite ? "error" : "default"}>
                  {m.favorite ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <IconButton onClick={(e) => handleOpenMenu(e, note)}>
                  <MoreVert />
                </IconButton>
              </CardActions>
            </Card>
          )
        })}
      </Stack>
    )}

    {/* Note Menu */}
    <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenu}>
      <MenuItem onClick={handlePin}><ListItemIcon><PushPin fontSize="small" /></ListItemIcon><ListItemText>Pin</ListItemText></MenuItem>
      <MenuItem onClick={handleArchive}><ListItemIcon><Archive fontSize="small" /></ListItemIcon><ListItemText>Archive</ListItemText></MenuItem>
      <MenuItem onClick={handleEdit}><ListItemIcon><Edit fontSize="small" /></ListItemIcon><ListItemText>Edit</ListItemText></MenuItem>
      <MenuItem onClick={handleDelete}><ListItemIcon><Delete fontSize="small" /></ListItemIcon><ListItemText>Delete</ListItemText></MenuItem>
    </Menu>

    {/* Editor Dialog */}
    <Dialog open={editorOpen} onClose={handleCloseEditor} fullWidth maxWidth="md">
      <DialogTitle>{editingNote ? "Edit Note" : "Create Note"}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {!walletConnected && (
          <Stack spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Connect your wallet to create notes.</Typography>
            <Button variant="contained" startIcon={<WalletIcon />} onClick={connectWallet} disabled={connecting}>
              {connecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          </Stack>
        )}
        <Stack spacing={2}>
          <TextField label="Title" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} required />
          <TextField label="Write your note..." fullWidth multiline rows={6} value={content} onChange={(e) => setContent(e.target.value)} required />
          <TextField label="Add tag and press Enter" fullWidth value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} 
            onKeyDown={(e) => { if(e.key==="Enter" && tagsInput.trim()){ e.preventDefault(); if(!tags.includes(tagsInput.trim())) setTags([...tags, tagsInput.trim()]); setTagsInput("") } }}
            helperText={tags.length ? "" : "Example: work, study, personal"}
          />
          {!!tags.length && <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>{tags.map(t => <Chip key={t} label={t} onDelete={() => setTags(tags.filter(x=>x!==t))} />)}</Stack>}
          <TextField label="Recipient address (optional)" fullWidth value={recipientAddr} onChange={(e)=>setRecipientAddr(e.target.value)} />
          <TextField label="Lovelace Amount" fullWidth value={lovelaceAmount} onChange={(e)=>setLovelaceAmount(e.target.value.replace(/\D/, ""))} helperText={`Minimum ${MIN_LOVELACE} Lovelace`} required />
          <Box>
            <Typography variant="subtitle1" sx={{ mb:1, fontWeight:600 }}>Card color (optional)</Typography>
            <Stack direction="row" spacing={1.5} sx={{ flexWrap:'wrap' }}>
              {CARD_COLORS.map(c=>{
                const selected = selectedColor===c
                return (
                  <Box key={c} onClick={()=>setSelectedColor(c)} sx={{ width:32, height:32, borderRadius:'50%', bgcolor:c, border: selected?'3px solid #00f0ff':'2px solid rgba(0,0,0,0.2)', cursor:'pointer', boxShadow: selected?'0 0 12px rgba(0,240,255,0.6)':'none' }} title={c}/>
                )
              })}
              <Button size="small" onClick={()=>setSelectedColor("")}>Clear</Button>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseEditor}>Cancel</Button>
        <Button variant="contained" onClick={handleSaveNote} disabled={!walletConnected || !title.trim() || !content.trim() || saving}>
          {saving ? <CircularProgress size={18} color="inherit" sx={{ mr:1 }} /> : (editingNote ? "Update" : "Create")}
        </Button>
      </DialogActions>
    </Dialog>

    {/* Snackbar */}
    <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
      <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>{snackbarMsg}</Alert>
    </Snackbar>
  </Container>
)
}
export default NotesGallery
