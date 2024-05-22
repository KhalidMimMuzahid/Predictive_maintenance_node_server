export const hadDuplicateValue = (arr: string[]): boolean => {
  const seen = new Set<string>();

  for (const value of arr) {
    if (seen.has(value)) {
      return true;
    }
    seen.add(value);
  }

  return false;
};
