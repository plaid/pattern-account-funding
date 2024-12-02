import React, { useState, useEffect } from 'react';
import Button from 'plaid-threads/Button';

import LinkButton from './LinkButton.tsx';
import useLink from '../services/link.tsx';

interface Props {
  setBadStateShown: boolean;
  handleSetBadState: () => void;
  userId: number;
  itemId: number;
  handleDelete: () => void;
}

const UpdateLink: React.FC<Props> = (props: Props) => {
  const [token, setToken] = useState('');
  const [showLink, setShowLink] = useState(false);

  const { generateLinkToken, linkTokens } = useLink();

  const initiateLinkUpdate = async () => {
    generateLinkToken(props.userId, props.itemId, false); // itemId is set because link is in update mode; isProcessor is true and isIdentity is false in update mode;
    setShowLink(true);
  };

  useEffect(() => {
    setToken(linkTokens.byItem[props.itemId]);
  }, [linkTokens, props.itemId]);

  return (
    <div className="more-details">
      {
        <Button
          small
          centered
          inline
          tertiary
          className="action__button"
          onClick={initiateLinkUpdate}
        >
          Update Login
        </Button>
      }
      {token != null && token.length > 0 && showLink && (
        <LinkButton
          userId={props.userId}
          itemId={props.itemId}
          token={token}
          isProcessor={true}
          isIdentity={false}
        />
      )}
    </div>
  );
};

UpdateLink.displayName = 'UpdateLink';
export default UpdateLink;
