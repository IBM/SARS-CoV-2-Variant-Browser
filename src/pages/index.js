import React, {useEffect} from 'react';
import {useRouter} from 'next/router';

import {startAndFinishLoadingWith} from '../helper/loading-helper';

const normalPathes = [
  '/variant',
  '/stat',
];
const Page = () => {
  const router = useRouter();
  useEffect(() => {
    startAndFinishLoadingWith(() => {
      if (normalPathes.includes(router.asPath)) {
        router.push(router.asPath);
      } else {
        router.push('/variant');
      }
    });
  }, []);

  return <div></div>;
};

export default Page;
