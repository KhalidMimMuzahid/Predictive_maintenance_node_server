/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';

// sensor is actually not a sensor; its a module; each module can have multiple sensor;
export type TSensorModule = {
  // sensorModuleId: string; // unique identifier ;  iotProductId as mention in figma
  addedBy: Types.ObjectId; // objectId of user who add this sensor
  name: string;
  macAddress: string;
  // price: number;
  status: 'in-stock' | 'sold-out';
  // sensorType: 'vibration' | 'temperature'; // we no need this field
  moduleType: 'module-1' | 'module-2' | 'module-3' | 'module-4';
  // seller: string; // seller is always Showa company; thats why we no need this seller field for now
  isDeleted: boolean;
};

export interface SensorModuleModel extends Model<TSensorModule> {
  isMacAddressExists(macAddress: string): Promise<TSensorModule | null>;
}
