import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  settingsListPasskeys,
  settingsListAPIKeys,
  settingsListSessions,
  settingsRevokeSession,
  settingsRevokeSessions,
} from '../api';
import {
  LoadingState,
  ErrorState,
  Button,
  ModalBase,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '../components/common';
import {
  ProfileSection,
  CredentialsSection,
  LanguageSection,
  SessionsSection,
} from '../components/settings';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LocaleContext';
import { useApiQuery } from '../hooks';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const {
    data: passkeys,
    loading: passkeysLoading,
    error: passkeysError,
    refetch: refetchPasskeys,
  } = useApiQuery(settingsListPasskeys, [], {
    errorMessage: t('settings.error.passkeys'),
  });
  const {
    data: apiKeys,
    loading: apiKeysLoading,
    error: apiKeysError,
    refetch: refetchApiKeys,
  } = useApiQuery(settingsListAPIKeys, [], {
    errorMessage: t('settings.error.apiKeys'),
  });
  const {
    data: sessions,
    loading: sessionsLoading,
    error: sessionsError,
    refetch: refetchSessions,
  } = useApiQuery(settingsListSessions, [], {
    errorMessage: t('settings.error.sessions'),
  });

  const [isRevokingSessions, setIsRevokingSessions] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

  async function handleRevokeSession(familyId: string) {
    await settingsRevokeSession(familyId);
    refetchSessions();
  }

  async function handleRevokeSessions() {
    setShowRevokeConfirm(false);
    setIsRevokingSessions(true);
    try {
      await settingsRevokeSessions();
      await logout();
      navigate('/login');
    } catch {
      setIsRevokingSessions(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const loading = passkeysLoading || apiKeysLoading || sessionsLoading;
  const error = passkeysError || apiKeysError || sessionsError;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <h1 className="mb-4">{t('settings.title')}</h1>

      <ProfileSection />

      <CredentialsSection
        passkeys={passkeys}
        apiKeys={apiKeys}
        refetchPasskeys={refetchPasskeys}
        refetchApiKeys={refetchApiKeys}
      />

      <LanguageSection />

      <SessionsSection
        sessions={sessions}
        isRevokingSessions={isRevokingSessions}
        onLogout={handleLogout}
        onRevokeSessions={() => setShowRevokeConfirm(true)}
        onRevokeSession={handleRevokeSession}
      />

      {showRevokeConfirm && (
        <ModalBase
          onClose={() => setShowRevokeConfirm(false)}
          ariaLabelledBy="revoke-sessions-title"
        >
          <ModalHeader onClose={() => setShowRevokeConfirm(false)} titleId="revoke-sessions-title">
            {t('sessions.revokeAll.title')}
          </ModalHeader>
          <ModalBody>{t('sessions.revokeAll.message')}</ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowRevokeConfirm(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={handleRevokeSessions}>
              {t('sessions.revokeAll.confirm')}
            </Button>
          </ModalFooter>
        </ModalBase>
      )}
    </div>
  );
}
