import getSettings from '../shared/settings';

let cache: ReturnType<typeof getSettings>;
export default function getSharedSettings() {
  if (!cache) {
    cache = getSettings();
  }

  return cache;
}
