export const eqSet = (s1: Set<number>, s2: Set<number>): boolean => {
  if (s1.size !== s2.size) return false;
  if (s1.keys().every((ele) => s2.has(ele))) return true;
  return false;
};
