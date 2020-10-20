export type ViewNew = { type: 'new'; file?: never };
export type ViewWelcome = { type: 'welcome'; file?: never };
export type ViewBudget = { type: 'budget'; file: string };
export type ViewSettings = { type: 'settings'; file: string };

export type View = ViewNew | ViewWelcome | ViewBudget | ViewSettings;
