import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TMachine } from './machine.interface';
import { predefinedValueServices } from '../predefinedValue/predefinedValue.service';

export const checkMachineData = async (machineData: Partial<TMachine>) => {
  if (machineData?.washingMachine && machineData?.generalMachine) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This machine must have only one of washingMachine or generalMachine, but you have provided both of them',
    );
  } else if (
    machineData?.category === 'washing-machine' &&
    !machineData?.washingMachine
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'washing machine must have washingMachine data',
    );
  } else if (
    machineData?.category === 'general-machine' &&
    !machineData?.generalMachine
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'general machine must have generalMachine data',
    );
  }

  const brandsList = await predefinedValueServices.getMachineBrands({
    category: machineData?.category,
    type:
      machineData?.category === 'general-machine'
        ? machineData?.generalMachine?.type
        : machineData?.washingMachine?.type,
  });

  if (!brandsList.some((each) => each === machineData?.brand)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `brand must be any of ${brandsList.reduce((total, current) => {
        total = total + `${current}, `;
        return total;
      }, '')}`,
    );
  }

  const models = await predefinedValueServices.getMachineModels({
    category: machineData?.category,
    type:
      machineData?.category === 'general-machine'
        ? machineData?.generalMachine?.type
        : machineData?.washingMachine?.type,
    brand: machineData?.brand,
  });

  if (!models.some((each) => each === machineData?.model)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `model Name must be any of ${models.reduce((total, current) => {
        total = total + `${current}, `;
        return total;
      }, '')}`,
    );
  }

  const machineType =
    machineData?.category === 'washing-machine'
      ? machineData?.washingMachine?.type
      : machineData?.generalMachine?.type;
  const machineTypes =
    await predefinedValueServices.getAllMachineTypesCategoryWise({
      category: machineData?.category,
    });
  if (!machineTypes.some((each) => each === machineType)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `${machineData?.category} type must be any of ${machineTypes.reduce(
        (total, current) => {
          total = total + `${current}, `;
          return total;
        },
        '',
      )}`,
    );
  }
};
