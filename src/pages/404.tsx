import React from 'react';
import { MyError } from '../pages-lib/_error';

const Custom404 = () => {
  return <MyError statusCode={404} />;
};

export default Custom404;
