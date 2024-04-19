import mongoose, { Types } from 'mongoose';
import { TMachine } from './machine.interface';
import { Machine } from './machine.model';
import AppError from '../../errors/AppError';
import { v4 as uuidv4 } from 'uuid';
import { Invoice } from '../invoice/invoice.model';
import httpStatus from 'http-status';
import { TAttachedSensor } from '../sensorModuleAttached/sensorModuleAttached.interface';
import { AttachedSensor } from '../sensorModuleAttached/sensorModuleAttached.model';

const addMachineService = async (payload: TMachine) => {
  try {
    const machine = await Machine.create(payload);
    return machine;
  } catch (error) {
    throw error;
  }
};

const getMyWashingMachineService = async (uid: String) => {
  try {
    const washingMachines = await Machine.find({
      user: uid,
      category: 'washing-machine',
    });
    return washingMachines;
  } catch (error) {
    throw error;
  }
};

const getMyGeneralMachineService = async (uid: String) => {
  try {
    const generalMachines = await Machine.find({
      user: uid,
      category: 'general-machine',
    });
    return generalMachines;
  } catch (error) {
    throw error;
  }
};

const getMachineService = async (id: String) => {
  try {
    const machine = await Machine.findById(id);
    if (!machine) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'There is no machine with this id!',
      );
    }
    return machine;
  } catch (error) {
    throw error;
  }
};

const deleteMachineService = async (id: String) => {
  try {
    const machine = await Machine.findById(id);
    if (!machine) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'There is no machine with this id!',
      );
    }
    machine.deleted = true;
    const deletedMachine = await machine.save();
    return deletedMachine;
  } catch (error) {
    throw error;
  }
};

const changeStatusService = async (id: string) => {
  try {
    const machine = await Machine.findById(id);
    if (!machine) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'There is no machine with this id!',
      );
    }
    if (machine.status === 'normal') {
      machine.status = 'abnormal';
    } else {
      machine.status = 'normal';
    }
    const updatedMachine = await machine.save();
    return updatedMachine;
  } catch (error) {
    throw error;
  }
};

const addSensorService = async (payload: TAttachedSensor, id: String) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const machine = await Machine.findById(id).session(session);

    if (!machine) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'There is no machine with this id!',
      );
    }
    const sensorArray = await AttachedSensor.create([payload], {
      session: session,
    });
    if (!sensorArray?.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'failed to create sesnor');
    }
    machine.sensors?.push(sensorArray[0]._id);
    const updatedMachine = await machine.save({ session: session });

    await session.commitTransaction();
    await session.endSession();

    return updatedMachine;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

export const machineServices = {
  addMachineService,
  getMyWashingMachineService,
  getMyGeneralMachineService,
  getMachineService,
  deleteMachineService,
  changeStatusService,
  addSensorService,
};
