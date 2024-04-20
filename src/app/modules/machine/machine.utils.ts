import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TMachine } from './machine.interface';

export const checkMachineData = (payload: Partial<TMachine>) => {
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
};
