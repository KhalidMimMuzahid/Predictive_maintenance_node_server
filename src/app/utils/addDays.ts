export const addDays = (numberOfDays: number): Date => {
  // const currentDate = new Date();
  // currentDate.setDate(currentDate.getDate() + days);
  // return currentDate;
  const now = new Date();
  const futureDate = new Date(
    now.getTime() + numberOfDays * 24 * 60 * 60 * 1000,
  );
  return futureDate;
};
