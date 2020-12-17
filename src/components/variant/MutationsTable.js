import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {DataTable, TableContainer, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, TableToolbar, TableToolbarSearch, TableToolbarContent} from 'carbon-components-react';
// import {TableToolbarAction, TableToolbarMenu} from 'carbon-components-react';
import {TableBatchAction} from 'carbon-components-react';
import {Download16} from '@carbon/icons-react';
import headerData from './MutationsTableHeader.json';
import moment from 'moment-timezone';

import styles from './MutationsTable.module.css';

const MutationsTable = ({data, height}) => {
  const [rowData, setRowData] = useState([]);
  const [rowDataOriginal, setRowDataOriginal] = useState([]);
  // const [filteredDataVisible, setFilteredDataVisible] = useState(false);
  // const filterData = () => {
  //   if (filteredDataVisible) {
  //     setRowData(rowDataOriginal.filter((d) => !d.isSelected));
  //   } else {
  //     setRowData(rowDataOriginal);
  //   }
  //   setFilteredDataVisible(!filteredDataVisible);
  // };
  const drawTable = () => {
    // setRowDataOriginal(data);
    // if (!filteredDataVisible) {
    //   setRowData(data.filter((d) => !d.isSelected));
    // } else {
    setRowDataOriginal(data);
    setRowData(data.slice(0, 30));
    // }
  };
  useEffect(() => drawTable(), [data, height]);
  const headerRef = useRef([...Array(headerData.length)].map(() => React.createRef()));
  useEffect(() => {
    headerRef.current.map((ref) => {
      ref.current.querySelector('span.bx--table-header-label').style.textOverflow = 'inherit';
      ref.current.querySelector('span.bx--table-header-label').style.maxWidth = 'inherit';
      ref.current.querySelector('svg.bx--table-sort__icon-unsorted').style.marginLeft = 0;
    });
    headerRef.current[0].current.style.cssText = ('padding-left: 8px; padding-right: 0px; width: 70%');
    headerRef.current[1].current.style.cssText = ('padding-left: 8px; padding-right: 0px; width: 50%');
    headerRef.current[2].current.style.cssText = ('padding-left: 8px; padding-right: 0px; width: 140%');
    headerRef.current[3].current.style.cssText = ('padding-left: 8px; padding-right: 0px; width: 45%');
    headerRef.current[4].current.style.cssText = ('padding-left: 8px; padding-right: 0px; width: 65%');
  }, [headerRef]);
  const bodyWidth = (column) => {
    const padding = {paddingRight: 0, paddingLeft: 8, paddingTop: 2, paddingBottom: 2, wordBreak: 'break-all'};
    if (column === 0) {
      // Mutation
      return {...padding, width: '70%'};
    } else if (column === 1) {
      // Gene
      return {...padding, width: '50%'};
    } else if (column === 2) {
      // AA Change
      return {...padding, width: '140%'};
    } else if (column === 3) {
      // Count
      return {...padding, width: '45%'};
    } else {
      // Type
      return {...padding, width: '65%'};
    }
  };

  const downloadData = () => {
    const tsv = [];
    const tsvHeader = headerData.map((h) => h.header).join('\t') + '\n';
    tsv.push(tsvHeader);
    rowDataOriginal.forEach((item) => {
      const tsvBody = item.mutation + '\t' +
        item.gene + '\t' +
        item.amino_acid_change + '\t' +
        item.count + '\t' +
        item.mutation_type + '\t' +
        item.reported_location + '\n';
      tsv.push(tsvBody);
    });
    const downLoadLink = document.createElement('a');
    downLoadLink.download = 'sars_cov2_variant_browser_variants_' + moment().format('YYYYMMDDHHmmss') + '.tsv';
    const file = new Blob(tsv, {type: 'text/tab-separated-values'});
    downLoadLink.href = URL.createObjectURL(file);
    downLoadLink.dataset.downloadurl = ['text/tab-separated-values', downLoadLink.download, downLoadLink.href].join(':');
    downLoadLink.click();
  };

  return (
    <DataTable isSortable={true}
      rows={rowData}
      headers={headerData}
      render={({rows, headers, getHeaderProps, getRowProps, onInputChange}) => (
        <TableContainer>
          <TableToolbar>
            <TableToolbarContent>
              <TableToolbarSearch onChange={onInputChange} placeHolderText="Search Table" id="search" />
              {/* <TableToolbarMenu>
                <TableToolbarAction onClick={() => filterData()}>
                  {filteredDataVisible ? 'Show filtered only' : 'Show all data'}
                </TableToolbarAction>
              </TableToolbarMenu> */}
              <TableBatchAction aria-hidden iconDescription={null} hasIconOnly tabIndex={-1} renderIcon={Download16} onClick={downloadData} className={styles.button} />
            </TableToolbarContent>
          </TableToolbar>
          <Table size='compact' useZebraStyles stickyHeader={true} style={{maxHeight: `${height - 50}px`}}>
            <TableHead>
              <TableRow style={{minHeight: '1rem'}}>
                {headers.map((header, i) => (
                  <TableHeader {...getHeaderProps({header})} key={header.key} ref={headerRef.current[i]} style={{paddingRight: 0, paddingLeft: 0}}>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} {...getRowProps({row})} style={{height: 'auto', minHeight: '1rem'}}>
                  {row.cells.map((cell, i) => (
                    <TableCell key={cell.id} style={bodyWidth(i)}>{i === 3 ? cell.value.toLocaleString() : cell.value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>)}
    />
  );
};

MutationsTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  height: PropTypes.number.isRequired,
};

export default MutationsTable;
