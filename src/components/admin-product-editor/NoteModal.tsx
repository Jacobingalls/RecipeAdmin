import { useState, useId } from 'react';
import { useTranslation } from 'react-i18next';

import type { Note } from '../NotesDisplay';
import { Button, ModalBase, ModalHeader, ModalBody, ModalFooter } from '../common';

type NoteType = 'information' | 'warning' | 'severe' | 'source';

interface NoteModalProps {
  note?: Note;
  onSave: (note: Note) => void;
  onClose: () => void;
}

function detectNoteType(note: Note): NoteType {
  if (typeof note === 'string') return 'information';
  if ('source' in note) return 'source';
  if ('warning' in note) return 'warning';
  if ('severe' in note) return 'severe';
  return 'information';
}

function extractContent(note: Note): string {
  if (typeof note === 'string') return note;
  if ('information' in note) return note.information.markdown ?? note.information.text ?? '';
  if ('warning' in note) return note.warning.markdown ?? note.warning.text ?? '';
  if ('severe' in note) return note.severe.markdown ?? note.severe.text ?? '';
  return '';
}

function extractSourceTitle(note: Note): string {
  if (typeof note !== 'string' && 'source' in note) return note.source.title ?? '';
  return '';
}

function extractSourceUrl(note: Note): string {
  if (typeof note !== 'string' && 'source' in note) return note.source.url;
  return '';
}

export default function NoteModal({ note, onSave, onClose }: NoteModalProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const editing = !!note;
  const [type, setType] = useState<NoteType>(note ? detectNoteType(note) : 'information');
  const [content, setContent] = useState(note ? extractContent(note) : '');
  const [sourceTitle, setSourceTitle] = useState(note ? extractSourceTitle(note) : '');
  const [sourceUrl, setSourceUrl] = useState(note ? extractSourceUrl(note) : '');

  const isSource = type === 'source';
  const canSave = isSource ? sourceUrl.trim() !== '' : content.trim() !== '';

  function handleSave() {
    if (isSource) {
      const source: { url: string; title?: string } = { url: sourceUrl.trim() };
      if (sourceTitle.trim()) source.title = sourceTitle.trim();
      onSave({ source });
    } else if (type === 'warning') {
      onSave({ warning: { markdown: content.trim() } });
    } else if (type === 'severe') {
      onSave({ severe: { markdown: content.trim() } });
    } else {
      onSave({ information: { markdown: content.trim() } });
    }
  }

  return (
    <ModalBase onClose={onClose} ariaLabelledBy={titleId}>
      <ModalHeader onClose={onClose} titleId={titleId}>
        {t(editing ? 'note.edit' : 'note.add')}
      </ModalHeader>
      <ModalBody>
        <div className="mb-3">
          <label htmlFor="note-type" className="form-label">
            {t('note.type')}
          </label>
          <select
            className="form-select form-select-sm"
            id="note-type"
            value={type}
            onChange={(e) => setType(e.target.value as NoteType)}
          >
            <option value="information">{t('note.type.information')}</option>
            <option value="warning">{t('note.type.warning')}</option>
            <option value="severe">{t('note.type.severe')}</option>
            <option value="source">{t('note.type.source')}</option>
          </select>
        </div>
        {isSource ? (
          <>
            <div className="mb-3">
              <label htmlFor="note-source-title" className="form-label">
                {t('note.sourceTitle')}
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                id="note-source-title"
                value={sourceTitle}
                onChange={(e) => setSourceTitle(e.target.value)}
                placeholder={t('note.sourceTitlePlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="note-source-url" className="form-label">
                {t('note.url')}
              </label>
              <input
                type="url"
                className="form-control form-control-sm"
                id="note-source-url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder={t('note.urlPlaceholder')}
              />
            </div>
          </>
        ) : (
          <div>
            <label htmlFor="note-content" className="form-label">
              {t('note.content')}
            </label>
            <textarea
              className="form-control form-control-sm"
              id="note-content"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button disabled={!canSave} onClick={handleSave}>
          {t(editing ? 'common.save' : 'common.add')}
        </Button>
      </ModalFooter>
    </ModalBase>
  );
}
