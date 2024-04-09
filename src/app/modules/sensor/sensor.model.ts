import { Schema } from 'mongoose';
import { TSensor } from './sensor.interface';

export const SensorSchema: Schema = new Schema<TSensor>({
  sensorId: { type: String, required: true },
  name: { type: String, required: true },
  macAddress: { type: String, unique: true, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['in-stock', 'sold-out'], required: true },
  module: {
    type: String,
    enum: ['module-1', 'module-2', 'module-3', 'module-4'],
    required: true,
  },
});
