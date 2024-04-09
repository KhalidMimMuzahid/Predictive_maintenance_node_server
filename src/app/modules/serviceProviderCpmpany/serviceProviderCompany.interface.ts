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
