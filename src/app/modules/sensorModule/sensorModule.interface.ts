/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';
import { TIsDeleted } from '../common/common.interface';
export type TStatus = 'in-stock' | 'sold-out';
// sensor is actually not a sensor; its a module; each module can have multiple sensor;
export type TModuleType = 'module-1' | 'module-2' | 'module-3' | 'module-4';
export type TSensorModule = {
  // sensorModuleId: string; // unique identifier ;  iotProductId as mention in figma
  addedBy: Types.ObjectId; // objectId of user who add this sensor
  name: string;
  macAddress: string;
  price: number;
  status: TStatus;
  // sensorType: 'vibration' | 'temperature'; // we no need this field
  moduleType: TModuleType;
  // seller: string; // seller is always Showa company; thats why we no need this seller field for now
  isDeleted: TIsDeleted;
};

export interface SensorModuleModel extends Model<TSensorModule> {
  isMacAddressExists(macAddress: string): Promise<TSensorModule | null>;
}
