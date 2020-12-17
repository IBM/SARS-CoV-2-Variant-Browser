const showLoader = (flag) => {
  const loader = document.getElementById('loading');
  if (loader) {
    loader.style.display = flag === true ? 'flex' : 'none';
  }
};

let loadCount = 0;

const startLoading = () => {
  if (loadCount <= 0) {
    loadCount = 0;
    showLoader(true);
  }
  loadCount++;
};

const finishLoading = () => {
  loadCount--;
  if (loadCount <= 0) {
    loadCount = 0;
    showLoader(false);
  }
};

const startAndFinishLoadingWith = (loadFunc) => {
  startLoading();
  finishLoadingWith(loadFunc);
};

const finishLoadingWith = (loadFunc) => {
  setTimeout(() => {
    loadFunc();
    setTimeout(() => finishLoading(), 1);
  }, 200);
};

export {
  startLoading,
  finishLoading,
  startAndFinishLoadingWith,
  finishLoadingWith,
};
