import mongoose, { Schema } from 'mongoose';
import { SensorModuleModel, TSensorModule } from './sensorModule.interface';
import { IsDeletedSchema } from '../common/common.model';

export const SensorModuleSchema = new Schema<TSensorModule, SensorModuleModel>(
  {
    // sensorModuleId: { type: String, required: true },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    name: { type: String, required: true },
    macAddress: { type: String, unique: true, required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['in-stock', 'sold-out'], required: true },
    moduleType: {
      type: String,
      enum: ['module-1', 'module-2', 'module-3', 'module-4'],
      required: true,
    },
    isDeleted: {
      type: IsDeletedSchema,
      required: true,
      default: { value: false },
    },
  },
  {
    timestamps: true,
  },
);
SensorModuleSchema.pre('find', function (next) {
  this.find({ 'isDeleted.value': { $ne: true } });
  next();
});
SensorModuleSchema.pre('findOne', function (next) {
  this.find({ 'isDeleted.value': { $ne: true } });
  next();
});















SensorModuleSchema.statics.isMacAddressExists = async (macAddress: string) => {
  const existingSensorModule = SensorModule.findOne({ macAddress });
  return existingSensorModule;
};

// Create and export the model
export const SensorModule = mongoose.model<TSensorModule, SensorModuleModel>(
  'SensorModule',
  SensorModuleSchema,
);
