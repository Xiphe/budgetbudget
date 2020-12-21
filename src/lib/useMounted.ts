import { useEffect, useState } from 'react';

export default function useMounted(timeout = 200) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    let canceled = false;
    setTimeout(() => {
      if (!canceled) {
        setMounted(true);
      }
    }, timeout);
    return () => {
      canceled = true;
      setMounted(false);
    };
  }, [timeout]);
  return mounted;
}
