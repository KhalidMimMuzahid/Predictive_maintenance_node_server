import { TAddress, TCard } from '../common/common.interface';

export type TServiceProviderCompany = {
  status: 'pending' | 'success' | 'blocked';
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
    address: TAddress;
    departmentInCharge: string; // ???????
    personInChargeName: string; // ???????
    card: TCard; // should i transfer this card to wallet for service provide company???
  };
  emergencyContact: {
    departmentInCharge: string;
    personInChargeName: string;
    contactNo: string;
    email: string;
  };

  registrationDocument: { photoUrl: string; title: string }[]; //
  branches?: string[]; // objectId of ServiceProviderBranch model
};
