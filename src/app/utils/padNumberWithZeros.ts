export const padNumberWithZeros = (number: number, length: number) => {
  // Convert number to string and pad with zeros using padStart
  return String(number).padStart(length, '0');
};
