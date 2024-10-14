import mongoose from 'mongoose';
import { THealthStatus } from '../machine/machine.interface';

export type TThreshold = {
  sectionName: string; // threshold name
  temperature: number;
  vibrations: number;
};
export type TAiData = {
  machine: mongoose.Types.ObjectId;
  sectionName: string;
  sensorData: {
    vibration: number;
    temperature: number;
  };
  healthStatus: THealthStatus;
};

export type TMachineForAI = {
  lifeCycle?: {
    // This is for
    totalCycle: number;
    totalMachine: number;
  };
  reservationCycle?: {
    totalCycle: number;
    totalReservation: number;
  };
};
export type TAI = {
  type: 'threshold' | 'aiData' | 'machine';
  threshold?: TThreshold;
  aiData?: TAiData;
  machine?: TMachineForAI;
};
