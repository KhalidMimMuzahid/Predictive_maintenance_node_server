import { Types } from 'mongoose';
import { TCompany, TIsDeleted } from '../common/common.interface';
export type THealthStatus = 'bad' | 'good' | 'moderate' | 'unknown';
export type TIssue = {
  issue: string;
};

export type TCycleCount = {
  life: number;
  reservationPeriod: number;
};
export type TMachineCategory = 'washing-machine' | 'general-machine';
export type TMachine = {
  machineNo: string; // "00001" / "00002" / "00003" ; this machineNo is for only this user; for this user machineNo will start from "00001"
  healthStatus: {
    health: THealthStatus;
  }; // based oon what ?????????

  packageStatus: 'Pending' | 'Running' | 'Expired'; // based oon what ?????????
  operatingStatus?: 'running' | 'idle' | 'off';
  thermalScore?: number;
  energyScore?: number;

  co2Emissions?: number;
  waterConsumption?: number;
  heatExchangeCapacity?: number;

  cycleCount?: TCycleCount;
  category: TMachineCategory;
  name: string;
  issues?: TIssue[];
  // address?: TAddress;
  // userType: 'showa-user'; // default value 'showa-user'; for future we may need, if showa-user and other user type like organization or anything
  user: Types.ObjectId; // objectId of User model
  usedFor?: TCompany; // shop or company info ;
  generalMachine?: {
    homeName?: string; //  ??????
    homeType?: string; // ?????? "Mansion" | "Apartment" | "others"
    type: string; // general machine types, like TV, Fridge, AC etc.
  };
  // type: string; //
  washingMachine?: {
    type: string; // washing machine types, like Dish washing machine, Pallet washing machine, Container washing machine
  };
  brand: string; // as mentioned in figma; brand name of the machine
  model: string; // as mentioned in figma; model name of the machine
  environment: 'indoor' | 'outdoor'; // as mentioned in figma  like  "indoor" or "outdoor"
  sensorModulesAttached?: Types.ObjectId[]; // objectId of SensorModuleAttached
  subscriptionPurchased: Types.ObjectId;
  specialContactServiceProviderCompany?: Types.ObjectId; // if this coupon is for special contact with service provider
  isDeleted: TIsDeleted;
};

export type TMachineHealthStatus = {
  healthStatus: THealthStatus;
  issues: string[];
  operatingStatus?: 'running' | 'idle' | 'off';
  thermalScore?: number;
  energyScore?: number;
  co2Emissions?: number;
  waterConsumption?: number;
  heatExchangeCapacity?: number;
  healthStatuses: {
    // timeStamp: string;
    sectionName: string;
    sensorData: {
      vibration: number;
      temperature: number;
    };
    healthStatus: THealthStatus;
  }[];
};