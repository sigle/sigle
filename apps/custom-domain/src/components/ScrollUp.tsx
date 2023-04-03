'use client';

import { useEffect } from 'react';

/**
 * Add this component to the top of your page to fix
 * https://github.com/vercel/next.js/issues/42492
 * Ideally we remove this hack when next.js solves the issue
 */

export default function ScrollUp() {
  useEffect(() => window.document.scrollingElement?.scrollTo(0, 0), []);

  return null;
}
