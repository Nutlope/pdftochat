import type { JSX as ReactJSX } from 'react';

// react-markdown@8 ships .ts sources that reference the global JSX namespace,
// which @types/react@19 no longer declares.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ReactJSX.IntrinsicElements {}
  }
}
