package com.notes.note.service;

import com.notes.note.entity.Note;
import com.notes.note.entity.NoteStatus;
import com.notes.note.repository.NoteRepository;
import com.notes.note.entity.NoteTx;
import com.notes.note.repository.NoteTxRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class BlockfrostSyncService {

    private final NoteRepository noteRepository;
    private final NoteTxRepository noteTxRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${blockfrost.api.base:https://cardano-preview.blockfrost.io/api/v0}")
    private String apiBaseUrl;

    @Value("${blockfrost.project.id:}")
    private String projectId;

    public BlockfrostSyncService(NoteRepository noteRepository, NoteTxRepository noteTxRepository) {
        this.noteRepository = noteRepository;
        this.noteTxRepository = noteTxRepository;
    }

    @Scheduled(fixedDelay = 20000)
    public void syncPendingNotes() {
        if (projectId == null || projectId.isBlank()) {
            // Skip syncing if no Blockfrost Project ID is configured
            return;
        }
        List<Note> pending = noteRepository.findByStatus(NoteStatus.PENDING);
        if (pending.isEmpty()) return;

        HttpHeaders headers = new HttpHeaders();
        headers.add("project_id", projectId);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        for (Note note : pending) {
            String txHash = note.getTxHash();
            if (txHash == null || txHash.isBlank()) continue;
            String url = String.format("%s/txs/%s", apiBaseUrl, txHash);
            try {
                ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
                if (response.getStatusCode().is2xxSuccessful()) {
                    note.setStatus(NoteStatus.CONFIRMED);
                    noteRepository.save(note);
                }
            } catch (RestClientException ex) {
                // If 404 or network errors, ignore and try again on next cycle
            }
        }

        // Also confirm NoteTx logs
        List<NoteTx> pendingLogs = noteTxRepository.findByStatus(NoteStatus.PENDING);
        for (NoteTx tx : pendingLogs) {
            String txHash = tx.getTxHash();
            if (txHash == null || txHash.isBlank()) continue;
            String url = String.format("%s/txs/%s", apiBaseUrl, txHash);
            try {
                ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
                if (response.getStatusCode().is2xxSuccessful()) {
                    tx.setStatus(NoteStatus.CONFIRMED);
                    noteTxRepository.save(tx);
                }
            } catch (RestClientException ex) {
                // ignore
            }
        }
    }
}


