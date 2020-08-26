import getSettings, { RecentFile as RecentFileT } from '../shared/settings';

export type RecentFile = RecentFileT;
let cache: ReturnType<typeof getSettings>;
export default function getSharedSettings() {
  if (!cache) {
    cache = getSettings();
  }

  return cache;
}
