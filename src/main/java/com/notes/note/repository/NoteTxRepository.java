package com.notes.note.repository;

import com.notes.note.entity.NoteTx;
import com.notes.note.entity.NoteStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteTxRepository extends JpaRepository<NoteTx, Long> {
    List<NoteTx> findByOwner(String owner);
    List<NoteTx> findByStatus(NoteStatus status);

    NoteTx findTop1ByNoteIdAndActionAndTxHashIsNullOrderByIdDesc(Long noteId, com.notes.note.entity.NoteAction action);
    java.util.List<NoteTx> findByNoteIdAndActionAndTxHashIsNull(Long noteId, com.notes.note.entity.NoteAction action);
}


