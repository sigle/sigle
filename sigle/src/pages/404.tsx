import React from 'react';
import { MyError } from '../pages-lib/_error';

const Custom404 = () => {
  return (
    <MyError statusCode={404} errorMessage="The page could not be found" />
  );
};

export default Custom404;
