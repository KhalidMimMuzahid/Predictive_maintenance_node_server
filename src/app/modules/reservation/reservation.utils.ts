import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TMachineForAI } from '../ai/ai.interface';
import { AI } from '../ai/ai.model';
import mongoose from 'mongoose';
import { TMachine } from '../machine/machine.interface';

export const countLifeCycle = async ({
  machineData,
  session,
}: {
  // eslint-disable-next-line @typescript-eslint/ban-types
  machineData: mongoose.Document<unknown, {}, TMachine> &
    TMachine & {
      _id: mongoose.Types.ObjectId;
    } & {
      __v?: number;
    };
  session: mongoose.mongo.ClientSession;
}) => {
  // count cycleCount and reservation count for estimate life cycle for next reservation
  const machineDataAI = await AI.findOne({
    type: 'machine',
  }).select('machine');

  const newMachineDataAI: Partial<TMachineForAI> = machineDataAI?.machine || {};

  const newReservationCycle = machineDataAI?.machine?.reservationCycle || {
    totalCycle: 0,
    totalReservation: 0,
  };
  newMachineDataAI.reservationCycle = {
    totalCycle:
      newReservationCycle?.totalCycle +
      (machineData?.cycleCount?.reservationPeriod || 0),
    totalReservation: newReservationCycle?.totalReservation + 1,
  };
  if (machineDataAI) {
    machineDataAI.machine = newMachineDataAI;

    const updatedMachineDataAI = await machineDataAI.save({ session });
    if (!updatedMachineDataAI) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not create reservation request, please try again',
      );
    }
  } else {
    const createdMachineDataAIArray = await AI.create(
      [
        {
          type: 'machine',
          machine: newMachineDataAI,
        },
      ],
      { session },
    );
    const createdMachineDataAI = createdMachineDataAIArray[0];
    if (!createdMachineDataAI) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not create reservation request, please try again',
      );
    }
  }
  // {
  //   lifeCycle: {
  //     totalCycle: 0,
  //     totalMachine: 0,
  //   },
  //   reservationCycle: {
  //     totalCycle: 0,
  //     totalReservation: 0,
  //   },
  // };

  // reset machine cycle count for reservationPeriod to zero (0)
  const newCycleCount = machineData.cycleCount || {
    life: 0,
    reservationPeriod: 0,
  };
  newCycleCount.reservationPeriod = 0;
  machineData.cycleCount = newCycleCount;
  const updatedMachineData = await machineData.save({ session });
  if (!updatedMachineData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'could not create reservation request, please try again',
    );
  }
  return;
};
