//admin can change the whole package
export type TPromo = {
  discountInPercentage: number; // the range must be 0 to 100
  discountInAmount: number; //  admin can directly set the offer amount

  // currentOffer: string  // the current offer can be changed by admin
};
