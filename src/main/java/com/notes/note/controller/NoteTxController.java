package com.notes.note.controller;

import com.notes.note.entity.NoteAction;
import com.notes.note.entity.NoteStatus;
import com.notes.note.entity.NoteTx;
import com.notes.note.repository.NoteTxRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RestController
@RequestMapping("/api/note-txs")
public class NoteTxController {

    private final NoteTxRepository noteTxRepository;

    public NoteTxController(NoteTxRepository noteTxRepository) {
        this.noteTxRepository = noteTxRepository;
    }

    @GetMapping
    public List<NoteTx> list(@RequestParam(required = false) String owner) {
        if (owner != null && !owner.isEmpty()) {
            return noteTxRepository.findByOwner(owner);
        }
        return noteTxRepository.findAll();
    }

    @PostMapping
    public NoteTx create(@RequestBody NoteTx tx) {
        if (tx.getAction() == null) {
            tx.setAction(NoteAction.CREATE);
        }
        // Default to PENDING for all actions; worker will flip to CONFIRMED when Blockfrost confirms
        if (tx.getStatus() == null) {
            tx.setStatus(NoteStatus.PENDING);
        }
        if (tx.getCreatedAt() == null) {
            tx.setCreatedAt(LocalDateTime.now());
        }
        return noteTxRepository.save(tx);
    }
}


