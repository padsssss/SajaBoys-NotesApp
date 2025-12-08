package com.notes.note.repository;

import com.notes.note.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import com.notes.note.entity.NoteStatus;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByOwner(String owner);
    List<Note> findByStatus(NoteStatus status);
}
