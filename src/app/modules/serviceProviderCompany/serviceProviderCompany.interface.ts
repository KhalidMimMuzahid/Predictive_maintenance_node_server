import { Types } from 'mongoose';
import { TAddress, TCard } from '../common/common.interface';
export type TCompanyStatus = 'pending' | 'success' | 'suspended';
// export type TLanguage = {
//   katakana?: { name: { firstName: string; lastName: string } };
//   kanji?: { name: { firstName: string; lastName: string } };
// };
export type TServiceProviderCompany = {
  serviceProviderAdmin: Types.ObjectId; // objectId of user, who is admin/owner of this company
  status: TCompanyStatus;
  // language?: TLanguage;

  companyName: string;
  photoUrl?: string; // company  profile photo
  address: TAddress;
  representativeName: string; // it should be a reference of real user
  fax: string;
  corporateNo: string;
  phone: string;
  currency: // ?????????????
  | 'us-dollar'
    | 'japanese-yen'
    | 'korean-yen'
    | 'indian-rupee'
    | 'euro'
    | 'pound';
  capital: number; // ?????????
  invoiceRegistrationNo: string; // what is it ???????????
  services: string[]; //or 'dish-washing-machine'or 'container-washing-machine'or 'pallet-washing-machine'or 'parts-washing-machine'or 'sushi-maker'or 'refrigerator'or 'air-conditioner'or 'laundry-machine' or custom chosen
  bank: {
    bankName: string;
    branchName: string;
    accountNo: number;
    postalCode: string;
    address?: TAddress;
    departmentInCharge: string; // ???????
    personInChargeName: string; // ???????
    card: TCard; // should i transfer this card to wallet for service provide company???
  };
  wallet: Types.ObjectId; // objectId of wallet for this company; i made it because of future need
  emergencyContact: {
    departmentInCharge: string;
    personInChargeName: string;
    contactNo: string;
    email: string;
  };

  registrationDocument: { photoUrl: string; title: string }[]; //
  branches?: Types.ObjectId[]; // objectId of ServiceProviderBranch model
};
