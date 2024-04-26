import { TMachine } from './machine.interface';
import { Machine } from './machine.model';

import { checkMachineData } from './machine.utils';
import { padNumberWithZeros } from '../../utils/padNumberWithZeros';
import mongoose, { Types } from 'mongoose';
import { SensorModuleAttached } from '../sensorModuleAttached/sensorModuleAttached.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { TSensorModuleAttached } from '../sensorModuleAttached/sensorModuleAttached.interface';
import { SensorModule } from '../sensorModule/sensorModule.model';

const addNonConnectedMachineInToDB = async (payload: TMachine) => {
  checkMachineData(payload); // we are validation machine data for handling washing/general machine data according to it's category

  const machineData = payload;
  machineData.status = 'normal';
  const lastAddedMachine = await Machine.findOne(
    { user: machineData?.user },
    { machineNo: 1 },
  ).sort({ _id: -1 });
  machineData.machineNo = padNumberWithZeros(
    Number(lastAddedMachine?.machineNo || '0000') + 1,
    4,
  );
  const machine = await Machine.create(machineData);
  return machine;
};



const addSensorConnectedMachineInToDB = async (payload: {
  sensorModuleMacAddress: string;
  machineData: TMachine;
  sensorModuleAttached: Partial<TSensorModuleAttached>;
}) => {
  const { sensorModuleMacAddress, machineData, sensorModuleAttached } = payload;
  checkMachineData(machineData); // we are validation machine data for handling washing/general machine data according to it's category

  // create sensor module attached

  const sensorModule = await SensorModule.findOne({
    macAddress: sensorModuleMacAddress,
  });
  if (!sensorModule) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no sensor module has found with this macAddress',
    );
  }
  if (sensorModule?.status === 'sold-out') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'this sensor module has already been sold out with this macAddress',
    );
  }

  sensorModuleAttached.sensorModule = sensorModule._id;
  sensorModuleAttached.macAddress = sensorModuleMacAddress;

  sensorModuleAttached.isSwitchedOn = false;
  sensorModuleAttached.moduleType = sensorModule?.moduleType;

  sensorModule.status = 'sold-out';

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const updatedSensorModule = await sensorModule.save({ session: session });

    if (!updatedSensorModule) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not purchase sensor module',
      );
    }

    const createdSensorModuleAttachedArray = await SensorModuleAttached.create(
      [sensorModuleAttached],
      {
        session: session,
      },
    );
    if (!createdSensorModuleAttachedArray?.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not purchase sensor module',
      );
    }
    const createdSensorModuleAttached = createdSensorModuleAttachedArray[0];
    // create machine

    machineData.sensorModulesAttached = [createdSensorModuleAttached?._id];
    machineData.status = 'normal';
    const lastAddedMachine = await Machine.findOne(
      { user: machineData?.user },
      { machineNo: 1 },
    ).sort({ _id: -1 });
    machineData.machineNo = padNumberWithZeros(
      Number(lastAddedMachine?.machineNo || '0000') + 1,
      4,
    );
    const machineArray = await Machine.create([machineData], {
      session: session,
    });

    if (!machineArray?.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not created machine, please try again',
      );
    }
    const machine = machineArray[0];
    const updatedSensorModuleAttached =
      await SensorModuleAttached.findByIdAndUpdate(
        createdSensorModuleAttached?._id,
        {
          isAttached: true,
          machine: machine?._id,
        },
        { new: true },
      );
    if (!updatedSensorModuleAttached) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not created machine, please try again',
      );
    }
    await session.commitTransaction();
    await session.endSession();
    return machine;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

const addSensorAttachedModuleInToMachineIntoDB = async (
  user: Types.ObjectId,
  machine_id: Types.ObjectId,
  sensorModuleAttached_id: Types.ObjectId,
) => {
  const sensorModuleAttached = await SensorModuleAttached.findById(
    sensorModuleAttached_id,
  );
  if (sensorModuleAttached?.isAttached) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'this sensor module has already been attached to machine',
    );
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const updatedSensorModuleAttached =
      await SensorModuleAttached.findByIdAndUpdate(sensorModuleAttached_id, {
        isAttached: true,
        machine: machine_id,
      });

    if (!updatedSensorModuleAttached) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'this sensor module could not added to machine, please try again',
      );
    }
    const updatedMachine = await Machine.findByIdAndUpdate(machine_id, {
      $addToSet: { sensorModulesAttached: sensorModuleAttached_id },
    });
    if (!updatedMachine) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'this sensor module could not added to machine, please try again',
      );
    }
    await session.commitTransaction();
    await session.endSession();
    return { updatedMachine, updatedSensorModuleAttached };
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

// const getMyWashingMachineService = async (uid: String) => {
//   try {
//     const washingMachines = await Machine.find({
//       user: uid,
//       category: 'washing-machine',
//     });
//     return washingMachines;
//   } catch (error) {
//     throw error;
//   }
// };

// const getMyGeneralMachineService = async (uid: String) => {
//   try {
//     const generalMachines = await Machine.find({
//       user: uid,
//       category: 'general-machine',
//     });
//     return generalMachines;
//   } catch (error) {
//     throw error;
//   }
// };

// const getMachineService = async (id: String) => {
//   try {
//     const machine = await Machine.findById(id);
//     if (!machine) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         'There is no machine with this id!',
//       );
//     }
//     return machine;
//   } catch (error) {
//     throw error;
//   }
// };

// const deleteMachineService = async (id: String) => {
//   try {
//     const machine = await Machine.findById(id);
//     if (!machine) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         'There is no machine with this id!',
//       );
//     }
//     machine.deleted = true;
//     const deletedMachine = await machine.save();
//     return deletedMachine;
//   } catch (error) {
//     throw error;
//   }
// };

// const changeStatusService = async (id: string) => {
//   try {
//     const machine = await Machine.findById(id);
//     if (!machine) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         'There is no machine with this id!',
//       );
//     }
//     if (machine.status === 'normal') {
//       machine.status = 'abnormal';
//     } else {
//       machine.status = 'normal';
//     }
//     const updatedMachine = await machine.save();
//     return updatedMachine;
//   } catch (error) {
//     throw error;
//   }
// };

// const addSensorService = async (payload: TAttachedSensor, id: String) => {
//   const session = await mongoose.startSession();
//   try {
//     session.startTransaction();
//     const machine = await Machine.findById(id).session(session);

//     if (!machine) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         'There is no machine with this id!',
//       );
//     }
//     const sensorArray = await AttachedSensor.create([payload], {
//       session: session,
//     });
//     if (!sensorArray?.length) {
//       throw new AppError(httpStatus.BAD_REQUEST, 'failed to create sesnor');
//     }
//     machine.sensors?.push(sensorArray[0]._id);
//     const updatedMachine = await machine.save({ session: session });

//     await session.commitTransaction();
//     await session.endSession();

//     return updatedMachine;
//   } catch (error) {
//     await session.abortTransaction();
//     await session.endSession();
//     throw error;
//   }
// };

export const machineServices = {
  addNonConnectedMachineInToDB,
  addSensorConnectedMachineInToDB,
  addSensorAttachedModuleInToMachineIntoDB,
  // getMyWashingMachineService,
  // getMyGeneralMachineService,
  // getMachineService,
  // deleteMachineService,
  // changeStatusService,
  // addSensorService,
};
