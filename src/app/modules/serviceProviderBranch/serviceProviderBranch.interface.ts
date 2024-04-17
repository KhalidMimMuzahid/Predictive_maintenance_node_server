import { TAddress } from '../common/common.interface';

// vendor
export type TServiceProviderBranch = {
  status: 'pending' | 'success' | 'blocked';
  type: string; //  branch-office or vendor
  branchName: string;
  serviceProviderCompany: string; // objectId of ServiceProviderCompany model
  email: string;
  contactNo: string;
  language?: {
    katakana?: { branchName: string };
    korean?: { branchName: string };
  };
  address: TAddress;
  departmentInCharge: string; //  ????????
  personInChargeName: string; //  ????????
  // services: string[]; //or 'dish-washing-machine'or 'container-washing-machine'or 'pallet-washing-machine'or 'parts-washing-machine'or 'sushi-maker'or 'refrigerator'or 'air-conditioner'or 'laundry-machine' or custom chosen
};