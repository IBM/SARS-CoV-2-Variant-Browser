import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {ChevronDown16, ChevronUp16} from '@carbon/icons-react';

import styles from './MultiSelect.module.css';

// use style directly rather than css where carbon design class should be used togheter for perfornace
const MultiSelect = ({title, placeholder, items, selectedItems, onChange}) => {
  const [open, setOpen] = useState(false);
  const onOpen = (event) => {
    event.stopPropagation();
    setOpen(true);
  };
  const onClose = (event) => {
    event.stopPropagation();
    setOpen(false);
    setFilter('');
  };
  const onClear = (event) => {
    event.stopPropagation();
    setDisplaySelectedItems([]);
    onChange([]);
  };

  const [displayItems, setDisplayItems] = useState([]);
  const [displaySelectedItems, setDisplaySelectedItems] = useState([]);
  useEffect(() => {
    if (!open) {
      setDisplaySelectedItems(selectedItems);
      setDisplayItems([...selectedItems, ...items.filter((item) => !selectedItems.includes(item))]);
    }
  }, [open, items, selectedItems]);
  const onSelect = (item) => () => {
    let result = {};
    if (displaySelectedItems.indexOf(item) === -1) {
      result = [...displaySelectedItems, item];
    } else {
      result = displaySelectedItems.filter((i) => i !== item);
    }
    setDisplaySelectedItems(result);
    onChange(result);
  };

  const [filter, setFilter] = useState('');
  const onFilterChange = (event) => {
    const text = event.target.value;
    const fullset = [...selectedItems, ...items.filter((item) => !selectedItems.includes(item))];
    const subset = fullset.filter((entry) => entry.indexOf(text) !== -1);
    setFilter(text);
    setDisplayItems(subset);
  };

  const highlightText = (text) => {
    const filterStr = filter.replace(/[.*+?^=!:${}()|[\]\/\\]/g, '\\$&');
    const regexp = new RegExp(`(${filterStr})`, 'ig');
    const split = filter ? text.split(regexp).filter((entry) => !!entry) : [text];
    return (
      <React.Fragment>
        {split.map((entry, index) =>
          (<span key={index} className={entry === filter ? styles.highlightText : styles.normalText}>{entry}</span>
          ))}
      </React.Fragment>
    );
  };

  return (
    <div>
      {open && <div className={styles.overlay} onClick={onClose}></div>}
      <div className="bx--multi-select__wrapper bx--list-box__wrapper">
        <label className="bx--label">{title}</label>
        <div className="bx--multi-select bx--combo-box bx--multi-select--filterable bx--list-box">
          <div role="button" className="bx--list-box__field" onClick={onOpen} style={{zIndex: open ? '128' : 'auto'}}>
            {displaySelectedItems.length > 0 &&
              <div role="button" className="bx--list-box__selection bx--tag--filter bx--list-box__selection--multi">
                {displaySelectedItems.length}
                <svg focusable="false" preserveAspectRatio="xMidYMid meet" style={{willChange: 'transform'}} xmlns="http://www.w3.org/2000/svg" aria-label="Clear selection" width="16" height="16" viewBox="0 0 16 16" role="img" onClick={onClear}>
                  <path d="M12 4.7L11.3 4 8 7.3 4.7 4 4 4.7 7.3 8 4 11.3 4.7 12 8 8.7 11.3 12 12 11.3 8.7 8z"></path>
                </svg>
              </div>
            }
            <input className="bx--text-input" style={{textOverflow: 'ellipsis', paddingLeft: '3.5rem', paddingRight: '2.5rem'}}
              placeholder={placeholder} value={filter} onChange={onFilterChange} />
            <div className="bx--list-box__menu-icon">
              {open ? <ChevronUp16 onClick={onClose} /> : <ChevronDown16 />}
            </div>
          </div>
          {open &&
            <fieldset className="bx--list-box__menu" role="listbox" style={{maxHeight: '50vh'}}>
              {displayItems.map((item) => (
                <div className={`bx--list-box__menu-item ${styles.menuItem}`} onClick={onSelect(item)} key={item}>
                  <div className="bx--list-box__menu-item__option" style={{paddingRight: 0}}>
                    <div className="bx--form-item bx--checkbox-wrapper">
                      <input className="bx--checkbox" type="checkbox" readOnly checked={displaySelectedItems.includes(item)} />
                      <label className="bx--checkbox-label">
                        <span className="bx--checkbox-appearance"></span>
                        <span className="bx--checkbox-label-text">{highlightText(item)}</span>
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

MultiSelect.propTypes = {
  title: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedItems: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default MultiSelect;
