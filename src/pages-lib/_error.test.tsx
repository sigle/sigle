import React from 'react';
import { render } from '@testing-library/react';
import { MyError } from './_error';

describe('MyError', () => {
  it('should display statusCode in title', async () => {
    const { getByTestId } = render(<MyError statusCode={404} />);

    expect(getByTestId('error-title')).toHaveTextContent('404');
  });

  it('should display errorMessage in sub title', async () => {
    const { getByTestId } = render(
      <MyError statusCode={404} errorMessage="Custom error message" />
    );

    expect(getByTestId('error-sub-title')).toHaveTextContent(
      'Custom error message'
    );
  });
});
