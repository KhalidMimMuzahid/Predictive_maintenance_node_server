import { TIsDeleted } from '../common/common.interface';
import { TModuleType } from '../sensorModuleAttached/sensorModuleAttached.interface';

export type TDiscount = {
  type: 'percentage' | 'flat-rate';
  amount: number; // for percentage, value must be between 0 and 100 and for flat rate value can be grater than zero and smaller than or equal package Amount
};
export type TPrice = {
  netAmount: number;
  discount: TDiscount;
};

export type TPremium = {
  totalMachine: number;
  totalIOT: number;
  applicableModules: TModuleType[];
};

export type TStandard = {
  totalMachine: number;
  // totalIOT: number; // for standard package on have any IOT for adding
  // applicableModules: TModuleType[]; // No IOT means No applicableModules
};
export type TBasic = {
  // totalMachine: number; //m no machine for adding
  showaMB: number; //m this mb will be decreased for every request of add sensor data
  totalIOT: number; // for standard package on have any IOT for adding
  applicableModules: TModuleType[]; // No IOT means No applicableModules
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


export type TServiceProviderCompany = {
  packageType: 'standard' | 'enterprise';

  totalReservationAllowed: 'unlimited' | number; // if enterprise then 'unlimited' otherwise a number
  totalReservationAcceptable: 'unlimited' | number; // if enterprise then 'unlimited' otherwise a number
  totalBranch: number; // The maximum number of branches the service provider can operate.
  totalVendor: number; // The total number of vendors that can be managed under the subscription.
  teamSize: number; // The maximum team size allowed within the subscription.
  hasMarketplaceAccess: boolean;

  //It should be defined in service provider company interface
  // contractualBrands: string[]; // this brand must be specified from redefined value ; if any machine raise a reservation wth this machine brands, this reservation will bw ato assigned to this company

  // Special Service Provider Contract Plan (Brand-specific)
  // Contractual Provisions:
  // Request Filtering: Service provider will only receive requests for machines from the specific brand as per the contract.
  // Other Parameters:
  // Number of Branches: 10
  // Number of Vendors: 50
  // Number of Team Members: 20
  // Marketplace Access: Yes

  // Special Service Provider Contract (if applicable):
  // Unlimited Requests for Specific Brands:
  // The service provider will receive unlimited service requests exclusively for machines of a specific brand as defined by the contract with Showa.
  // Brand-specific Request Handling:
  // The service provider will only receive service requests for the machines of the brand specified in their contract.
};

export type TPackage = {
  packageFor: 'showaUser' | 'serviceProviderCompany';
  showaUser?: TShowaUser;
  serviceProviderCompany?: TServiceProviderCompany;
};
//admin can change the whole package
export type TSubscription = {
  // currentOffer: string  // the current offer can be changed by admin
  subscriptionTitle: string;
  bannerUrl: string;
  package: TPackage;
  price: TPrice;
  validity: number;
  features: string[];
  isDeleted: TIsDeleted; // by default false
};
