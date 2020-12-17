import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {Button, Column, DatePicker, DatePickerInput, Grid, Row, Tag} from 'carbon-components-react';
import {ChevronDown16, ChevronUp16, ArrowUp16} from '@carbon/icons-react';
import moment from 'moment-timezone';

import Accordion from '../Accordion';
import MultiSelect from '../MultiSelect';
import CategoryMultiSelect from '../CategoryMultiSelect';
import {isCategory} from '../../helper/data-helper';
import MultiInput from '../MultiInput';

import styles from './Filter.module.css';

/* eslint-disable camelcase */
const Filter = ({dataSet, supplements, meta, filter, onApplyFilter, mode = 'default'}) => {
  const totalStyle = {
    display: mode === 'variant' ? 'inline-block' : 'none',
    marginLeft: 16,
    marginTop: 8,
  };
  const additionalSearchItemStyle = {
    display: mode === 'variant' ? 'block' : 'none',
  };
  // display control
  const [open, setOpen] = useState(false);
  const [onAccordionHeader, setOnAccordionHeader] = useState(false);
  const accordionHeaderStyle = onAccordionHeader || open ? {} : {float: 'left', height: 32, overflow: 'hidden'};

  // selection list
  const [typeList, setTypeList] = useState([]);
  const [genesAAChangesList, setGenesAAChangesList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [cladeDetailList, setCladeDetailList] = useState([]);
  useEffect(() => {
    if (supplements) {
      setTypeList(supplements.types ? supplements.types : []);
      setGenesAAChangesList(supplements.genesAAChanges ? supplements.genesAAChanges : []);
      setLocationList(supplements.locations ? supplements.locations : []);
      setCladeDetailList(supplements.clades ? supplements.clades : []);
    }
  }, [supplements]);

  // filter condition
  const [collectionDateFrom, setCollectionDateFrom] = useState(null);
  const [collectionDateTo, setCollectionDateTo] = useState(null);
  const [sample, setSample] = useState([]);
  const [isolate, setIsolate] = useState([]);
  const [type, setType] = useState([]);
  const [mutation, setMutation] = useState([]);
  const [gene, setGene] = useState([]);
  const [AA_change, setAA_change] = useState([]);
  const [geneAA_change, setGeneAA_change] = useState([]);
  const [continent, setContinent] = useState([]);
  const [country, setCountry] = useState([]);
  const [location, setLocation] = useState([]);
  const [cladeDetail, setCladeDetail] = useState([]);
  const initFilter = () => {
    setCollectionDateFrom(filter.collectionDateFrom ? filter.collectionDateFrom : null);
    setCollectionDateTo(filter.collectionDateTo ? filter.collectionDateTo : null);
    setSample(filter.sample ? filter.sample : []);
    setIsolate(filter.isolate ? filter.isolate : []);
    setType(filter.type ? filter.type : []);
    setMutation(filter.mutation ? filter.mutation : []);
    setGene(filter.gene ? filter.gene : []);
    setAA_change(filter.AA_change ? filter.AA_change : []);
    setGeneAA_change(filter.geneAA_change ? filter.geneAA_change : []);
    setContinent(filter.continent ? filter.continent : []);
    setCountry(filter.country ? filter.country : []);
    setLocation(filter.location ? filter.location : []);
    setCladeDetail(filter.cladeDetail ? filter.cladeDetail : []);
  };
  useEffect(() => {
    initFilter();
  }, [filter]);

  const applyFilter = (diff = {}) => {
    if (onApplyFilter) {
      onApplyFilter({collectionDateFrom, collectionDateTo, sample, isolate, type, mutation, gene, AA_change, geneAA_change, continent, country, location, cladeDetail, ...diff});
    }
  };
  const onApply = () => {
    applyFilter();
    setOpen(false);
  };
  const onCancel = () => {
    initFilter();
    setOpen(false);
  };
  const onClear = () => {
    setCollectionDateFrom(null);
    setCollectionDateTo(null);
    setSample([]);
    setIsolate([]);
    setType([]);
    setMutation([]);
    setGene([]);
    setAA_change([]);
    setGeneAA_change([]);
    setContinent([]);
    setCountry([]);
    setLocation([]);
    setCladeDetail([]);
  };
  const onRemove = (label, value, list, listSetter) => (event) => {
    event.stopPropagation();
    const result = list.filter((item) => item !== value);
    listSetter(result);
    applyFilter({[label]: result});
  };
  const onRemoveSingle = (label, setter, resetValue = null) => (event) => {
    event.stopPropagation();
    setter(resetValue);
    applyFilter({[label]: resetValue});
  };
  const onRemoveCategorical = (label, value, list, listSetter) => (event) => {
    event.stopPropagation();
    let result = [];
    if (isCategory(value) || list.reduce((count, i) => !isCategory(i) && i.category === value.category ? count + 1 : count, 0) === 1) {
      // remove if selected filter is category or the last one entry
      result = list.filter((i) => i.category !== value.category);
    } else {
      result = list.filter((i) => !(i.category === value.category && i.value === value.value));
    }
    listSetter(result);
    applyFilter({[label]: result});
  };

  const getPlaceholder = (filter) => filter.join('|');
  const getPlaceholderForCatetorical = (filter) => {
    const categories = filter.filter((i) => isCategory(i) && i.selected === 'true');
    const values = filter.filter((i) => !isCategory(i) && !categories.find((c) => c.category === i.category));
    return getPlaceholder([...categories.map((i) => i.category), ...values.map((i) => i.value)]);
  };
  const renderTag = (label, filter, setFilter) => (
    <span>
      {filter.map((item) => (
        <Tag key={item} type="warm-gray" filter onClose={onRemove(label, item, filter, setFilter)}>{item}</Tag>
      ))}
    </span>
  );
  const renderTagForCategorical = (label, filter, setFilter) => {
    const categories = filter.filter((i) => isCategory(i) && i.selected === 'true');
    const values = filter.filter((i) => !isCategory(i) && !categories.find((c) => c.category === i.category));
    return (<span>
      {categories.map(((item) =>
        <Tag key={item.category} type="warm-gray" filter onClose={onRemoveCategorical(label, item, filter, setFilter)}>{item.category}</Tag>
      ))}
      {values.map(((item) =>
        <Tag key={item.value} type="warm-gray" filter onClose={onRemoveCategorical(label, item, filter, setFilter)}>{item.value}</Tag>
      ))}
    </span>);
  };

  return (
    <Accordion open={open} setOpen={setOpen} buttonTitle="Filter" title={
      <div data-testid="accordion" className={styles.header} onMouseEnter={() => setOnAccordionHeader(true)} onMouseLeave={() => setOnAccordionHeader(false)} onClick={() => setOpen((open) => !open)}>
        <div style={accordionHeaderStyle}>
          {!open &&
            <div className={styles.tips}>
              <div>Click here to manage filter</div>
              <div style={{marginLeft: 4}}><ArrowUp16 fill="#0f62fe" /></div>
            </div>
          }
          <span style={totalStyle}>
            {meta.total !== dataSet.filteredSamples.length ? 'Matching ' + dataSet.filteredSamples.length.toLocaleString() + ' of ' : ''}
            {meta.total ? meta.total.toLocaleString() : 0} Total Samples
          </span>
          {collectionDateFrom != null && (
            <Tag type="warm-gray" filter onClose={onRemoveSingle('collectionDateFrom', setCollectionDateFrom)}>{moment(collectionDateFrom, 'MM/DD/YYYY').format('M/D/Y')} ~ </Tag>
          )}
          {collectionDateTo != null && (
            <Tag type="warm-gray" filter onClose={onRemoveSingle('collectionDateTo', setCollectionDateTo)}> ~ {moment(collectionDateTo, 'MM/DD/YYYY').format('M/D/Y')}</Tag>
          )}
          {renderTagForCategorical('location', location, setLocation)}
          {renderTagForCategorical('geneAA_change', geneAA_change, setGeneAA_change)}
          {renderTag('mutation', mutation, setMutation)}
          {renderTag('sample', sample, setSample)}
          {renderTag('type', type, setType)}
          {renderTag('cladeDetail', cladeDetail, setCladeDetail)}
          {renderTag('isolate', isolate, setIsolate)}
          {renderTag('continent', continent, setContinent)}
          {renderTag('country', country, setCountry)}
          {renderTag('gene', gene, setGene)}
          {renderTag('AA_change', AA_change, setAA_change)}
        </div>
        <div style={{flexGrow: 1}}></div>
        <Button size="small" renderIcon={open ? ChevronUp16 : ChevronDown16}>
          Filter
        </Button>
      </div>
    }>
      <Grid condensed fullWidth>
        <Row condensed>
          <Column sm={2} md={2} lg={2} xl={2} max={2}>
            <div>
              <DatePicker className={styles.picker} datePickerType="single" dateFormat="m/d/Y" value={collectionDateFrom} onChange={(dates) => setCollectionDateFrom(dates[0])}>
                <DatePickerInput onFocus={(event) => event.target.blur()} id="dateFrom" labelText="Collection Date From" pattern="d{1,2}/d{4}" placeholder="From Date" />
              </DatePicker>
            </div>
          </Column>
          <Column sm={2} md={2} lg={2} xl={2} max={2}>
            <div>
              <DatePicker className={styles.picker} datePickerType="single" dateFormat="m/d/Y" value={collectionDateTo} onChange={(dates) => setCollectionDateTo(dates[0])}>
                <DatePickerInput onFocus={(event) => event.target.blur()} id="dateTo" labelText="Collection Date To" pattern="d{1,2}/d{4}" placeholder="To Date" />
              </DatePicker>
            </div>
          </Column>
          <Column sm={2} md={4} lg={4} xl={4} max={4}>
            <CategoryMultiSelect title="Location" items={locationList} selectedItems={location} onChange={setLocation}
              placeholder={getPlaceholderForCatetorical(location)} />
          </Column>
          <Column sm={2} md={4} lg={4} xl={4} max={4}>
            <CategoryMultiSelect title="Gene - Amino acid change" items={genesAAChangesList} selectedItems={geneAA_change} onChange={setGeneAA_change}
              placeholder={getPlaceholderForCatetorical(geneAA_change)} />
          </Column>
          <Column sm={2} md={4} lg={3} xl={3} max={3} style={additionalSearchItemStyle}>
            <MultiInput title="Mutation" selectedItems={mutation} onChange={setMutation}
              placeholder={getPlaceholder(mutation)} placeholderBlank="input mutation number..." />
          </Column>
          <Column sm={2} md={4} lg={3} xl={3} max={3} style={additionalSearchItemStyle}>
            <MultiInput title="Sample" selectedItems={sample} onChange={setSample}
              placeholder={getPlaceholder(sample)} placeholderBlank="input sample id..." />
          </Column>
          <Column sm={2} md={4} lg={3} xl={3} max={3} style={additionalSearchItemStyle}>
            <MultiSelect title="Type" items={typeList} selectedItems={type} onChange={setType}
              placeholder={getPlaceholder(type)} />
          </Column>
          <Column sm={2} md={4} lg={3} xl={3} max={3}>
            <MultiSelect title="Clade" items={cladeDetailList} selectedItems={cladeDetail} onChange={setCladeDetail}
              placeholder={getPlaceholder(cladeDetail)} />
          </Column>
        </Row>
        <Row>
          <Column>
            <Button size="field" kind="primary" style={{float: 'left'}} onClick={onApply}>Apply</Button>
            <Button size="field" kind="secondary" style={{float: 'left'}} onClick={onCancel}>Cancel</Button>
            <Button size="field" kind="tertiary" style={{float: 'right'}} onClick={onClear}>Clear</Button>
          </Column>
        </Row>
      </Grid>
    </Accordion>
  );
};

Filter.propTypes = {
  dataSet: PropTypes.object.isRequired,
  supplements: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  filter: PropTypes.object,
  onApplyFilter: PropTypes.func,
  mode: PropTypes.string,
};

export default Filter;
