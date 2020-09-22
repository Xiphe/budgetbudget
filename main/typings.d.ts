import type { View } from '../src/shared/types';

declare module 'electron' {
  interface WebContents {
    initialView: View;
  }
}
