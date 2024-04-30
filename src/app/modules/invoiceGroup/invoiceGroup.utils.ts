/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';

export const getServiceProviderBranchForUser_EngineerAndManager = (
  userData: any,
): mongoose.Types.ObjectId => {
  return userData[`${userData?.role}`].currentState
    ?.serviceProviderBranch as mongoose.Types.ObjectId;
};
