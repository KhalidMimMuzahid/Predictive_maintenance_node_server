import { Types } from 'mongoose';
import {
  TAddress,
  // TCard
} from '../common/common.interface';

// vendor
export type TServiceProviderBranch = {
  status: 'pending' | 'success' | 'suspended';
  type: 'branch'; //| 'vendor'; //  branch-office or vendor
  branchName: string;
  department: string; // Chief Executive Office, Chief Operating Office, Head of Business, Head of Engineer,Head of Accounts, or others
  serviceProviderCompany: Types.ObjectId; // objectId of ServiceProviderCompany model
  email: string;
  contactNo: string;
  language?: {
    katakana?: { branchName: string };
    korean?: { branchName: string };
  };
  address: TAddress;
  departmentInCharge: string; //  ????????
  personInChargeName: string; //  ????????
  // bank: {
  //   bankName: string;
  //   branchName: string;
  //   accountNo: number;
  //   postalCode: string;
  //   address: TAddress;
  //   departmentInCharge: string; // ???????
  //   personInChargeName: string; // ???????
  //   card: TCard; // should i transfer this card to wallet for service provide company???
  // };

  services?: string[]; //or 'dish-washing-machine'or 'container-washing-machine'or 'pallet-washing-machine'or 'parts-washing-machine'or 'sushi-maker'or 'refrigerator'or 'air-conditioner'or 'laundry-machine' or custom chosen

  wallet: Types.ObjectId;
};
