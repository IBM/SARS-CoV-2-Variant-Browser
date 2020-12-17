import React from 'react';
import PropTypes from 'prop-types';
import {Button} from 'carbon-components-react';
import {ChevronDown16, ChevronUp16} from '@carbon/icons-react';

import styles from './Accordion.module.css';

const Accordion = ({title, children, open, setOpen}) => {
  return (
    <ul data-accordion className="bx--accordion">
      <li data-accordion-item className="bx--accordion__item">
        {title}
        {!title &&
          <div style={{float: 'right'}}>
            <Button size="small" renderIcon={open ? ChevronUp16 : ChevronDown16} iconDescription="" onClick={() => setOpen((open) => !open)}>
              {open ? 'Close' : 'Open'}
            </Button>
          </div>
        }
        <div className={`bx--accordion__content ${styles.accordionContent} ${open ? styles.accordionContentOpen : ''}`}>
          {children}
        </div>
      </li>
    </ul>
  );
};

Accordion.propTypes = {
  title: PropTypes.any,
  children: PropTypes.any,
  open: PropTypes.bool,
  setOpen: PropTypes.func,
};

export default Accordion;
