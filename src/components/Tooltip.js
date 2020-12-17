import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';

const MyTooltip = ({open, anchorEl, children}) => {
  const [position, setPosition] = useState({left: 0, top: 0});
  const [caretPosition, setCaretPosition] = useState({top: 14, bottom: 'auto'});
  const [direction, setDirection] = useState('right');

  useEffect(() => {
    if (anchorEl) {
      const cx = document.body.clientWidth / 2;
      const cy = document.body.clientHeight / 2;
      const anchor = anchorEl.getBoundingClientRect();
      const tx = (anchor.left + anchor.right) / 2;
      const ty = (anchor.top + anchor.bottom) / 2;
      if (cx >= tx) {
        setDirection('right');
        if (cy >= ty) {
          setPosition({top: anchor.top - 10, left: anchor.right + 10});
          setCaretPosition({top: 14, bottom: 'auto'});
        } else {
          setPosition({bottom: document.body.clientHeight - anchor.bottom + 2, left: anchor.right + 10});
          setCaretPosition({top: 'auto', bottom: 14});
        }
      } else {
        setDirection('left');
        if (cy >= ty) {
          setPosition({top: anchor.top - 10, right: document.body.clientWidth - anchor.left + 10});
          setCaretPosition({top: 1, bottom: 'auto'});
        } else {
          setPosition({bottom: document.body.clientHeight - anchor.bottom + 2, right: document.body.clientWidth - anchor.left + 10});
          setCaretPosition({top: 'auto', bottom: 27});
        }
      }
    }
  }, [open, anchorEl]);

  return (
    <div>
      {open &&
        <div style={{padding: 8, maxWidth: 768, position: 'fixed', ...position}} data-floating-menu-direction={direction} className="bx--tooltip bx--tooltip--shown">
          <span className="bx--tooltip__caret" style={{...caretPosition}}></span>
          <div className="bx--tooltip__content" tabIndex="-1" role="dialog">
            {children}
          </div>
        </div>
      }
    </div>
  );
};

MyTooltip.propTypes = {
  open: PropTypes.bool,
  anchorEl: PropTypes.object,
  children: PropTypes.any,
};

export default MyTooltip;
