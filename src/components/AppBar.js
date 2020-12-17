import React from 'react';
import {useRouter} from 'next/router';
import {Header, HeaderName, HeaderNavigation, HeaderMenuItem} from 'carbon-components-react/lib/components/UIShell';

import styles from './AppBar.module.css';

const routes = [
  {path: '/variant', title: 'Variant Browser'},
  {path: '/stat', title: 'Statistics'},
];

const AppBar = () => {
  const router = useRouter();
  const onClick = (path) => (event) => {
    event.preventDefault();
    router.push(path);
  };

  return (
    <div className="container">
      <Header aria-label="SARS-CoV-2 Variant Browser">
        <HeaderName prefix="" className={styles.title} onClick={onClick('/')}>
        SARS-CoV-2 Variant Browser
        </HeaderName>
        <HeaderNavigation aria-label="Nav">
          {routes.map((r) => (
            <HeaderMenuItem key={r.path} isCurrentPage={router.route.startsWith(r.path)} href="#" onClick={onClick(r.path)}>{r.title}</HeaderMenuItem>
          ))}
        </HeaderNavigation>
      </Header>
    </div>
  );
};

export default AppBar;
