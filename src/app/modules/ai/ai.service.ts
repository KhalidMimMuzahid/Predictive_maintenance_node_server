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
    'threshold.category': thresholdData.category,
    'threshold.type': thresholdData.type,
    'threshold.brand': thresholdData.brand,
    'threshold.model': thresholdData.model,
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

const getThresholds = async ({
  category,
  type,
  brand,
  model,
}: {
  category: string;
  type: string;
  brand: string;
  model: string;
}) => {
  const sections = await predefinedValueServices.getIotSectionNames();
  // console.log(sections);

  const processedData = await Promise.all(
    sections?.map(async (sectionName) => {
      const thresholdData = await AI.findOne({
        type: 'threshold',
        'threshold.category': category,
        'threshold.type': type,
        'threshold.brand': brand,
        'threshold.model': model,
        'threshold.sectionName': sectionName,
      });

      return {
        category,
        type,
        brand,
        model,
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

  const totalCycle = machineAI?.machine?.reservationCycle?.totalCycle || 0;
  const totalReservation =
    machineAI?.machine?.reservationCycle?.totalReservation || 0;

  const standardReservationCycleForMachine = 356000; // 5 *356* 200  for five years
  const averageReservationCycle =
    (totalCycle + standardReservationCycleForMachine) / (totalReservation + 1); // we are adding 1 here because of adding standardReservationCycleForMachine with totalCycle
  const machineCycleCountInReservationPeriod =
    machineData?.cycleCount?.reservationPeriod || 0;

  return Math.ceil(
    (averageReservationCycle - machineCycleCountInReservationPeriod) / 200,
  );
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

  const totalCycle = machineAI?.machine?.lifeCycle?.totalCycle || 0;
  const totalMachine = machineAI?.machine?.lifeCycle?.totalMachine || 0;
  const standardLifeCycleForMachine = 730000; // 10 *356* 200  for five years
  const averageLifeCycle =
    (totalCycle + standardLifeCycleForMachine) / (totalMachine + 1); // we are adding 1 here because of adding standardLifeCycleForMachine with totalCycle;
  const machineCycleCountInLife = machineData?.cycleCount?.life || 0;

  return Math.ceil((averageLifeCycle - machineCycleCountInLife) / 200);
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
