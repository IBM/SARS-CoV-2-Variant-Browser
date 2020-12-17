import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {ChevronDown16, ChevronUp16, CloseFilled16} from '@carbon/icons-react';

import styles from './MultiSelect.module.css';

// use style directly rather than css where carbon design class should be used togheter for perfornace
const MultiInput = ({title, placeholder, placeholderBlank, selectedItems, onChange}) => {
  const [open, setOpen] = useState(false);
  const onOpen = (event) => {
    event.stopPropagation();
    setOpen(true);
  };
  const onClose = (event) => {
    event.stopPropagation();
    setOpen(false);
  };

  const [displayItems, setDisplayItems] = useState([]);
  useEffect(() => {
    setDisplayItems([...selectedItems]);
  }, [selectedItems]);

  const [value, setValue] = useState('');
  const onKeyPress = (event) => {
    if (event.key == 'Enter' && value) {
      event.preventDefault();
      const result = [...selectedItems, value];
      setDisplayItems(result);
      onChange(result);
      setValue('');
    }
  };
  const onClear = (value) => (event) => {
    event.stopPropagation();
    const result = selectedItems.filter((item) => item !== value);
    setDisplayItems(result);
    onChange(result);
  };
  const onClearAll = (event) => {
    event.stopPropagation();
    onChange([]);
  };

  return (
    <div>
      {open && <div className={styles.overlay} onClick={onClose}></div>}
      <div className="bx--multi-select__wrapper bx--list-box__wrapper">
        <label className="bx--label">{title}</label>
        <div className="bx--multi-select bx--combo-box bx--multi-select--filterable bx--list-box">
          <div role="button" className="bx--list-box__field" onClick={onOpen} style={{zIndex: open ? '128' : 'auto'}}>
            {displayItems.length > 0 &&
              <div role="button" className="bx--list-box__selection bx--tag--filter bx--list-box__selection--multi">
                {displayItems.length}
                <svg focusable="false" preserveAspectRatio="xMidYMid meet" style={{willChange: 'transform'}} xmlns="http://www.w3.org/2000/svg" aria-label="Clear selection" width="16" height="16" viewBox="0 0 16 16" role="img" onClick={onClearAll}>
                  <path d="M12 4.7L11.3 4 8 7.3 4.7 4 4 4.7 7.3 8 4 11.3 4.7 12 8 8.7 11.3 12 12 11.3 8.7 8z"></path>
                </svg>
              </div>
            }
            <input
              className="bx--text-input"
              style={{textOverflow: 'ellipsis', paddingLeft: '3.5rem', paddingRight: '2.5rem'}}
              placeholder={open || selectedItems.length === 0 ? placeholderBlank : placeholder}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyPress={(event) => onKeyPress(event)}
            />
            <div className="bx--list-box__menu-icon">
              {open ? <ChevronUp16 onClick={onClose} /> : <ChevronDown16 />}
            </div>
          </div>
          {open &&
            <fieldset className="bx--list-box__menu" role="listbox" style={{maxHeight: '50vh'}}>
              {displayItems.map((item) => (
                <div className={`bx--list-box__menu-item ${styles.menuItem}`} key={item}>
                  <div className="bx--list-box__menu-item__option" style={{paddingRight: 0}}>
                    <div className="bx--form-item bx--checkbox-wrapper">
                      <CloseFilled16 onClick={onClear(item)}></CloseFilled16>
                      <label>
                        <span className="bx--checkbox-label-text">{item}</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </fieldset>
          }
        </div>
      </div>
    </div >);
};

MultiInput.propTypes = {
  title: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  placeholderBlank: PropTypes.string,
  selectedItems: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default MultiInput;
