import { Types } from 'mongoose';
import { TPostBiddingProcess } from '../reservationGroup/reservationGroup.interface';
import { TIsDeleted } from '../common/common.interface';






export type TInspecting = {
  additionalProducts?: {
    products?: {
      productName: string;
      cost: {
        price: number;
        quantity: number;
      };
    }[];
    documents?: {
      url: string;
      fileName?: string;
      fileType: string;
    }[];
  };
  inspection?: {
    serviceFee?: number;
    operatorInformation?: {
      heightOfOperator: number; // in CM
      weightOfOperator: number; // in KGs
      ageOfOperator: number; // in years
      genderOfOperator: 'male' | 'female';
      numberOfOperators: number;
      operatingDistance: number; // in meter
      workingDurations: number; //
    };
    machineEnvironment?: {
      temperature: number; // in celsius
      humidity: number; // in percent
      drainageLiquidTemperature: number; // in celsius
      steamDrain: number; //
      noiseLevel: number; // in Decibel
      runningTimePerDay: number; // in hours
      weightOfTheMachine: number; // in KGs
    };
    observation?: string;
  };
};
export type TAdditionalProduct = {
  addedBy?: Types.ObjectId; // ServiceProviderEngineer model

  addedByUserType: 'showaAdmin' | 'serviceProviderEngineer';
  productName: string;

  // quantity: number;
  // promo:number // percentage of promo ; by default 0%   // is it the same of discount offer? what is actually a promo?

  cost: {
    price: number;
    quantity: number;
    tax?: number; // percentage of tax ; by default 0%
    totalAmount: number;
    // currency: string;
  };
};
export type TDocument = {
  url: string;
  fileName: string;
  fileType: string;
};
export type TInspection = {
  isInspecting?: boolean;
  inspectingTime?: number[]; // time in minutes
  serviceFee?: number;
  operatorInformation?: {
    heightOfOperator: number; // in CM
    weightOfOperator: number; // in KGs
    ageOfOperator: number; // in years
    genderOfOperator: 'male' | 'female';
    numberOfOperators: number;
    operatingDistance: number; // in meter
    workingDurations: number; //
  };
  machineEnvironment?: {
    temperature: number; // in celsius
    humidity: number; // in percent
    drainageLiquidTemperature: number; // in celsius
    steamDrain: number; //
    noiseLevel: number; // in Decibel
    runningTimePerDay: number; // in hours
    weightOfTheMachine: number; // in KGs
  };
  observation?: string;
};
export type TInvoice = {
  invoiceNo: string; // customized unique number

  reservationRequest: Types.ObjectId; // objectId of ReservationRequest  model
  reservationRequestGroup: Types.ObjectId;
  invoiceGroup: Types.ObjectId; // objectId of InvoiceGroup model

  user: Types.ObjectId; // objectId of the user model; who raise this reservation

  // inspectionByEngineer: report
  postBiddingProcess?: TPostBiddingProcess;
  additionalProducts: {
    products: TAdditionalProduct[];
    documents: TDocument[];
    // isRequiredRescheduled: boolean;
    totalAmount: number;
    isPaid?: boolean; // isPaid field should go to 1 level upper from this object
  };
  inspection?: TInspection;

  taskStatus: 'ongoing' | 'completed' | 'canceled'; // last three status of reservationRequest Model status, you can see the reservationRequest Model

  // we nee feedbackBy engineer
  feedbackByUser?: {
    ratings: number;
    comment: string;
  };

  isDeleted: TIsDeleted;
};
