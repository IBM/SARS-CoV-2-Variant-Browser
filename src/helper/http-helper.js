import fetch from 'unfetch';

const getMeta = async () => {
  const res = await fetch('/api/meta');
  return res.json();
};

export {getMeta};
