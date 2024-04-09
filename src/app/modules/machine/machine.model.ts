import mongoose, { Schema } from 'mongoose';
import { CompanySchema } from '../common/common.model';
import { TMachine } from './machine.interface';

export const MachineSchema: Schema = new Schema({
  machineNo: { type: String, required: true },
  status: { type: String, enum: ['abnormal', 'normal'], required: true },
  category: {
    type: String,
    enum: ['washing-machine', 'general-machine'],
    required: true,
  },
  name: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  usedFor: { type: CompanySchema, required: true },
  generalMachine: {
    homeName: { type: String },
    homeType: { type: String },
  },
  washingMachine: {
    type: { type: String },
  },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  environment: { type: String, enum: ['indoor', 'outdoor'], required: true },
  sensors: [{ type: Schema.Types.ObjectId, ref: 'AttachedSensor' }],
});
export const Machine = mongoose.model<TMachine>('Invoice', MachineSchema);
