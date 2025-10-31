import React, { useState } from 'react';
import Callout from 'plaid-threads/Callout';
import { Button } from 'plaid-threads/Button';

import { AccountType, AppFundType } from './types.ts';
import { currencyFilter } from '../util/index.tsx';
import TransferForm from './TransferForm.tsx';
import {
  updateAppFundsBalance,
  makeTransfer,
  evaluateTransferSignal,
} from '../services/api.tsx';

const IS_PROCESSOR = process.env.REACT_APP_IS_PROCESSOR;

interface TransferResponse {
  newAccount: AccountType;
  newAppFunds: AppFundType;
}
interface Props {
  account: AccountType;
  userId: number;
  setAppFund: (appFund: AppFundType) => void;
  setShowTransfer: (arg: boolean) => void;
  institutionName: string | null;
  setAccount: (arg: AccountType) => void;
}

// This component checks to make sure the amount of transfer does not
// exceed the balance in the account and then initiates the ach transfer or processor request.
// Note that no transfers are actually made in this sample app; therefore balances in
// linked accounts will not actually be decremented when
// a transfer is made in this app.

const Transfers: React.FC<Props> = (props: Props) => {
  const [transferAmount, setTransferAmount] = useState(0);
  const [isTransferConfirmed, setIsTransferConfirmed] = useState(false);
  const [showInput, setShowInput] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showError, setShowError] = useState(false);
  const [signalEvaluation, setSignalEvaluation] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const account = props.account;

  // use available_balance only; leave it up to developer to decide
  // the risk of using current_balance:
  const balance = account.available_balance;

  const sendRequestToProcessor = async (
    amount: number,
    funding_source_url: string,
    itemId: number
  ) => {
    // endpoint to make Dwolla transfer call
    try {
      const createTransfer = await makeTransfer(
        funding_source_url,
        amount,
        itemId
      );
      return createTransfer.data.transfer.amount;
    } catch (e) {
      if (e instanceof Error) {
        console.error('error', e.message);
      }
    }
  };

  const completeAchTransfer = (amount: number, accountId: string) => {
    // placeholder code to simulate ach bank transfer using bank routing and bank account data from the get auth call.
    // api route to complete ach bank transfer
    console.log(
      'completing transfer of' + amount + ' from account # ' + accountId
    );
    // return confirmation of ach transfer
    return amount;
  };

  const checkAmountAndInitiate = async (amount: number) => {
    setTransferAmount(amount);
    setShowError(false);
    setShowInput(false);
    setIsEvaluating(true);

    // Basic validation
    if (amount <= 0) {
      setErrorMessage('You must enter an amount greater than $0.00');
      setShowError(true);
      setIsEvaluating(false);
      return;
    }

    try {
      // CRITICAL: Evaluate transfer risk using Signal with the actual transfer amount
      const { data: signalEval } = await evaluateTransferSignal(
        account.item_id,
        account.plaid_account_id,
        amount,
        props.userId
      );

      // Store the signal evaluation for display
      setSignalEvaluation(signalEval);
      setIsEvaluating(false);

      // Handle Signal evaluation outcomes
      const outcome = signalEval.outcome?.toUpperCase();

      if (outcome === 'ACCEPT') {
        // Signal approved, proceed with the transfer
        const confirmedAmount =
          IS_PROCESSOR === 'true'
            ? await sendRequestToProcessor(
                amount,
                account.funding_source_url,
                account.item_id
              )
            : completeAchTransfer(amount, account.plaid_account_id);

        if (confirmedAmount == null) {
          setErrorMessage(
            'Oops! Something went wrong with the transfer. Try again later.'
          );
          setShowError(true);
        } else {
          const response: TransferResponse | any = await updateAppFundsBalance(
            // this route updates the appFunds with the new balance and also
            // increments the number of transfers for this account by 1
            props.userId,
            confirmedAmount,
            account.plaid_account_id
          );
          props.setAppFund(response.data.newAppFunds);
          props.setAccount(response.data.newAccount);
          setIsTransferConfirmed(true);
        }
      } else if (outcome === 'REROUTE') {
        setErrorMessage(
          `Risk evaluation outcome: ${outcome}. This transaction was flagged as high risk. Please try a different funding source or payment method.`
        );
        setShowError(true);
      } else if (outcome === 'REVIEW') {
        setErrorMessage(
          `Risk evaluation outcome: ${outcome}. This transaction requires manual review before processing. Please contact support or try a different payment method.`
        );
        setShowError(true);
      } else {
        // Unknown outcome or not accepted
        setErrorMessage(
          `Risk evaluation outcome: ${outcome || 'UNKNOWN'}. This transaction cannot be processed at this time. Please try a different payment method.`
        );
        setShowError(true);
      }
    } catch (error) {
      console.error('Signal evaluation or transfer failed:', error);
      setIsEvaluating(false);
      // Boom errors come back as error.response.data with {statusCode, error, message}
      const serverErrorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error_message ||
        error?.message;

      setErrorMessage(
        serverErrorMessage ||
          'Unable to evaluate transfer. Please try again or contact support.'
      );
      setShowError(true);
    }
  };

  return (
    <div className="transfers">
      {showInput && (
        <>
          <TransferForm
            setShowTransfer={props.setShowTransfer}
            checkAmountAndInitiate={checkAmountAndInitiate}
            setShowInput={setShowInput}
          />
          <Callout className="callout" info>
            Note: This is a sandbox environment. No actual money will be
            transferred. The balance shown will not decrease when you make
            transfers, as this is for demonstration purposes only.
          </Callout>
        </>
      )}
      {isEvaluating && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h3 className="subheading">Evaluating Transfer Risk...</h3>
          <div
            style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginTop: '1rem',
            }}
          />
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      )}
      {isTransferConfirmed && (
        <>
          <div>
            <h3 className="subheading">Transfer Confirmed</h3>{' '}
          </div>
          <p>{`You have successfully transferred ${currencyFilter(
            transferAmount
          )} from ${props.institutionName} to your Plaid Pattern Account.`}</p>
          {signalEvaluation && (
            <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
              <details>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                  Signal Evaluation Details
                </summary>
                <pre
                  style={{
                    fontSize: '0.85rem',
                    backgroundColor: '#f5f5f5',
                    padding: '1rem',
                    borderRadius: '4px',
                    overflow: 'auto',
                    marginTop: '0.5rem',
                  }}
                >
                  {JSON.stringify(signalEvaluation, null, 2)}
                </pre>
              </details>
            </div>
          )}
          <Button
            small
            centered
            inline
            onClick={() => props.setShowTransfer(false)}
          >
            Done
          </Button>
        </>
      )}
      {showError && (
        <>
          <div>
            <h3 className="subheading">Transfer Error</h3>
          </div>
          <Callout className="callout" warning>
            {errorMessage}
          </Callout>
          {signalEvaluation && (
            <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
              <details>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                  Signal Evaluation Details
                </summary>
                <pre
                  style={{
                    fontSize: '0.85rem',
                    backgroundColor: '#f5f5f5',
                    padding: '1rem',
                    borderRadius: '4px',
                    overflow: 'auto',
                    marginTop: '0.5rem',
                  }}
                >
                  {JSON.stringify(signalEvaluation, null, 2)}
                </pre>
              </details>
            </div>
          )}
          <Button
            small
            centered
            inline
            onClick={() => props.setShowTransfer(false)}
          >
            Back
          </Button>
        </>
      )}
    </div>
  );
};

Transfers.displayName = 'Transfers';
export default Transfers;
