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
    <div className="pattern-account">
      <div className="pattern-account__header">
        <div>
          <h3 className="subheading">Your Balance</h3>
          <p className="account-dollars">{currencyFilter(props.appFund.balance)}</p>
        </div>
        {props.numOfItems > 0 && (
          <div className="transfer-funds__button-container">
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
