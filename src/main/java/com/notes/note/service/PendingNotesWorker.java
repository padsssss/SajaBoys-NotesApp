package com.notes.note.service;

import com.notes.note.entity.Note;
import com.notes.note.entity.NoteStatus;
import com.notes.note.repository.NoteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PendingNotesWorker {

    private static final Logger log = LoggerFactory.getLogger(PendingNotesWorker.class);

    private final NoteRepository noteRepository;
    private final BlockfrostService blockfrostService;

    public PendingNotesWorker(NoteRepository noteRepository, BlockfrostService blockfrostService) {
        this.noteRepository = noteRepository;
        this.blockfrostService = blockfrostService;
    }

    // Run every 20 seconds
    @Scheduled(fixedDelay = 20000)
    public void checkPending() {
        List<Note> pending = noteRepository.findByStatus(NoteStatus.PENDING);
        if (pending.isEmpty()) return;
        for (Note n : pending) {
            try {
                boolean confirmed = blockfrostService.isTxConfirmed(n.getTxHash());
                if (confirmed) {
                    n.setStatus(NoteStatus.CONFIRMED);
                    noteRepository.save(n);
                }
            } catch (Exception e) {
                log.warn("Failed to check tx {}: {}", n.getTxHash(), e.getMessage());
            }
        }
    }
}

