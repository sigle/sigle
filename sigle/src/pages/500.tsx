import React from 'react';
import { MyError } from '../pages-lib/_error';

const Custom500 = () => {
  return <MyError statusCode={500} errorMessage="An error has occured" />;
};

export default Custom500;
