import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { MCP_URL } from '../../api';
import { CopyButton, SectionHeader, SubsectionTitle } from '../common';

const API_KEY_PLACEHOLDER = '<API key>';

/** How to connect an AI assistant to this API over MCP. */
export default function ConnectAssistantSection() {
  const { t } = useTranslation();
  const urlId = useId();

  const command = `claude mcp add --transport http recipe ${MCP_URL} --header "Authorization: Bearer ${API_KEY_PLACEHOLDER}"`;

  return (
    <>
      <SectionHeader title={t('assistant.title')} className="mt-4" />

      <div className="card mb-5">
        <div className="card-body">
          <p className="text-body-secondary">{t('assistant.description')}</p>

          <label htmlFor={urlId} className="form-label">
            {t('assistant.urlLabel')}
          </label>
          <div className="input-group mb-4">
            <input
              id={urlId}
              type="text"
              className="form-control font-monospace"
              value={MCP_URL}
              readOnly
            />
            <CopyButton
              text={MCP_URL}
              label={t('assistant.copyUrl')}
              className="btn btn-outline-secondary"
            />
          </div>

          <SubsectionTitle as="h6">{t('assistant.claude.title')}</SubsectionTitle>
          <p>{t('assistant.claude.instructions')}</p>

          <SubsectionTitle as="h6">{t('assistant.agents.title')}</SubsectionTitle>
          <p>{t('assistant.agents.instructions', { placeholder: API_KEY_PLACEHOLDER })}</p>
          <pre className="bg-body-tertiary border rounded p-2 small text-wrap text-break mb-2">
            <code>{command}</code>
          </pre>
          <CopyButton text={command} label={t('assistant.copyCommand')} />

          <p className="form-text mt-4 mb-0">{t('assistant.sessionsNote')}</p>
        </div>
      </div>
    </>
  );
}
