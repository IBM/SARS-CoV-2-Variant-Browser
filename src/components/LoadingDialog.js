import React from 'react';
import PropTypes from 'prop-types';

const LoadingDialog = ({open}) => {
  return (open &&
    <div className="bx--loading-overlay">
      <div data-loading className="bx--loading">
        <svg className="bx--loading__svg" viewBox="-75 -75 150 150">
          <title>Loading</title>
          <circle className="bx--loading__stroke" cx="0" cy="0" r="37.5" />
        </svg>
      </div>
    </div>
  );
};

LoadingDialog.propTypes = {
  open: PropTypes.bool,
};

export default LoadingDialog;
