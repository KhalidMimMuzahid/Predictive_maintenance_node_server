import { Types } from 'mongoose';
import { TCompany, TIsDeleted } from '../common/common.interface';
import {
  THealthStatuses,
  TModule,
  TModuleType,
  TSectionName,
} from '../sensorModuleAttached/sensorModuleAttached.interface';
 export type THealthStatus = 'bad' | 'good' | 'moderate' | 'unknown';

 export type TMachine = {
   machineNo: string; // "00001" / "00002" / "00003" ; this machineNo is for only this user; for this user machineNo will start from "00001"
   healthStatus: THealthStatus; // based oon what ?????????
   packageStatus: 'Pending' | 'Running' | 'Expired'; // based oon what ?????????
   category: 'washing-machine' | 'general-machine'; // why those two type ???????
   name: string;

   // userType: 'showa-user'; // default value 'showa-user'; for future we may need, if showa-user and other user type like organization or anything
   user: Types.ObjectId; // objectId of User model
   usedFor?: TCompany; // shop or company info ;

   generalMachine?: {
     homeName?: string; //  ??????
     homeType?: string; // ?????? "Mansion" | "Apartment" | "others"
   };
   // type: string; //
   washingMachine?: {
     type: string; // like Dish washing machine, Pallet washing machine, Container washing machine
   };

   brand: string; // as mentioned in figma; brand name of the machine
   model: string; // as mentioned in figma; model name of the machine
   environment: 'indoor' | 'outdoor'; // as mentioned in figma  like  "indoor" or "outdoor"
   sensorModulesAttached?: Types.ObjectId[]; // objectId of SensorModuleAttached

   subscriptionPurchased: Types.ObjectId;

   isDeleted: TIsDeleted;
   // objectId of TAttachedSensor model
 };







                   




 export type TMachineHealthStatus = {
   healthStatus: THealthStatus;
   sensorModulesAttached: {
     _id: Types.ObjectId;
     moduleType: TModuleType;
     sectionName: TSectionName;
     healthStatuses: THealthStatuses;
     sensorData: TModule[];
   }[];
 };