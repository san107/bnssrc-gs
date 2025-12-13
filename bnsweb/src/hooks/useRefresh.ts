import { useState } from 'react';

export const useRefresh = (): [number, () => void] => {
  const [refreshId, setRefreshId] = useState(0);
  return [refreshId, () => setRefreshId((v) => v + 1)];
};
