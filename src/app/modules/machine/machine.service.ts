import mongoose, { Types } from 'mongoose';
import { TMachine } from './machine.interface';
import { Machine } from './machine.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { TAttachedSensor } from '../sensorAttached/sensorAttached.interface';
import { AttachedSensor } from '../sensorAttached/sensorAttached.model';

const addMachineService = async (payload: TMachine) => {
  const machine = await Machine.create(payload);
  return machine;
};

const getMyWashingMachineService = async (uid: string | Types.ObjectId) => {
  console.log(`user id fetched from req header: ${uid.toString()}`);
  const washingMachines = await Machine.find({
    user: uid,
    category: 'washing-machine',
  });
  return washingMachines;
};

const getMyGeneralMachineService = async (uid: string | Types.ObjectId) => {
  const generalMachines = await Machine.find({
    user: uid,
    category: 'general-machine',
  });
  return generalMachines;
};

const getMachineService = async (id: string) => {
  const machine = await Machine.findById(id);
  if (!machine) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'There is no machine with this id!',
    );
  }
  return machine;
};

const deleteMachineService = async (id: string) => {
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
};

const changeStatusService = async (id: string) => {
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
};

const addSensorService = async (payload: TAttachedSensor, id: string) => {
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
