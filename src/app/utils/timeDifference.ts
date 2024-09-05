export const timeDifference = (endDate: number, startDate: number) => {
  const differenceInMilliseconds = endDate - startDate;

  // Convert milliseconds to seconds
  const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);
  return differenceInSeconds;
};
