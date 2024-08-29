import mongoose from 'mongoose';
import {
  TModule,
  TModuleType,
  TSectionName,
} from '../sensorModuleAttached/sensorModuleAttached.interface';

export type TThreshold = {
  sectionName: string; // threshold name
  temperature: number;
  vibrations: number;
};
export type TAiData = {
  sensorModuleAttached?: mongoose.Types.ObjectId;
  moduleType: TModuleType;
  sectionName: TSectionName;
  // healthStatuses: THealthStatuses;
  sensorData: TModule[];
};
export type TAI = {
  type: 'threshold' | 'aiData';
  threshold?: TThreshold;
  aiData?: TAiData;
};
