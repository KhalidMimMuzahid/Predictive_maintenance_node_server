import { TIssue, TMachine, TMachineHealthStatus } from './machine.interface';
import { Machine } from './machine.model';

import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import { padNumberWithZeros } from '../../utils/padNumberWithZeros';
import { predefinedValueServices } from '../predefinedValue/predefinedValue.service';
import { SensorModule } from '../sensorModule/sensorModule.model';
import { TSensorModuleAttached } from '../sensorModuleAttached/sensorModuleAttached.interface';
import { SensorModuleAttached } from '../sensorModuleAttached/sensorModuleAttached.model';
import { validateSectionNamesData } from '../sensorModuleAttached/sensorModuleAttached.utils';
import { SubscriptionPurchased } from '../subscriptionPurchased/subscriptionPurchased.model';
import { checkMachineData } from './machine.utils';

import { Request } from 'express';
import { TAddress } from '../common/common.interface';
import { timeDifference } from '../../utils/timeDifference';
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
      'subscriptionPurchased you provided is found as you has not purchased it yet',
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

  // machineData.healthStatus = 'unknown';
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
    // machineData.healthStatus = 'unknown';
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
      'subscriptionPurchased you provided is found as you has not purchased it yet',
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

const updateAddress = async ({
  document_id,
  address,
}: {
  document_id: string;
  address: TAddress;
}) => {
  const previousMachine = await Machine.findById(document_id);

  const updateDocument: Partial<TAddress> =
    previousMachine?.usedFor?.address || {};
  if (address?.buildingName) {
    updateDocument['buildingName'] = address?.buildingName;
  }
  if (address?.city) {
    updateDocument['city'] = address?.city;
  }
  if (address?.country) {
    updateDocument['country'] = address?.country;
  }

  if (address?.details) {
    updateDocument['details'] = address?.details;
  }
  if (address?.googleString) {
    updateDocument['googleString'] = address?.googleString;
  }
  if (address?.location) {
    updateDocument['location'] = address?.location;
  }
  if (address?.postalCode) {
    updateDocument['postalCode'] = address?.postalCode;
  }
  if (address?.prefecture) {
    updateDocument['prefecture'] = address?.prefecture;
  }
  if (address?.roomNumber) {
    updateDocument['roomNumber'] = address?.roomNumber;
  }
  if (address?.state) {
    updateDocument['state'] = address?.state;
  }
  if (address?.street) {
    updateDocument['street'] = address?.street;
  }
  // previousMachine.usedFor.address = updateDocument;
  const result = await Machine.findByIdAndUpdate(
    document_id,
    {
      'usedFor.address': updateDocument,
    },
    { new: true },
  );

  return result;
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
  machine.sensorModulesAttached = [];
  machine.subscriptionPurchased = undefined;
  machine.isDeleted = {
    value: true,
    deletedBy: userId,
  };

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const deletedMachine = await machine.save({ session });
    if (!deletedMachine) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Machine could not be deleted',
      );
    }

    if (machine?.subscriptionPurchased?.toString()) {
      const updatedSubscriptionPurchased =
        await SubscriptionPurchased.findByIdAndUpdate(
          machine?.subscriptionPurchased?.toString(),
          {
            $pull: {
              'usage.showaUser.machines': machineId,
            },
            $inc: {
              'usage.showaUser.totalAvailableMachine': 1,
            },
          },
          {
            session,
          },
        );

      if (!updatedSubscriptionPurchased) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Machine could not be deleted',
        );
      }
    }

    const deTouchedIOTs = await Promise.all(
      machine?.sensorModulesAttached?.map(async (each) => {
        const deTouchedIOT = await SensorModuleAttached.findByIdAndUpdate(
          each?.toString(),
          {
            isAttached: false,
            $unset: {
              machine: '',
            },
          },
          {
            session,
          },
        );
        return deTouchedIOT;
      }),
    );

    if (deTouchedIOTs?.length !== machine?.sensorModulesAttached?.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Machine could not be deleted',
      );
    }

    await session.commitTransaction();
    await session.endSession();
    return null;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }

  return 'deletedMachine';
};

const getAllMachineBy_id = async (user_id: string) => {
  const machine = await Machine.find({
    user: new mongoose.Types.ObjectId(user_id),
  });

  return machine;
};
const getAllSensorSectionWiseByMachine = async (machine: string) => {
  // const machineData = await Machine.findById(machine);
  // TODO:  "machine="
  // {
  //   machine: "machine_id",
  //   sensorModuleAttached: "sensorModuleAttached_id",
  //   sensorType: "temperature" or "vibration",
  //   sensorId: "index no of this sensor"
  // }

  const sensorModuleAttachedData = await Machine.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(machine),
      },
    },
    {
      $lookup: {
        from: 'sensormoduleattacheds',
        localField: 'sensorModulesAttached',
        foreignField: '_id',
        as: 'sensorModulesAttached',
      },
    },
    {
      $unwind: '$sensorModulesAttached',
    },

    {
      $replaceRoot: {
        newRoot: '$sensorModulesAttached',
      },
    },

    // 66de94702cb33950bc34853c
    {
      $project: {
        _id: 1,
        // sensorModulesAttached: 1,
        macAddress: 1,
        sectionName: 1,
        moduleType: 1,
      },
    },
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reFactoringData: any = {};
  // console.log(sensorModuleAttachedData);
  sensorModuleAttachedData?.forEach((currentValue) => {
    // console.log(currentValue);

    currentValue?.sectionName?.vibration?.forEach(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any, index: number) => {
        reFactoringData[item] = reFactoringData[item]
          ? [
              ...reFactoringData[item],
              {
                machine,
                sensorModuleAttached: currentValue?._id,
                macAddress: currentValue?.macAddress,
                sensorType: 'vibration',
                sensorPosition: index,
              },
            ]
          : (reFactoringData[item] = [
              {
                machine,
                sensorModuleAttached: currentValue?._id,
                macAddress: currentValue?.macAddress,
                sensorType: 'vibration',
                sensorPosition: index,
              },
            ]);
      },
    );
    currentValue?.sectionName?.temperature?.forEach(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any, index: number) => {
        reFactoringData[item] = reFactoringData[item]
          ? [
              ...reFactoringData[item],
              {
                machine,
                sensorModuleAttached: currentValue?._id,
                macAddress: currentValue?.macAddress,
                sensorType: 'temperature',
                sensorPosition: index,
              },
            ]
          : (reFactoringData[item] = [
              {
                machine,
                sensorModuleAttached: currentValue?._id,
                macAddress: currentValue?.macAddress,
                sensorType: 'temperature',
                sensorPosition: index,
              },
            ]);
      },
    );
  });
  // return sensorModuleAttachedData;
  const result = await Promise.all(
    Object.keys(reFactoringData)?.map(async (sectionName) => {
      const aiData = await AI.findOne({
        type: 'aiData',
        'aiData.machine': new mongoose.Types.ObjectId(machine),
        'aiData.sectionName': sectionName,
      }).sort({
        createdAt: -1,
      });

      return {
        [sectionName]: {
          sensors: reFactoringData[sectionName],
          healthStatus: aiData?.aiData?.healthStatus,
        },
      };
    }),
  );
  return {
    // sensorModuleAttachedData,
    // reFactoringData,
    result,
  };
};
const getMachineBy_id = async (machine: string) => {
  console.log(machine);
  const machineData = await Machine.findById({
    _id: new mongoose.Types.ObjectId(machine),
  });
  console.log({ machineData });
  return machineData;
};

const machineHealthStatus = async ({
  machine,
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  machineHealthData,
  req,
}: {
  machine: Types.ObjectId;
  machineHealthData: Partial<TMachineHealthStatus>;
  req: Request;
}) => {
  const machineData = await Machine.findById(machine, {
    healthStatus: 1,
    issues: 1,
    // sensorModulesAttached: 1,
  });
  if (!machineData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no machine has found with this machine',
    );
  }

  const now = new Date(Date.now());

  // console.log({
  //   machine,
  //   machineHealthData,
  // });
  if (machineData.healthStatus?.health !== machineHealthData?.healthStatus) {
    machineData.healthStatus = {
      health: machineHealthData?.healthStatus,
    };
    req.io.emit(`machine=${machine?.toString()}`, {
      healthStatus: machineHealthData?.healthStatus,
      createdAt: now,
    });
  }

  // machineData.issues = machineHealthData?.issues;
  const newIssues: TIssue[] = [];
  machineHealthData?.issues?.forEach((newIssue) => {
    const isIssueAAlreadyOccurred = machineData?.issues?.some(
      (existingIssue) => existingIssue?.issue === newIssue,
    );
    if (isIssueAAlreadyOccurred) {
      newIssues.push(
        machineData?.issues?.find((each) => each?.issue === newIssue),
      );
    } else {
      newIssues.push({
        issue: newIssue,
      });
    }
  });

  machineData.issues = newIssues;
  await machineData.save();

  Promise.all(
    machineHealthData?.healthStatuses?.map((each) => {
      // And now save all the sensor data and its health status

      AI.create({
        type: 'aiData',
        aiData: {
          machine: machineData?._id,
          sectionName: each?.sectionName,
          healthStatus: each?.healthStatus,
          sensorData: each?.sensorData,
        },
      });

      req.io.emit(
        `machine=${machine?.toString()}&sectionName=${each?.sectionName}`,
        { healthStatus: each?.healthStatus, createdAt: now },
      );
    }),
  );

  return null;
};

const machineReport = async ({
  machine,
  startDate,
  endDate,
  limit,
}: {
  machine: string;
  startDate: Date;
  endDate: Date;
  limit: number;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sensorDataWithHealthStatus: any[] | null = [];

  try {
    sensorDataWithHealthStatus = await AI.aggregate([
      {
        $match: {
          type: 'aiData',
          'aiData.machine': new mongoose.Types.ObjectId(machine),
          $and: [
            { createdAt: { $gte: startDate } },
            { createdAt: { $lte: endDate } },
          ],
        },
      },
      {
        $sort: {
          createdAt: 1,
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          documents: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: 0,
          documents: {
            $let: {
              vars: {
                interval: {
                  $floor: { $divide: ['$count', limit] },
                },
              },
              in: {
                $filter: {
                  input: '$documents',
                  as: 'doc',
                  cond: {
                    $eq: [
                      {
                        $mod: [
                          { $indexOfArray: ['$documents', '$$doc'] },
                          '$$interval',
                        ],
                      },
                      0,
                    ],
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          documents: { $slice: ['$documents', limit] },
        },
      },
      {
        $unwind: '$documents',
      },
      {
        $replaceRoot: { newRoot: '$documents' },
      },
    ]);
  } catch (error) {
    sensorDataWithHealthStatus = [];
  }

  const machineData = await Machine.findById(machine).select('issues');
  // const aggregationPipeline = ;
  // const chartData = await AI.aggregate([
  //   // Match documents within the specified time range
  //   {
  //     $match: {
  //       type: 'aiData',
  //       'aiData.machine': new mongoose.Types.ObjectId(machine),
  //       $and: [
  //         { createdAt: { $gte: startDate } },
  //         { createdAt: { $lte: endDate } },
  //       ],
  //       'aiData.sensorData': { $exists: true }, // Ensure sensorData exists
  //     },
  //   },

  //   // Sort by createdAt to ensure data is ordered by time
  //   {
  //     $sort: { createdAt: 1 },
  //   },

  //   // Add a sequential index to each document
  //   {
  //     $setWindowFields: {
  //       sortBy: { createdAt: 1 },
  //       output: {
  //         index: { $documentNumber: {} },
  //       },
  //     },
  //   },

  //   // Group the documents into equal-sized buckets
  //   {
  //     $group: {
  //       _id: {
  //         $floor: {
  //           $divide: ['$index', { $divide: ['$index', limit] }],
  //         },
  //       },
  //       avgVibration: { $avg: '$aiData.sensorData.vibration' },
  //       avgTemperature: { $avg: '$aiData.sensorData.temperature' },
  //     },
  //   },

  //   // Project the required fields
  //   // {
  //   //   $project: {
  //   //     _id: 0,
  //   //     avgVibration: 1,
  //   //     avgTemperature: 1,
  //   //   },
  //   // },

  //   // Limit the results to limit
  //   // {
  //   //   $limit: limit,
  //   // },
  // ]).exec();

  // Calculate the difference in milliseconds
  const differenceInSeconds = timeDifference(
    endDate as unknown as number,
    startDate as unknown as number,
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dateQueryArray: any[] = [];
  const increment = Math.ceil(differenceInSeconds / limit);
  for (let index = 0; index < limit; index++) {
    const newStartDateNumber = new Date(startDate);
    newStartDateNumber.setSeconds(
      newStartDateNumber.getSeconds() + index * increment,
    );

    const newEndDateNumber = new Date(startDate);
    newEndDateNumber.setSeconds(
      newEndDateNumber.getSeconds() + (index + 1) * increment,
    );

    const dateQuery = [
      { createdAt: { $gte: new Date(newStartDateNumber) } },
      { createdAt: { $lte: new Date(newEndDateNumber) } },
    ];

    // calculating middle time
    const time1 = new Date(newStartDateNumber).getTime();
    const time2 = new Date(newEndDateNumber).getTime();
    // Calculate the middle timestamp
    const middleTime = (time1 + time2) / 2;

    dateQueryArray.push({ dateQuery, middleTime: new Date(middleTime) });
    // { createdAt: { $gte: startDate } },
    // { createdAt: { $lte: endDate } },
  }

  const chartData = await Promise.all(
    dateQueryArray?.map(async (each) => {
      // And now save all the sensor data and its health status

      const averageSensorDataArray = await AI.aggregate([
        // Match your conditions (if any). If you want to apply a filter, add it here.
        {
          $match: {
            type: 'aiData',
            'aiData.machine': new mongoose.Types.ObjectId(machine),
            $and: each?.dateQuery,
            'aiData.sensorData': { $exists: true },
          },
        },
        // Unwind the array if 'sensorData' was an array (skip this stage if it's not)
        // { $unwind: "$aiData.sensorData" },

        // Group by a field (or null if you want overall averages) and calculate averages
        {
          $group: {
            _id: null, // Use null if you want a global average, or group by a specific field
            avgVibration: { $avg: '$aiData.sensorData.vibration' },
            avgTemperature: { $avg: '$aiData.sensorData.temperature' },
          },
        },
      ]);

      const averageSensorData = averageSensorDataArray[0];
      return {
        sensorData:
          averageSensorData?.avgVibration && averageSensorData?.avgVibration
            ? {
                vibration: averageSensorData?.avgVibration,
                temperature: averageSensorData?.avgTemperature,
              }
            : null,

        middleTime: each?.middleTime,
      };
    }),
  );
  return {
    sensorDataWithHealthStatus,
    issues: machineData?.issues,
    chartData,
  };
};

const machinePerformanceBrandWise = async () => {
  const brandsData = await predefinedValueServices.getMachineBrands();
  const brandsList = brandsData?.brands?.map((each) => each?.brand);
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

  brandsData?.brands?.forEach((each) => {
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

const editMachine = async (
  machineId: Types.ObjectId,
  updatedData: Partial<TMachine>,
) => {
  const editableFields = [
    'name',
    'brand',
    'model',
    'washingMachine',
    'usedFor',
  ];

  const updates = {};

  editableFields.forEach((field) => {
    if (updatedData[field] !== undefined) {
      updates[field] = updatedData[field];
    }
  });

  const result = await Machine.findByIdAndUpdate(machineId, updates, {
    new: true,
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Machine not found');
  }

  return result;
};

export const machineServices = {
  addNonConnectedMachineInToDB,
  addSensorConnectedMachineInToDB,
  addSensorAttachedModuleInToMachineIntoDB,
  updateAddress,
  updateMachinePackageStatus,
  getMyWashingMachineService,
  getUserConnectedMachineService,
  getMyGeneralMachineService,
  getUserNonConnectedGeneralMachineService,
  getAllMachineBy_id,
  getAllSensorSectionWiseByMachine,
  getMachineBy_id,
  deleteMachineService,
  addModuleToMachineInToDB,
  machineHealthStatus,
  machineReport,
  machinePerformanceBrandWise,
  machinePerformanceModelWise,
  // changeStatusService,
  // addSensorService,
  editMachine,
};

// {
//   _id: new ObjectId('666297956c7f2e81f8c4f2cc')
//   }
// 66c723fa286f19782bb2ae97
// 66b5febeb66123d7db67bba1
