import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TSensorModule, TStatus } from './sensorModule.interface';
import { SensorModule } from './sensorModule.model';
import { SensorModuleAttached } from '../sensorModuleAttached/sensorModuleAttached.model';
import mongoose from 'mongoose';
import { Machine } from '../machine/machine.model';
import { SubscriptionPurchased } from '../subscriptionPurchased/subscriptionPurchased.model';

const addSensorModuleIntoDB = async (sensorModule: TSensorModule) => {
  const isMacAddressExists = await SensorModule.isMacAddressExists(
    sensorModule?.macAddress,
  );

  if (isMacAddressExists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'MacAddress has already in used',
    );
  }

  sensorModule.status = 'in-stock';
  const createdSensorModule = await SensorModule.create(sensorModule);

  return createdSensorModule;
};
const getAllSensorModules = async (status: TStatus) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filterQuery: any = {};
  if (status) filterQuery['status'] = status;
  const sensors = await SensorModule.find(filterQuery);

  return sensors;
};
const getSensorModuleByMacAddress = async (macAddress: string) => {
  const sensor = await SensorModule.findOne({
    macAddress,
    status: 'in-stock',
  });

  return sensor;
};
const deleteSensorModule = async (macAddress: string) => {
  // const filterQuery: any = {};
  // if (status) filterQuery['status'] = status;
  // const sensors = await SensorModule.find(filterQuery);
  const sensorModule = await SensorModule.findOne({ macAddress });
  if (!sensorModule) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no sensor module has found with this MacAddress',
    );
  }
  if (sensorModule?.status === 'sold-out') {
    //

    const sensorModuleAttached = await SensorModuleAttached.findOne({
      macAddress,
    });

    if (!sensorModuleAttached) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    }
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      if (sensorModuleAttached?.machine) {
        //

        const updatedMachine = await Machine.updateOne(
          { _id: sensorModuleAttached?.machine },
          {
            $pull: { sensorModulesAttached: sensorModuleAttached?._id },
          },
          {
            session: session,
          },
        );

        if (!updatedMachine?.modifiedCount) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            'something went wrong, please try again',
          );
        }

        // not have machine
        const deletedSensorModule = await SensorModule.deleteOne(
          { macAddress },
          { session },
        );

        if (!deletedSensorModule?.deletedCount) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            'something went wrong, please try again',
          );
        }

        const updatedSubscriptionPurchased =
          await SubscriptionPurchased.findByIdAndUpdate(
            sensorModuleAttached?.subscriptionPurchased?.toString(),
            {
              $pull: {
                'usage.showaUser.IOTs': sensorModuleAttached?._id,
              },
              $inc: {
                'usage.showaUser.totalAvailableIOT': 1,
              },
            },
            {
              session,
            },
          );

        if (!updatedSubscriptionPurchased) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            'Machine could not be deleted',
          );
        }

        const deletedSensorModuleAttached =
          await SensorModuleAttached.deleteOne(
            {
              macAddress,
            },

            { session },
          );

        if (!deletedSensorModuleAttached?.deletedCount) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            'something went wrong, please try again',
          );
        }
      } else {
        // not have machine
        const deletedSensorModule = await SensorModule.deleteOne(
          { macAddress },
          { session },
        );

        if (!deletedSensorModule?.deletedCount) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            'something went wrong, please try again',
          );
        }
        const deletedSensorModuleAttached =
          await SensorModuleAttached.deleteOne(
            {
              macAddress,
            },

            { session },
          );

        if (!deletedSensorModuleAttached?.deletedCount) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            'something went wrong, please try again',
          );
        }
      }

      await session.commitTransaction();
      await session.endSession();

      return;
    } catch (error) {
      //

      await session.abortTransaction();
      await session.endSession();
      throw error;
    }
  } else {
    // do it for in-stock

    const deletedSensorModule = await SensorModule.deleteOne({ macAddress });

    if (deletedSensorModule?.deletedCount) {
      return undefined;
    } else {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    }
  }
};
export const sensorModuleServices = {
  addSensorModuleIntoDB,
  getAllSensorModules,
  getSensorModuleByMacAddress,
  deleteSensorModule,
};
