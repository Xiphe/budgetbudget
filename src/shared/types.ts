export type View =
  | { type: 'new'; file?: never }
  | { type: 'welcome'; file?: never }
  | { type: 'budget'; file: string }
  | { type: 'settings'; file: string };
