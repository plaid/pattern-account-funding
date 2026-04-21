import React, { useState } from 'react';

import { TextInput } from './ui/TextInput.tsx';
import { Button } from './ui/Button.tsx';
import { currencyFilter } from '../util/index.tsx';

interface Props {
  checkAmountAndInitiate: (amount: number) => void;
  setShowTransfer: (arg: boolean) => void;
  setShowInput: (arg: boolean) => void;
}
const TransferForm: React.FC<Props> = (props: Props) => {
  const [transferAmount, setTransferAmount] = useState('');
  const handleSubmit = (e: any) => {
    e.preventDefault();
    props.checkAmountAndInitiate(parseFloat(transferAmount));
    setTransferAmount('');
    props.setShowInput(false);
  };

  const amt =
    parseFloat(transferAmount) > 0
      ? currencyFilter(parseFloat(transferAmount))
      : '';
  return (
    <>
      <div>
        <h3 className="m-0">Transfer Funds</h3>
        <form onSubmit={handleSubmit}>
          <TextInput
            type="number"
            id="transferAmount"
            name="transfer amount"
            value={transferAmount}
            required
            placeholder="$0.00"
            label="Amount"
            onChange={e => setTransferAmount(e.currentTarget.value)}
            className="my-4 w-80"
          />
          <Button
            small
            secondary
            onClick={() => props.setShowTransfer(false)}
          >
            Back
          </Button>
          <Button small type="submit">
            Submit {amt}
          </Button>
        </form>
      </div>
    </>
  );
};
TransferForm.displayName = 'TransferForm';
export default TransferForm;
