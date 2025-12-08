package com.notes.note.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class NoteTx {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long noteId; // may refer to a deleted note
    private String owner;

    @Enumerated(EnumType.STRING)
    private NoteAction action;

    private String txHash;

    @Enumerated(EnumType.STRING)
    private NoteStatus status;

    // Snapshots for auditing/display
    private String title;
    @Column(name = "note_content")
    private String content;

    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getNoteId() { return noteId; }
    public void setNoteId(Long noteId) { this.noteId = noteId; }
    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }
    public NoteAction getAction() { return action; }
    public void setAction(NoteAction action) { this.action = action; }
    public String getTxHash() { return txHash; }
    public void setTxHash(String txHash) { this.txHash = txHash; }
    public NoteStatus getStatus() { return status; }
    public void setStatus(NoteStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}


