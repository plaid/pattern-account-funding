import React from 'react';

interface Props {
  initialSubheading?: boolean;
  username?: string | null;
}

const Banner: React.FC<Props> = (props: Props) => {
  return (
    <div id="banner" style={{ marginBottom: '1rem' }}>
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
        </h1>
      </div>
    </div>
  );
};

Banner.displayName = 'Banner';
export default Banner;
