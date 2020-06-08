import React from 'react';

// TODO: add support for redux hooks
// https://github.com/welldone-software/why-did-you-render/issues/85
if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');

  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}
