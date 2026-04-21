import React from 'react';
import { Callout } from './ui/Callout.tsx';
import { Button } from './ui/Button.tsx';

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
    <div className="mb-8">
      {overallPass ? (
        <Callout className="mb-6 bg-[#e6f4ea] border-[#34a853] text-[#1e7e34]">
          <strong>Success:</strong> Account ownership verification succeeded.
          Transfer capabilities enabled.
        </Callout>
      ) : (
        <Callout className="mb-6" warning>
          <strong>Warning:</strong> Account ownership verification failed. Bank
          account may not belong to this user. Transfer capabilities blocked.
        </Callout>
      )}
      <div className="box p-5">
        <div className="mb-4">
          <h3 className="heading">Bank Account Identity Data</h3>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left py-3 px-4 border-b border-black-200 heading text-xs">Check</th>
              <th className="text-left py-3 px-4 border-b border-black-200 heading text-xs">You Entered</th>
              <th className="text-left py-3 px-4 border-b border-black-200 heading text-xs">Bank Returned</th>
              <th className="text-left py-3 px-4 border-b border-black-200 heading text-xs">Result</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-left py-3 px-4 border-b border-black-200 text-sm font-semibold">Full Name</td>
              <td className="text-left py-3 px-4 border-b border-black-200 text-sm">{userFullname || '(not provided)'}</td>
              <td className="text-left py-3 px-4 border-b border-black-200 text-sm">
                {bankOwnerNames.length > 0
                  ? bankOwnerNames.join(', ')
                  : '(none)'}
              </td>
              <td className="text-left py-3 px-4 border-b border-black-200 text-sm">
                <span
                  className={
                    nameMatch
                      ? 'inline-block py-1 px-3 rounded text-xs font-semibold bg-[#e6f4ea] text-[#1e7e34]'
                      : 'inline-block py-1 px-3 rounded text-xs font-semibold bg-[#fce8e6] text-[#c5221f]'
                  }
                >
                  {nameMatch ? 'Match' : 'No Match'}
                </span>
              </td>
            </tr>
            <tr>
              <td className="text-left py-3 px-4 text-sm font-semibold">Email</td>
              <td className="text-left py-3 px-4 text-sm">{userEmail || '(not provided)'}</td>
              <td className="text-left py-3 px-4 text-sm">
                {bankEmails.length > 0 ? bankEmails.join(', ') : '(none)'}
              </td>
              <td className="text-left py-3 px-4 text-sm">
                <span
                  className={
                    emailMatch
                      ? 'inline-block py-1 px-3 rounded text-xs font-semibold bg-[#e6f4ea] text-[#1e7e34]'
                      : 'inline-block py-1 px-3 rounded text-xs font-semibold bg-[#fce8e6] text-[#c5221f]'
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
        <div className="mt-4 flex justify-center">
          <Button
            className="min-w-[12.5rem]"
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
