import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {ChevronDown16, ChevronUp16, AddAlt16, SubtractAlt16} from '@carbon/icons-react';

import {isCategory} from '../helper/data-helper';
import styles from './MultiSelect.module.css';

// use style directly rather than css where carbon design class should be used togheter for perfornace
const CategoryMultiSelect = ({title, placeholder, items, selectedItems, onChange}) => {
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
    const newItems = [...displayItems];
    newItems.forEach((i) => i.selected = 'false');
    setDisplayItems(newItems);
    onChange([]);
  };

  const [displayItems, setDisplayItems] = useState([]);
  const [filterItems, setFilterItems] = useState([]);
  useEffect(() => {
    if (!open) {
      const selectedCategories = selectedItems.filter((i) => isCategory(i)).map((item) => ({...item, expand: false}));
      const selectedArray = selectedCategories.map((i) => i.category);
      const categories = items.filter((i) => isCategory(i) && !selectedArray.includes(i.category)).map((item) => ({...item, selected: 'false', expand: false}));
      const resultList = [...selectedCategories, ...categories];
      setDisplayItems(resultList);
      setFilterItems(resultList);
    }
  }, [open, items, selectedItems]);

  const onExpand = (selected) => (event) => {
    event.stopPropagation();
    const index = displayItems.findIndex((i) => isCategory(i) && i.category === selected.category);
    let result = [];
    if (selected.expand) {
      result = displayItems.filter((i) => !(i.category === selected.category && i.value));
    } else {
      const children = items.filter((i) => i.category === selected.category && !isCategory(i)).map((item) => {
        let selectedValue = selected.selected;
        if (selected.selected === 'mixed') {
          const selectedItem = selectedItems.find((i) => i.category === item.category && i.value === item.value);
          selectedValue = selectedItem ? selectedItem.selected : 'false';
        }
        return {...item, selected: selectedValue};
      });
      result = [...displayItems];
      result.splice(index + 1, 0, ...children);
    }
    selected.expand = !selected.expand;
    const subset = result.filter((item) => (item.label.indexOf(filter) !== -1));
    setDisplayItems(result);
    setFilterItems(subset);
  };

  const onSelect = (selected) => () => {
    let category = null;
    const siblings = [];
    displayItems.forEach((item) => {
      if (item.category === selected.category) {
        if (!item.value) {
          category = item;
        } else {
          siblings.push(item);
        }
      }
    });
    const item = selected;
    const newSelectedItems = selectedItems.filter((i) => i.category !== item.category);
    if (!isCategory(item)) {
      item.selected = item.selected === 'true' ? 'false' : 'true';
      const count = siblings.length;
      const selectedCount = siblings.reduce((count, i) => i.selected === 'true' ? count + 1 : count, 0);
      if (selectedCount === 0) {
        category.selected = 'false';
      } else if (count === selectedCount) {
        category.selected = 'true';
        newSelectedItems.push(category);
      } else {
        category.selected = 'mixed';
        newSelectedItems.push(category);
        newSelectedItems.push(...siblings.filter((i) => i.selected === 'true'));
      }
    } else {
      if (category.selected === 'false' || category.selected === 'mixed') {
        category.selected = 'true';
        siblings.forEach((i) => i.selected = 'true');
        newSelectedItems.push(category);
      } else {
        category.selected = 'false';
        siblings.forEach((i) => i.selected = 'false');
      }
    }
    onChange(newSelectedItems);
  };

  const [filter, setFilter] = useState('');
  const onFilterChange = (event) => {
    const text = event.target.value;
    const subset = displayItems.filter((item) => (item.label.indexOf(text) !== -1));
    setFilter(text);
    setFilterItems(subset);
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

  const selectedCount = selectedItems.reduce((count, item) => item.selected !== 'mixed' ? count + 1 : count, 0);
  let underAllSelected = false;
  return (
    <div>
      {open && <div className={styles.overlay} onClick={onClose}></div>}
      <div className="bx--multi-select__wrapper bx--list-box__wrapper">
        <label className="bx--label">{title}</label>
        <div className="bx--multi-select bx--combo-box bx--multi-select--filterable bx--list-box">
          <div role="button" className="bx--list-box__field" onClick={onOpen} style={{zIndex: open ? '128' : 'auto'}}>
            {selectedCount > 0 &&
              <div role="button" className="bx--list-box__selection bx--tag--filter bx--list-box__selection--multi">
                {selectedCount}
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
              {filterItems.map((item) => {
                underAllSelected = isCategory(item) ? item.selected === 'true' : underAllSelected;
                return (
                  <div className={`bx--list-box__menu-item ${styles.menuItem}`} onClick={onSelect(item)} key={item.category + item.value}>
                    <div className="bx--list-box__menu-item__option" style={{paddingRight: 0}}>
                      <div className="bx--form-item bx--checkbox-wrapper" style={{paddingLeft: !item.value ? 0 : 16}}>
                        <input className="bx--checkbox" type="checkbox" readOnly />
                        <label className="bx--checkbox-label" data-contained-checkbox-state={item.selected} ext-under-all-selected={!isCategory(item) && underAllSelected ? 'true' : 'false'}>
                          <span className="bx--checkbox-appearance"></span>
                          <span className="bx--checkbox-label-text" style={{flex: '1 0 auto'}}>{highlightText(item.label)}</span>
                          <span onClick={onExpand(item)} style={{marginRight: '1rem', display: isCategory(item) ? 'block' : 'none'}}>
                            {item.expand ? <SubtractAlt16 /> : <AddAlt16 />}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </fieldset>
          }
        </div>
      </div>
    </div >);
};

CategoryMultiSelect.propTypes = {
  title: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  items: PropTypes.arrayOf(
      PropTypes.shape({
        category: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
      }),
  ).isRequired,
  selectedItems: PropTypes.arrayOf(
      PropTypes.shape({
        category: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        selected: PropTypes.oneOf(['true', 'false', 'mixed']).isRequired,
      }),
  ).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default CategoryMultiSelect;
