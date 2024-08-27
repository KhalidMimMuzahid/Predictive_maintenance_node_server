import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TMachine } from './machine.interface';
import { predefinedValueServices } from '../predefinedValue/predefinedValue.service';

export const checkMachineData = async (payload: Partial<TMachine>) => {
  if (payload?.washingMachine && payload?.generalMachine) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This machine must have only one of washingMachine or generalMachine, but you have provided both of them',
    );
  } else if (
    payload?.category === 'washing-machine' &&
    !payload?.washingMachine
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'washing machine must have washingMachine data',
    );
  } else if (
    payload?.category === 'general-machine' &&
    !payload?.generalMachine
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'general machine must have washingMachine data',
    );
  }

  const brandsData = await predefinedValueServices.getMachineBrands();
  const brandsList = brandsData?.brands?.map((each) => each?.brand);

  if (!brandsList.some((each) => each === payload?.brand)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `brand must be any of ${brandsList.reduce((total, current) => {
        total = total + `${current}, `;
        return total;
      }, '')}`,
    );
  }

  const models = brandsData?.brands?.find(
    (each) => each?.brand === payload?.brand,
  )?.models;

  if (!models.some((each) => each === payload?.model)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `model Name must be any of ${models.reduce((total, current) => {
        total = total + `${current}, `;
        return total;
      }, '')}`,
    );
  }
};
