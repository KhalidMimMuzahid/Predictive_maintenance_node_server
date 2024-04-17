import mongoose, { Types } from 'mongoose';
import { TMachine } from './machine.interface';
import { Machine } from './machine.model';
import AppError from '../../errors/AppError';
import { v4 as uuidv4 } from 'uuid';
import { Invoice } from '../invoice/invoice.model';

const addMachineService = async (payload: TMachine) => {
  try {
    const machine = await Machine.create(payload);
    return machine;
  } catch (error) {
    throw error;
  }
};

export const machineServices = {
  addMachineService
};