import React, { useEffect, useState } from 'react';
import { getNgrokStatus } from '../services/api';
import useLink from '../services/link';

interface Props {
  initialSubheading?: boolean;
  username?: string | null;
}

const Banner: React.FC<Props> = (props: Props) => {
  const [webhookStatus, setWebhookStatus] = useState<'loading' | 'available' | 'unavailable'>('loading');
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem('webhookBadgeDismissed') === 'true';
  });
  const [isApiKeyWarningDismissed, setIsApiKeyWarningDismissed] = useState<boolean>(() => {
    return localStorage.getItem('apiKeyWarningDismissed') === 'true';
  });

  const { linkTokens } = useLink();

  useEffect(() => {
    const checkNgrokStatus = async () => {
      try {
        const response = await getNgrokStatus();
        if (response.data.url) {
          setWebhookStatus('available');
        } else {
          setWebhookStatus('unavailable');
        }
      } catch (err) {
        setWebhookStatus('unavailable');
      }
    };

    checkNgrokStatus();
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('webhookBadgeDismissed', 'true');
  };

  const handleApiKeyWarningDismiss = () => {
    setIsApiKeyWarningDismissed(true);
    localStorage.setItem('apiKeyWarningDismissed', 'true');
  };

  const getWebhookBadge = () => {
    if (webhookStatus === 'loading' || isDismissed) return null;

    const isAvailable = webhookStatus === 'available';

    if (!isAvailable) {
      return (
        <div
          style={{
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            fontSize: '12pt',
            padding: '0.75rem 1rem',
            borderRadius: '0.375rem',
            backgroundColor: '#fff3e0',
            color: '#e65100',
            fontWeight: '500',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000,
            maxWidth: '300px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '0.5rem',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
              ⚠ Webhooks Disabled
            </div>
            <div style={{ fontSize: '11pt', lineHeight: '1.4' }}>
              ngrok not running. Check Docker logs for details.
            </div>
          </div>
          <button
            onClick={handleDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: '#e65100',
              fontSize: '1.25rem',
              cursor: 'pointer',
              padding: '0',
              lineHeight: '1',
              opacity: 0.7,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
            title="Dismiss"
          >
            ×
          </button>
        </div>
      );
    }

    return (
      <span
        style={{
          fontSize: '0.875rem',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          marginLeft: '1rem',
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          fontWeight: 'normal',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
        title="Webhooks are configured and working"
      >
        ✓ Webhooks: Active
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#2e7d32',
            fontSize: '1rem',
            cursor: 'pointer',
            padding: '0',
            lineHeight: '1',
            opacity: 0.7,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
          title="Dismiss"
        >
          ×
        </button>
      </span>
    );
  };

  const getApiKeyWarning = () => {
    if (isApiKeyWarningDismissed || !linkTokens.error?.error_message) return null;

    const errorMessage = linkTokens.error.error_message || '';
    const isApiKeyError = errorMessage.toLowerCase().includes('plaid') &&
                          (errorMessage.toLowerCase().includes('key') ||
                           errorMessage.toLowerCase().includes('client_id') ||
                           errorMessage.toLowerCase().includes('secret'));

    if (!isApiKeyError) return null;

    return (
      <div
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          fontSize: '12pt',
          padding: '0.75rem 1rem',
          borderRadius: '0.375rem',
          backgroundColor: '#ffebee',
          color: '#c62828',
          fontWeight: '500',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxWidth: '350px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '0.5rem',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
            🔑 API Keys Missing
          </div>
          <div style={{ fontSize: '11pt', lineHeight: '1.4' }}>
            Plaid Link will not work. Add <code style={{ background: 'rgba(0,0,0,0.1)', padding: '0.1rem 0.3rem', borderRadius: '0.2rem' }}>PLAID_CLIENT_ID</code> and <code style={{ background: 'rgba(0,0,0,0.1)', padding: '0.1rem 0.3rem', borderRadius: '0.2rem' }}>PLAID_SECRET_SANDBOX</code> to your <code style={{ background: 'rgba(0,0,0,0.1)', padding: '0.1rem 0.3rem', borderRadius: '0.2rem' }}>.env</code> file.
          </div>
        </div>
        <button
          onClick={handleApiKeyWarningDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#c62828',
            fontSize: '1.25rem',
            cursor: 'pointer',
            padding: '0',
            lineHeight: '1',
            opacity: 0.7,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
          title="Dismiss"
        >
          ×
        </button>
      </div>
    );
  };

  return (
    <div id="banner" style={{ marginBottom: '1rem' }}>
      {getApiKeyWarning()}
      <div className="header">
        <h1
          className="everpresent-content__heading"
          style={{ marginTop: 0, marginBottom: '0.5rem' }}
        >
          Account Funding
          {!props.initialSubheading && props.username && (
            <span
              style={{
                fontSize: '1rem',
                fontWeight: 'normal',
                marginLeft: '1rem',
              }}
            >
              ({props.username})
            </span>
          )}
          {getWebhookBadge()}
        </h1>
      </div>
    </div>
  );
};

Banner.displayName = 'Banner';
export default Banner;
