import { Types } from 'mongoose';
import { TCompany } from '../common/common.interface';

export type TMachine = {
  machineNo: string; // "00001" / "00002" / "00003" ; this machineNo is for only this user; for this user machineNo will start from "00001"
  status: 'abnormal' | 'normal'; // based oon what ?????????
  category: 'washing-machine' | 'general-machine'; // why those two type ???????
  name: string;

  // userType: 'showa-user'; // default value 'showa-user'; for future we may need, if showa-user and other user type like organization or anything
  user: Types.ObjectId; // objectId of User model
  usedFor?: TCompany; // shop or company info ; special case:for general machine we store machine-type field as mentioned in figma, to   category: 'home' | 'others';

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
  sensors?: Types.ObjectId[];
  deleted: boolean; // objectId of TAttachedSensor model
};
