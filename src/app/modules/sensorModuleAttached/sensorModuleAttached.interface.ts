import { Types } from 'mongoose';

// for module-1:
export type TModule1 = { vibration: [number]; temperature: [number] };

// for module-2:
export type TModule2 = {
  vibration: [number, number, number];
  temperature: [number];
};

// for module-3:
export type TModule3 = {
  vibration: [number, number, number, number, number, number];
  temperature: [number, number, number];
};

//for module-4:
export type TModule4 = {
  vibration: [number, number, number, number, number, number];
  temperature: [number, number, number, number, number, number];
};
export type TModule = TModule1 | TModule2 | TModule3 | TModule4;

export type TModuleType = 'module-1' | 'module-2' | 'module-3' | 'module-4';
export type TSensorModuleAttached = {
  sensorModule: Types.ObjectId; // objectId of TSensor
  macAddress: string;
  isAttached: boolean; // if true, means this module sensor is attached to the machine (then machine field must be empty); if it is false, means this sensor module is purchased by user but not added to any machine yet (machine field must have _id of machine object)
  machine?: Types.ObjectId; // objectId of Machine model  ; if machine field is not empty , that means this machine is connected to this sensor

  user: Types.ObjectId; // objectId of User model who purchase this sensor
  purpose?: string; // showa admin can set this value when it will be installed in the machine by showa admin/engineer
  sectionName: string; // showa admin can set this value
  isSwitchedOn: boolean; // when the sensor is active then it's value is true
  moduleType: TModuleType;
  sensorData?: TModule[];
  subscriptionPurchased: Types.ObjectId;
};
