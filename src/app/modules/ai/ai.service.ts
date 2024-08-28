import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { predefinedValueServices } from '../predefinedValue/predefinedValue.service';
import { TThreshold } from './ai.interface';
import { AI } from './ai.model';
import { ReservationRequest } from '../reservation/reservation.model';

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
  const thresholdData = await AI.find({
    type: 'threshold',
  });
  const processedData = thresholdData?.map((each) => {
    return {
      sectionName: each?.threshold?.sectionName,
      temperature: each?.threshold?.temperature,
      vibrations: each?.threshold?.vibrations,
    };
  });
  return processedData;
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
export const aiServices = {
  addThreshold,
  getThresholds,
  aiPerformance,
};
