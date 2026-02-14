import React from 'react';
import Callout from 'plaid-threads/Callout';
import Button from 'plaid-threads/Button';

interface Props {
  userFullname: string | null;
  userEmail: string | null;
  bankOwnerNames: string[];
  bankEmails: string[];
  nameMatch: boolean;
  emailMatch: boolean;
  overallPass: boolean;
  onRetry: () => void;
  showRetryForm: boolean;
}

const IdentityVerificationResults: React.FC<Props> = ({
  userFullname,
  userEmail,
  bankOwnerNames,
  bankEmails,
  nameMatch,
  emailMatch,
  overallPass,
  onRetry,
  showRetryForm,
}) => {
  return (
    <div className="identity-results">
      {overallPass ? (
        <Callout className="identity-results__banner identity-results__banner--success">
          <strong>Success:</strong> Account ownership verification succeeded.
          Transfer capabilities enabled.
        </Callout>
      ) : (
        <Callout className="identity-results__banner" warning>
          <strong>Warning:</strong> Account ownership verification failed. Bank
          account may not belong to this user. Transfer capabilities blocked.
        </Callout>
      )}
      <div className="box identity-results__details">
        <div className="identity-results__header">
          <h3 className="heading">Bank Account Identity Data</h3>
        </div>
        <table className="identity-results__table">
          <thead>
            <tr>
              <th>Check</th>
              <th>You Entered</th>
              <th>Bank Returned</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="identity-results__check-label">Full Name</td>
              <td>{userFullname || '(not provided)'}</td>
              <td>
                {bankOwnerNames.length > 0
                  ? bankOwnerNames.join(', ')
                  : '(none)'}
              </td>
              <td>
                <span
                  className={
                    nameMatch
                      ? 'identity-results__badge identity-results__badge--pass'
                      : 'identity-results__badge identity-results__badge--fail'
                  }
                >
                  {nameMatch ? 'Match' : 'No Match'}
                </span>
              </td>
            </tr>
            <tr>
              <td className="identity-results__check-label">Email</td>
              <td>{userEmail || '(not provided)'}</td>
              <td>
                {bankEmails.length > 0 ? bankEmails.join(', ') : '(none)'}
              </td>
              <td>
                <span
                  className={
                    emailMatch
                      ? 'identity-results__badge identity-results__badge--pass'
                      : 'identity-results__badge identity-results__badge--fail'
                  }
                >
                  {emailMatch ? 'Match' : 'No Match'}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {!overallPass && !showRetryForm && (
        <div className="identity-results__retry">
          <Button
            className="identity-results__retry-button"
            centered
            small
            onClick={onRetry}
          >
            Try Again with a New Identity
          </Button>
        </div>
      )}
    </div>
  );
};

IdentityVerificationResults.displayName = 'IdentityVerificationResults';
export default IdentityVerificationResults;
