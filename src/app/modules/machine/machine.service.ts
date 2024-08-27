import { TMachine, TMachineHealthStatus } from './machine.interface';
import { Machine } from './machine.model';

import { checkMachineData } from './machine.utils';
import { padNumberWithZeros } from '../../utils/padNumberWithZeros';
import mongoose, { Types } from 'mongoose';
import { SensorModuleAttached } from '../sensorModuleAttached/sensorModuleAttached.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { TSensorModuleAttached } from '../sensorModuleAttached/sensorModuleAttached.interface';
import { SensorModule } from '../sensorModule/sensorModule.model';
import { SubscriptionPurchased } from '../subscriptionPurchased/subscriptionPurchased.model';
import { validateSectionNamesData } from '../sensorModuleAttached/sensorModuleAttached.utils';
import { predefinedValueServices } from '../predefinedValue/predefinedValue.service';
import { AI } from '../ai/ai.model';
import { ReservationRequest } from '../reservation/reservation.model';

// implement usages of purchased subscription  ; only for machine
const addNonConnectedMachineInToDB = async ({
  subscriptionPurchased,
  machineData,
}: {
  subscriptionPurchased: string;
  machineData: TMachine;
}) => {
  const subscriptionPurchasedData = await SubscriptionPurchased.findOne({
    _id: new mongoose.Types.ObjectId(subscriptionPurchased),
    user: machineData?.user,
  }).select('isActive usage expDate');

  if (!subscriptionPurchasedData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'subscriptionPurchased you provided is found as you purchased it yet',
    );
  }

  if (!subscriptionPurchasedData?.isActive) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'your subscription has expired, please renew your subscription',
    );
  }
  if (!subscriptionPurchasedData?.usage?.showaUser?.totalAvailableMachine) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already used your all available machine. Please purchase a new subscription',
    );
  }

  await checkMachineData(machineData); // we are validation machine data for handling washing/general machine data according to it's category

  // check purchased subscription here

  // const subscriptionPurchased = await SubscriptionPurchased.findOne({
  //   user: machineData?.user,
  //   isActive: true,

  //   $gt: {
  //     'usage.showaUser.totalAvailableMachine': 0,
  //   },
  // });
  // console.log(subscriptionPurchased);

  machineData.healthStatus = 'unknown';
  const lastAddedMachine = await Machine.findOne(
    { user: machineData?.user },
    { machineNo: 1 },
  ).sort({ _id: -1 });
  machineData.machineNo = padNumberWithZeros(
    Number(lastAddedMachine?.machineNo || '00000') + 1,
    5,
  );
  machineData.subscriptionPurchased = subscriptionPurchasedData?._id;

  // implement session here
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const machineArray = await Machine.create([machineData], { session });

    if (!machineArray?.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Could not create machine, please try again',
      );
    }

    const machine = machineArray[0];
    subscriptionPurchasedData.usage.showaUser.machines.push(machine?._id);

    subscriptionPurchasedData.usage.showaUser.totalAvailableMachine -= 1;

    const updatedSubscriptionPurchasedData =
      await subscriptionPurchasedData.save({ session });

    if (!updatedSubscriptionPurchasedData) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Could not create machine, please try again',
      );
    }
    await session.commitTransaction();
    await session.endSession();

    return machine;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

// implement usages of purchased subscription ; for both of machine and IOT
const addSensorConnectedMachineInToDB = async ({
  sensorModuleMacAddress,
  subscriptionPurchased,
  machineData,
  sensorModuleAttached,
}: {
  sensorModuleMacAddress: string;
  subscriptionPurchased: string;
  machineData: TMachine;
  sensorModuleAttached: Partial<TSensorModuleAttached>;
}) => {
  const subscriptionPurchasedData = await SubscriptionPurchased.findOne({
    _id: new mongoose.Types.ObjectId(subscriptionPurchased),
    user: machineData?.user,
  }).select('isActive usage expDate');

  if (!subscriptionPurchasedData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'subscriptionPurchased you provided is found as you had not purchased it yet',
    );
  }

  if (!subscriptionPurchasedData?.isActive) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'your subscription has expired, please renew your subscription',
    );
  }
  if (!subscriptionPurchasedData?.usage?.showaUser?.totalAvailableMachine) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already used your all available machine. Please purchase a new subscription',
    );
  }
  if (!subscriptionPurchasedData?.usage?.showaUser?.totalAvailableIOT) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already used your all available IOT. Please purchase a new subscription',
    );
  }

  await checkMachineData(machineData); // we are validation machine data for handling washing/general machine data according to it's category

  // create sensor module attached

  const sensorModule = await SensorModule.findOne({
    macAddress: sensorModuleMacAddress,
  });
  if (!sensorModule) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no sensor module has found with this macAddress',
    );
  }
  if (sensorModule?.status === 'sold-out') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'this sensor module has already been sold out with this macAddress',
    );
  }

  // ------------------------
  const isValid = await validateSectionNamesData({
    moduleType: sensorModule?.moduleType,
    sectionNamesData: sensorModuleAttached?.sectionName,
  });

  if (!isValid) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'section names data are not valid according to its module type',
    );
  }

  const sectionNames = await predefinedValueServices.getIotSectionNames();

  sensorModuleAttached?.sectionName?.vibration?.forEach((sectionName) => {
    const isSectionNameValid = sectionNames.some(
      (each) => each === sectionName,
    );
    if (!isSectionNameValid) {
      // throw error
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'section names must be pre defined',
      );
    }
  });
  sensorModuleAttached?.sectionName?.temperature?.forEach((sectionName) => {
    const isSectionNameValid = sectionNames.some(
      (each) => each === sectionName,
    );
    if (!isSectionNameValid) {
      // throw error
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'section names must be pre defined',
      );
    }
  });
  // ------------------------

  sensorModuleAttached.sensorModule = sensorModule._id;
  sensorModuleAttached.macAddress = sensorModuleMacAddress;

  sensorModuleAttached.isSwitchedOn = false;
  sensorModuleAttached.moduleType = sensorModule?.moduleType;
  sensorModuleAttached.subscriptionPurchased = subscriptionPurchasedData?._id;
  sensorModule.status = 'sold-out';

  //  -------------------

  // find purchase sensor for this user and that has available IOT and machine
  // ----------------------

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const updatedSensorModule = await sensorModule.save({ session: session });

    if (!updatedSensorModule) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not purchase sensor module',
      );
    }

    const createdSensorModuleAttachedArray = await SensorModuleAttached.create(
      [sensorModuleAttached],
      {
        session: session,
      },
    );
    if (!createdSensorModuleAttachedArray?.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not purchase sensor module',
      );
    }
    const createdSensorModuleAttached = createdSensorModuleAttachedArray[0];
    // create machine

    machineData.sensorModulesAttached = [createdSensorModuleAttached?._id];
    machineData.healthStatus = 'unknown';
    machineData.subscriptionPurchased = subscriptionPurchasedData?._id;

    const lastAddedMachine = await Machine.findOne(
      { user: machineData?.user },
      { machineNo: 1 },
    ).sort({ _id: -1 });
    machineData.machineNo = padNumberWithZeros(
      Number(lastAddedMachine?.machineNo || '00000') + 1,
      5,
    );

    const machineArray = await Machine.create([machineData], {
      session: session,
    });

    if (!machineArray?.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not created machine, please try again',
      );
    }
    const machine = machineArray[0];
    // const updatedSensorModuleAttached =
    //   await SensorModuleAttached.findByIdAndUpdate(
    //     createdSensorModuleAttached?._id,
    //     {
    //       isAttached: true,
    //       machine: machine?._id,
    //     },
    //     { new: true },
    //   );
    createdSensorModuleAttached.isAttached = true;
    createdSensorModuleAttached.machine = machine?._id;
    const updatedSensorModuleAttached = await createdSensorModuleAttached.save({
      validateBeforeSave: true,
      session,
    });

    if (!updatedSensorModuleAttached) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not created machine, please try again',
      );
    }

    subscriptionPurchasedData.usage.showaUser.machines.push(machine?._id);
    subscriptionPurchasedData.usage.showaUser.IOTs.push(
      updatedSensorModuleAttached?._id,
    );

    subscriptionPurchasedData.usage.showaUser.totalAvailableMachine -= 1;

    subscriptionPurchasedData.usage.showaUser.totalAvailableIOT -= 1;

    const updatedSubscriptionPurchasedData =
      await subscriptionPurchasedData.save({ session });

    if (!updatedSubscriptionPurchasedData) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Could not add machine, please try again',
      );
    }

    await session.commitTransaction();
    await session.endSession();
    return machine;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

// implement usages of purchased subscription   ;  for machine
const addModuleToMachineInToDB = async ({
  sensorModuleMacAddress,
  subscriptionPurchased,
  machine_id,
  sensorModuleAttached,
}: {
  sensorModuleMacAddress: string;
  subscriptionPurchased: string;
  machine_id: Types.ObjectId;
  sensorModuleAttached: Partial<TSensorModuleAttached>;
}) => {
  // ------------------- XXXX ------------ checking subscription start
  const subscriptionPurchasedData = await SubscriptionPurchased.findOne({
    _id: new mongoose.Types.ObjectId(subscriptionPurchased),
    user: sensorModuleAttached.user,
  }).select('isActive usage expDate');

  if (!subscriptionPurchasedData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'subscriptionPurchased you provided is found as you purchased it yet',
    );
  }

  if (!subscriptionPurchasedData?.isActive) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'your subscription has expired, please renew your subscription',
    );
  }
  if (!subscriptionPurchasedData?.usage?.showaUser?.totalAvailableIOT) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already used your all available IOT. Please purchase a new subscription',
    );
  }
  // ------------------- XXXX ----------------checking subscription end

  const sensorModule = await SensorModule.findOne({
    macAddress: sensorModuleMacAddress,
  });
  if (!sensorModule) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no sensor module has found with this macAddress',
    );
  }
  if (sensorModule?.status === 'sold-out') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'this sensor module has already been sold out with this macAddress',
    );
  }

  sensorModuleAttached.sensorModule = sensorModule._id;
  sensorModuleAttached.macAddress = sensorModuleMacAddress;

  sensorModuleAttached.isSwitchedOn = false;
  sensorModuleAttached.moduleType = sensorModule?.moduleType;

  sensorModuleAttached.subscriptionPurchased = subscriptionPurchasedData?._id;

  sensorModule.status = 'sold-out';

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const updatedSensorModule = await sensorModule.save({ session: session });

    if (!updatedSensorModule) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not purchase sensor module',
      );
    }

    const createdSensorModuleAttachedArray = await SensorModuleAttached.create(
      [sensorModuleAttached],
      {
        session: session,
      },
    );
    if (!createdSensorModuleAttachedArray?.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not purchase sensor module',
      );
    }
    const createdSensorModuleAttached = createdSensorModuleAttachedArray[0];
    // create machine

    const machine = await Machine.findByIdAndUpdate(
      machine_id,
      {
        $addToSet: { sensorModulesAttached: createdSensorModuleAttached?._id },
      },

      { session },
    );
    if (!machine) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'this sensor module could not added to machine, please try again',
      );
    }

    createdSensorModuleAttached.isAttached = true;
    createdSensorModuleAttached.machine = machine?._id;
    const updatedSensorModuleAttached = await createdSensorModuleAttached.save({
      validateBeforeSave: true,
      session,
    });

    if (!updatedSensorModuleAttached) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not update machine, please try again',
      );
    }

    subscriptionPurchasedData.usage.showaUser.IOTs.push(
      updatedSensorModuleAttached?._id,
    );

    subscriptionPurchasedData.usage.showaUser.totalAvailableIOT -= 1;

    const updatedSubscriptionPurchasedData =
      await subscriptionPurchasedData.save({ session });

    if (!updatedSubscriptionPurchasedData) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Could not add sensor module, please try again',
      );
    }

    await session.commitTransaction();
    await session.endSession();
    return machine;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

const addSensorAttachedModuleInToMachineIntoDB = async (
  user: Types.ObjectId,
  machine_id: Types.ObjectId,
  sensorModuleAttached_id: Types.ObjectId,
) => {
  const sensorModuleAttached = await SensorModuleAttached.findById(
    sensorModuleAttached_id,
  );
  if (sensorModuleAttached?.isAttached) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'this sensor module has already been attached to machine',
    );
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const updatedSensorModuleAttached =
      await SensorModuleAttached.findByIdAndUpdate(sensorModuleAttached_id, {
        isAttached: true,
        machine: machine_id,
      });

    if (!updatedSensorModuleAttached) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'this sensor module could not added to machine, please try again',
      );
    }
    const updatedMachine = await Machine.findByIdAndUpdate(machine_id, {
      $addToSet: { sensorModulesAttached: sensorModuleAttached_id },
    });
    if (!updatedMachine) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'this sensor module could not added to machine, please try again',
      );
    }
    await session.commitTransaction();
    await session.endSession();
    return { updatedMachine, updatedSensorModuleAttached };
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

const updateMachinePackageStatus = async (
  machine_id: Types.ObjectId,
  packageStatus: string,
) => {
  const updatedMachine = await Machine.findByIdAndUpdate(machine_id, {
    packageStatus: packageStatus,
  });
  if (!updatedMachine) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'this sensor module could not added to machine, please try again',
    );
  }
  return { updatedMachine };
};

const getMyWashingMachineService = async (uerId: Types.ObjectId) => {
  const washingMachines = await Machine.find({
    user: uerId,
    category: 'washing-machine',
  });
  return washingMachines;
};

const getMyGeneralMachineService = async (uerId: Types.ObjectId) => {
  const generalMachines = await Machine.find({
    user: uerId,
    category: 'general-machine',
  });
  return generalMachines;
};

const getUserConnectedMachineService = async (uerId: Types.ObjectId) => {
  const machines = await Machine.find({
    user: uerId,
    sensorModulesAttached: { $ne: [] },
  });
  return machines;
};

const getUserNonConnectedGeneralMachineService = async (
  uerId: Types.ObjectId,
) => {
  const machines = await Machine.find({
    user: uerId,
    sensorModulesAttached: { $size: 0 },
    category: 'general-machine',
  });
  return machines;
};

const deleteMachineService = async (
  machineId: Types.ObjectId,
  userId: Types.ObjectId,
) => {
  const machine = await Machine.findById(machineId);
  if (!machine) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'There is no machine with this id!',
    );
  }
  machine.isDeleted = {
    value: true,
    deletedBy: userId,
  };
  const deletedMachine = await machine.save();
  if (!deletedMachine) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Machine could not be deleted');
  }
  return deletedMachine;
};

const getAllMachineBy_id = async (user_id: string) => {
  const machine = await Machine.find({
    user: new mongoose.Types.ObjectId(user_id),
  });

  return machine;
};
const getMachineBy_id = async (machine: string) => {
  const machineData = await Machine.findById(machine);

  return machineData;
};

const machineHealthStatus = async ({
  machine,
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  machineHealthData,
}: {
  machine: Types.ObjectId;
  machineHealthData: Partial<TMachineHealthStatus>;
}) => {
  const machineData = await Machine.findById(machine, {
    healthStatus: 1,
    sensorModulesAttached: 1,
  });

  if (!machineData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no machine has found with this machine',
    );
  }
  // console.log({
  //   machine,
  //   machineHealthData,
  // });
  machineData.healthStatus = machineHealthData?.healthStatus;
  machineData.issues = machineHealthData?.issues;
  await machineData.save();
  await Promise.all(
    machineHealthData?.sensorModulesAttached?.map(async (each) => {
      await SensorModuleAttached.findByIdAndUpdate(each?._id?.toString(), {
        healthStatuses: each?.healthStatuses,
      });

      // And now save all the sensor data and its health status

      await AI.create({
        type: 'aiData',
        aiData: {
          sensorModuleAttached: each?._id,
          moduleType: each?.moduleType,
          sectionName: each?.sectionName,
          healthStatuses: each?.healthStatuses,
          sensorData: each?.sensorData,
        },
      });
    }),
  );

  return null;
};

const machinePerformanceBrandWise = async () => {
  const brandsData = await predefinedValueServices.getMachineBrands();
  const brandsList = brandsData?.map((each) => each?.brand);
  // return brandsList;

  const machineBrandNamePerformanceArray = await Promise.all(
    brandsList.map(async (brandName) => {
      const machineCount = await Machine.countDocuments({
        brand: brandName,
      });
      const allReservationBrandWise = await ReservationRequest.aggregate([
        {
          $match: {
            status: { $nin: ['completed', 'canceled'] },
          },
        },
        {
          $lookup: {
            from: 'machines', // Name of the showaUser collection
            localField: 'machine',
            foreignField: '_id',
            as: 'machine',
          },
        },
        {
          $unwind: '$machine',
        },
        {
          $replaceRoot: {
            newRoot: '$machine',
          },
        },
        { $match: { brand: brandName } },
        { $count: 'totalReservations' },
      ]);
      const reservationCountBrandWise =
        allReservationBrandWise[0]?.totalReservations || 0;
      // console.log('------', reservationCount);
      let performance: number;

      if (machineCount === 0) {
        performance = null;
      } else {
        performance =
          ((machineCount - reservationCountBrandWise) / machineCount) * 100;
      }

      return { [brandName]: performance };
    }),
  );

  return machineBrandNamePerformanceArray;
};

const machinePerformanceModelWise = async () => {
  const brandsData = await predefinedValueServices.getMachineBrands();

  // console.log(brandsData);
  const modelsList: string[] = [];

  brandsData?.forEach((each) => {
    if (each?.models?.length > 0) {
      // eslint-disable-next-line no-unsafe-optional-chaining
      modelsList.push(...each?.models);
    }
  });

  const machineModelNamePerformanceArray = await Promise.all(
    modelsList.map(async (modelName) => {
      const machineCount = await Machine.countDocuments({
        model: modelName,
      });
      const allReservationModelWise = await ReservationRequest.aggregate([
        {
          $match: {
            status: { $nin: ['completed', 'canceled'] },
          },
        },
        {
          $lookup: {
            from: 'machines', // Name of the showaUser collection
            localField: 'machine',
            foreignField: '_id',
            as: 'machine',
          },
        },
        {
          $unwind: '$machine',
        },
        {
          $replaceRoot: {
            newRoot: '$machine',
          },
        },
        { $match: { model: modelName } },
        { $count: 'totalReservations' },
      ]);
      const reservationCountModelWise =
        allReservationModelWise[0]?.totalReservations || 0;
      // console.log('------', reservationCount);
      let performance: number;

      if (machineCount === 0) {
        performance = null;
      } else {
        performance =
          ((machineCount - reservationCountModelWise) / machineCount) * 100;
      }

      return { [modelName]: performance };
    }),
  );

  return machineModelNamePerformanceArray;
};

export const machineServices = {
  addNonConnectedMachineInToDB,
  addSensorConnectedMachineInToDB,

  addSensorAttachedModuleInToMachineIntoDB,
  updateMachinePackageStatus,
  getMyWashingMachineService,
  getUserConnectedMachineService,
  getMyGeneralMachineService,
  getUserNonConnectedGeneralMachineService,
  getAllMachineBy_id,
  getMachineBy_id,
  deleteMachineService,
  addModuleToMachineInToDB,
  machineHealthStatus,
  machinePerformanceBrandWise,
  machinePerformanceModelWise,
  // changeStatusService,
  // addSensorService,
};

// {
//   _id: new ObjectId('666297956c7f2e81f8c4f2cc')
//   }
