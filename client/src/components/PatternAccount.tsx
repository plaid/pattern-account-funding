import React from 'react';

import { Button } from './ui/Button.tsx';

import { UserType, AppFundType } from './types.ts';

import { currencyFilter } from '../util/index.tsx';

interface Props {
  userTransfer: () => void;
  user: UserType;
  appFund: AppFundType;
  numOfItems: number;
}

const PatternAccount: React.FC<Props> = (props: Props) => {
  const handleClick = () => {
    props.userTransfer();
  };
  return (
    <div className="mb-16">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="m-0">Your Balance</h3>
          <p className="text-[2rem] font-semibold mt-1 mb-0 text-black-1000">{currencyFilter(props.appFund.balance)}</p>
        </div>
        {props.numOfItems > 0 && (
          <div className="flex items-center">
            <Button onClick={handleClick} small>
              Transfer funds
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

PatternAccount.displayName = 'PatternAccount';
export default PatternAccount;
