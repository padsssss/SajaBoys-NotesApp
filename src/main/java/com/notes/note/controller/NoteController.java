package com.notes.note.controller;

import com.notes.note.entity.Note;
import com.notes.note.entity.NoteStatus;
import com.notes.note.repository.NoteRepository;
import com.notes.note.entity.NoteTx;
import com.notes.note.entity.NoteAction;
import com.notes.note.repository.NoteTxRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDateTime;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteRepository noteRepository;
    private final NoteTxRepository noteTxRepository;

    public NoteController(NoteRepository noteRepository, NoteTxRepository noteTxRepository) {
        this.noteRepository = noteRepository;
        this.noteTxRepository = noteTxRepository;
    }

    @GetMapping
    public List<Note> getAllNotes(@RequestParam(required = false) String owner) {
        if (owner != null && !owner.isEmpty()) {
            return noteRepository.findByOwner(owner);
        }
        return noteRepository.findAll();
    }

    @PostMapping
    public Note createNote(@RequestBody Note note) {
        if (note.getStatus() == null) {
            note.setStatus(NoteStatus.PENDING);
        }
        if (note.getCreatedAt() == null) {
            note.setCreatedAt(LocalDateTime.now());
        }
        Note saved = noteRepository.save(note);
        if (saved.getTxHash() != null && !saved.getTxHash().isEmpty()) {
            NoteTx tx = new NoteTx();
            tx.setNoteId(saved.getId());
            tx.setOwner(saved.getOwner());
            tx.setAction(NoteAction.CREATE);
            tx.setTxHash(saved.getTxHash());
            tx.setStatus(NoteStatus.PENDING);
            tx.setCreatedAt(LocalDateTime.now());
            tx.setTitle(saved.getTitle());
            tx.setContent(saved.getContent());
            noteTxRepository.save(tx);
        }
        return saved;
    }

    @PutMapping("/{id}")
    public Note updateNote(@PathVariable Long id, @RequestBody Note noteDetails) {
        Note note = noteRepository.findById(id).orElseThrow();

        boolean businessChanged = false;
        if (noteDetails.getTitle() != null && !noteDetails.getTitle().equals(note.getTitle())) {
            note.setTitle(noteDetails.getTitle());
            businessChanged = true;
        }
        if (noteDetails.getContent() != null && !noteDetails.getContent().equals(note.getContent())) {
            note.setContent(noteDetails.getContent());
            businessChanged = true;
        }
        if (noteDetails.getStatus() != null && noteDetails.getStatus() != note.getStatus()) {
            note.setStatus(noteDetails.getStatus());
            businessChanged = true;
        }

        boolean hasTx = noteDetails.getTxHash() != null && !noteDetails.getTxHash().isEmpty();
        if (hasTx) {
            note.setTxHash(noteDetails.getTxHash());
        }

        Note saved = noteRepository.save(note);

        // Logging strategy:
        // - If business fields changed but no txHash yet: create a placeholder UPDATE log (txHash null)
        // - If txHash arrives later: fill into the latest placeholder log; if none exists, create a new UPDATE log
        if (businessChanged && !hasTx) {
            NoteTx tx = new NoteTx();
            tx.setNoteId(saved.getId());
            tx.setOwner(saved.getOwner());
            tx.setAction(NoteAction.UPDATE);
            tx.setStatus(NoteStatus.CONFIRMED);
            tx.setCreatedAt(LocalDateTime.now());
            tx.setTitle(saved.getTitle());
            tx.setContent(saved.getContent());
            noteTxRepository.save(tx);
        } else if (hasTx) {
            java.util.List<NoteTx> placeholders =
                noteTxRepository.findByNoteIdAndActionAndTxHashIsNull(saved.getId(), NoteAction.UPDATE);
            if (placeholders != null && !placeholders.isEmpty()) {
                for (NoteTx p : placeholders) {
                    p.setTxHash(saved.getTxHash());
                    p.setStatus(NoteStatus.CONFIRMED);
                    noteTxRepository.save(p);
                }
            } else {
                NoteTx tx = new NoteTx();
                tx.setNoteId(saved.getId());
                tx.setOwner(saved.getOwner());
                tx.setAction(NoteAction.UPDATE);
                tx.setTxHash(saved.getTxHash());
                tx.setStatus(NoteStatus.CONFIRMED);
                tx.setCreatedAt(LocalDateTime.now());
                tx.setTitle(saved.getTitle());
                tx.setContent(saved.getContent());
                noteTxRepository.save(tx);
            }
        }
        return saved;
    }

    @DeleteMapping("/{id}")
    public void deleteNote(@PathVariable Long id) {
        noteRepository.deleteById(id);
    }
}