import { TIsDeleted } from '../common/common.interface';
import { TModuleType } from '../sensorModuleAttached/sensorModuleAttached.interface';
export type TPrice = {
  netAmount: number;
  discount: {
    type: 'percentage' | 'flat-rate';
    amount: number; // for percentage, value must be between 0 and 100 and for flat rate value can be grater than zero and smaller than or equal package Amount
  };
};

export type TPremium = {
  totalMachine: number;
  totalIOT: number;
  applicableModules: TModuleType[];
  validity: number;
};

export type TStandard = {
  totalMachine: number;
  // totalIOT: number; // for standard package on have any IOT for adding
  // applicableModules: TModuleType[]; // No IOT means No applicableModules
  validity: number;
};
export type TBasic = {
  // totalMachine: number; //m no machine for adding
  showaMB: number; //m this mb will be decreased for every request of add sensor data
  totalIOT: number; // for standard package on have any IOT for adding
  applicableModules: TModuleType[]; // No IOT means No applicableModules
  validity: number;
};
export type TShowaUser = {
  packageType:
    | 'premium' // premium is for  Sensor connected (machine must have IOT)+ Data visualization+  can raise reservation request
    | 'standard' // standard is for  Sensor non connected + No Data visualization + can raise reservation request
    | 'basic'; // basic is for  only IOT; only for data visualization;  this package has no machines and can not raise reservation request;
  premium?: TPremium;
  standard?: TStandard;

  basic?: TBasic;
};

export type TPackage = {
  packageFor: 'showaUser' | 'serviceProviderCompany';
  showaUser?: TShowaUser;
  //serviceProviderCompany?: { totalEngineer: number };
};
//admin can change the whole package
export type TSubscription = {
  // currentOffer: string  // the current offer can be changed by admin
  subscriptionTitle: string;
  package: TPackage;
  price: TPrice;
  features: string[];
  isDeleted: TIsDeleted; // by default false
};
