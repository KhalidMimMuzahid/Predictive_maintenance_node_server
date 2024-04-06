import { TAddress, TCard } from '../common/common.interface';

export type TServiceProviderCompany = {
  status: 'pending' | 'success' | 'blocked';
  companyName: string;
  photoUrl: string; // company  profile photo
  //   representativeName: string;
  address: TAddress;
  fax: string;
  corporateNo: string;
  phone: string;
  currency: // ?????????????
  'us-dollar' | 'japan-yen' | 'korean-yen' | 'indian-rupee' | 'euro' | 'pound';
  capital: number; // ?????????
  invoiceRegistrationNo: string; // what is it ???????????
  bank: {
    bankName: string;
    branchName: string;
    accountNo: number;
    postalCode: string;
    address: TAddress;
    departmentInCharge: string; // ???????
    personInChargeName: string; // ???????
    card: TCard;
  };
  emergencyContact: {
    departmentInCharge: string;
    personInChargeName: string;
    contactNo: string;
    email: string;
  };

  registrationDocument: [{ photoUrl: string; title: string }]; //
  branches?: [string]; // objectId of ServiceProviderBranch model
};
// vendor
export type TServiceProviderBranch = {
  status: 'pending' | 'success' | 'blocked';
  type: string;
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
  services: [string]; //or 'dish-washing-machine'or 'container-washing-machine'or 'pallet-washing-machine'or 'parts-washing-machine'or 'sushi-maker'or 'refrigerator'or 'air-conditioner'or 'laundry-machine' or custom chosen
};
