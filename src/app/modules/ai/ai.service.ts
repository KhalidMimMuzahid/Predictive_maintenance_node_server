import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { predefinedValueServices } from '../predefinedValue/predefinedValue.service';
import { TThreshold } from './ai.interface';
import { AI } from './ai.model';
import { ReservationRequest } from '../reservation/reservation.model';
import { addDays } from '../../utils/addDays';
import { Machine } from '../machine/machine.model';
import mongoose from 'mongoose';

const addThreshold = async ({
  thresholdData,
}: {
  thresholdData: TThreshold;
}) => {
  const sectionNames = await predefinedValueServices.getIotSectionNames();
  const isSectionNameValid = sectionNames.some(
    (each) => each === thresholdData?.sectionName,
  );
  if (!isSectionNameValid) {
    // throw error
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'section names must be pre defined',
    );
  }

  const previousThresholdData = await AI.findOne({
    type: 'threshold',
    'threshold.sectionName': thresholdData?.sectionName,
  });

  if (!previousThresholdData) {
    const createdThresholdData = await AI.create({
      type: 'threshold',
      threshold: thresholdData,
    });

    if (!createdThresholdData) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    } else {
      return createdThresholdData;
    }
  } else {
    if (thresholdData?.temperature) {
      previousThresholdData.threshold.temperature = thresholdData?.temperature;
    }
    if (thresholdData?.vibrations) {
      previousThresholdData.threshold.vibrations = thresholdData?.vibrations;
    }

    const updatedThresholdData = await previousThresholdData.save();

    if (!updatedThresholdData) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    } else {
      return updatedThresholdData;
    }
  }
};

const getThresholds = async () => {
  const sections = await predefinedValueServices.getIotSectionNames();
  // console.log(sections);

  const processedData = await Promise.all(
    sections?.map(async (sectionName) => {
      const thresholdData = await AI.findOne({
        type: 'threshold',
        'threshold.sectionName': sectionName,
      });

      return {
        sectionName: sectionName,
        temperature: thresholdData?.threshold?.temperature || null,
        vibrations: thresholdData?.threshold?.vibrations || null,
      };
    }),
  );

  return processedData;
};
const getAiData = async () => {
  const startDate = addDays(-7);
  const thresholdData = await AI.aggregate([
    {
      $match: {
        type: 'aiData',
        $and: [{ createdAt: { $gte: startDate } }],
      },
    },
    {
      $unwind: '$aiData',
    },

    {
      $replaceRoot: {
        newRoot: '$aiData',
      },
    },
    {
      $project: {
        sectionName: 1,
        healthStatus: 1,
        sensorData: 1,
      },
    },
  ]);
  return thresholdData;
};

const aiPerformance = async () => {
  const totalReservationCount = await ReservationRequest.countDocuments({});
  const totalInValidReservationCount = await ReservationRequest.countDocuments({
    isValid: false,
  });
  const performance =
    ((totalReservationCount - totalInValidReservationCount) /
      totalReservationCount) *
    100;
  return performance;
};

const getMaintenanceDueByMachine = async (machine: string) => {
  const machineData = await Machine.findById(machine);
  if (!machineData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no machine found with the id you provided',
    );
  }

  const machineAI = await AI.findOne({
    type: 'machine',
  }).select('machine');

  if (
    !machineAI?.machine?.reservationCycle?.totalCycle ||
    !machineAI?.machine?.reservationCycle?.totalReservation
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'AI has no enough data to generate maintenance due',
    );
  }
  const averageReservationCycle =
    machineAI?.machine?.reservationCycle?.totalCycle /
    machineAI?.machine?.reservationCycle?.totalReservation;
  const machineCycleCountInReservationPeriod =
    machineData?.cycleCount?.reservationPeriod || 0;

  return averageReservationCycle - machineCycleCountInReservationPeriod;
};

const getLifeCycleByMachine = async (machine: string) => {
  const machineData = await Machine.findById(machine);
  if (!machineData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no machine found with the id you provided',
    );
  }

  const machineAI = await AI.findOne({
    type: 'machine',
  }).select('machine');

  if (
    !machineAI?.machine?.lifeCycle?.totalCycle ||
    !machineAI?.machine?.lifeCycle?.totalMachine
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'AI has no enough data to generate life cycle',
    );
  }
  const averageLifeCycle =
    machineAI?.machine?.lifeCycle?.totalCycle /
    machineAI?.machine?.lifeCycle?.totalMachine;
  const machineCycleCountInLife = machineData?.cycleCount?.life || 0;

  return averageLifeCycle - machineCycleCountInLife;
};

const getMachineBadSections = async (machine: string) => {
  const sectionNames = await predefinedValueServices.getIotSectionNames();

  const badSectionNames = await Promise.all(
    sectionNames?.map(async (sectionName) => {
      const predefinedValueForAiData = await AI.findOne({
        type: 'aiData',
        'aiData.machine': new mongoose.Types.ObjectId(machine),
        'aiData.sectionName': sectionName,
      }).sort({ _id: -1 });
      const badHealthStatus =
        predefinedValueForAiData?.aiData?.healthStatus === 'bad'
          ? sectionName
          : null;
      return badHealthStatus;
    }),
  );
  return badSectionNames?.filter((each) => each);
};
export const aiServices = {
  addThreshold,
  getThresholds,
  getAiData,
  aiPerformance,
  getMaintenanceDueByMachine,
  getLifeCycleByMachine,
  getMachineBadSections,
};
