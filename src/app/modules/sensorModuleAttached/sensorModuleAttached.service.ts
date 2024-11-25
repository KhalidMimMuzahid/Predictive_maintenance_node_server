import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { SensorModule } from '../sensorModule/sensorModule.model';
import {
  TAttachedWith,
  TModule,
  TSensorModuleAttached,
  TSensorType,
} from './sensorModuleAttached.interface';
import { SensorModuleAttached } from './sensorModuleAttached.model';
import { validateSensorData } from './sensorModuleAttached.utils';
import { Request } from 'express';
import mongoose from 'mongoose';
import { SubscriptionPurchased } from '../subscriptionPurchased/subscriptionPurchased.model';
import { TSubscriptionPurchased } from '../subscriptionPurchased/subscriptionPurchased.interface';

const addSensorAttachedModuleIntoDB = async ({
  macAddress,
  subscriptionPurchased,
  user, // sensorModuleAttached,
}: {
  macAddress: string;
  subscriptionPurchased: string;
  user: mongoose.Types.ObjectId;
  // sensorModuleAttached: Partial<TSensorModuleAttached>;
}) => {
  // ------------------- XXXX ------------ checking subscription start
  const subscriptionPurchasedData = await SubscriptionPurchased.findOne({
    _id: new mongoose.Types.ObjectId(subscriptionPurchased),
    user: user,
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
  if (!subscriptionPurchasedData?.usage?.showaUser?.totalAvailableIOT) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already used your all available IOT. Please purchase a new subscription',
    );
  }
  // ------------------- XXXX ----------------checking subscription end
  const sensorModule = await SensorModule.findOne({ macAddress });
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

  // const isValid = await validateSectionNamesData({
  //   moduleType: sensorModule?.moduleType,
  //   sectionNamesData: sensorModuleAttached?.sectionName,
  // });

  // if (!isValid) {
  //   throw new AppError(
  //     httpStatus.BAD_REQUEST,
  //     'section names data are not valid according to its module type',
  //   );
  // }

  // const sectionNames = await predefinedValueServices.getIotSectionNames();

  // sensorModuleAttached?.sectionName?.vibration?.forEach((sectionName) => {
  //   const isSectionNameValid = sectionNames.some(
  //     (each) => each === sectionName,
  //   );
  //   if (!isSectionNameValid) {
  //     // throw error
  //     throw new AppError(
  //       httpStatus.BAD_REQUEST,
  //       'section names must be pre defined',
  //     );
  //   }
  // });
  // sensorModuleAttached?.sectionName?.temperature?.forEach((sectionName) => {
  //   const isSectionNameValid = sectionNames.some(
  //     (each) => each === sectionName,
  //   );
  //   if (!isSectionNameValid) {
  //     // throw error
  //     throw new AppError(
  //       httpStatus.BAD_REQUEST,
  //       'section names must be pre defined',
  //     );
  //   }
  // });
  const sensorModuleAttached: Partial<TSensorModuleAttached> = {};
  sensorModuleAttached.user = user;
  sensorModuleAttached.sensorModule = sensorModule._id;
  sensorModuleAttached.macAddress = macAddress;

  sensorModuleAttached.isSwitchedOn = false;
  sensorModuleAttached.moduleType = sensorModule?.moduleType;

  sensorModule.status = 'sold-out';

  sensorModuleAttached.subscriptionPurchased = subscriptionPurchasedData?._id;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const updatedSensorModule = await sensorModule.save({ session });

    if (!updatedSensorModule) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not purchase sensor module',
      );
    }

    const createdSensorModuleAttachedArray = await SensorModuleAttached.create(
      [sensorModuleAttached],
      { session },
    );
    if (!createdSensorModuleAttachedArray?.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not purchase sensor module',
      );
    }

    const createdSensorModuleAttached = createdSensorModuleAttachedArray[0];

    subscriptionPurchasedData.usage.showaUser.IOTs.push(
      createdSensorModuleAttached?._id,
    );

    subscriptionPurchasedData.usage.showaUser.totalAvailableIOT -= 1;

    const updatedSubscriptionPurchasedData =
      await subscriptionPurchasedData.save({ session });

    if (!updatedSubscriptionPurchasedData) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Could not purchase sensor module, please try again',
      );
    }
    await session.commitTransaction();
    await session.endSession();

    return createdSensorModuleAttached;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

const addSensorDataInToDB = async ({
  macAddress,
  sensorData,
  req,
}: {
  macAddress: string;
  sensorData: TModule;
  req: Request;
}) => {
  const sensorModuleAttached = await SensorModuleAttached.findOne(
    {
      macAddress,
    },
    {
      sensorData: {
        $slice: [
          -1, //skip
          1, // limitTemp
        ],
      },
    },
  )
    .select(
      'subscriptionPurchased moduleType sectionName shockEventsCount machine',
    )
    .populate({
      path: 'subscriptionPurchased',
      select: 'isActive',
      options: { strictPopulate: false },
    });

  if (!sensorModuleAttached) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no sensor module has found with this macAddress',
    );
  }
  const subscriptionPurchased =
    sensorModuleAttached?.subscriptionPurchased as unknown as TSubscriptionPurchased;
  if (!subscriptionPurchased?.isActive) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Your subscription has expired for this machine, please renew your subscription',
    );
  }

  // we are validating sensor data here according to its module type
  const isValid = await validateSensorData({
    moduleType: sensorModuleAttached?.moduleType,
    sensorData: sensorData,
  });

  if (!isValid) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'sensor data is not valid according to its module type',
    );
  }

  const now = new Date(Date.now());
  // ---------------------------------------
  let lengthForVibration = 0;
  let lengthForTemperature = 0;

  if (sensorModuleAttached?.moduleType === 'module-1') {
    lengthForVibration = 1;
    lengthForTemperature = 1;
  } else if (sensorModuleAttached?.moduleType === 'module-2') {
    lengthForVibration = 3;
    lengthForTemperature = 1;
  } else if (sensorModuleAttached?.moduleType === 'module-3') {
    lengthForVibration = 6;
    lengthForTemperature = 3;
  } else if (sensorModuleAttached?.moduleType === 'module-4') {
    lengthForVibration = 6;
    lengthForTemperature = 6;
  }
  const shockEventsCount = sensorModuleAttached?.shockEventsCount || {
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    vibration: Array.from({ length: lengthForVibration }, (_, index) => 0),
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    temperature: Array.from({ length: lengthForTemperature }, (_, index) => 0),
  };

  // const shockEventForVibrationValueMax = 3500;
  // const shockEventForTemperatureValueMax = 30;

  // This shock event is for vibration; And now it's pending
  // {
  //   sensorModuleAttached?.sectionName?.vibration?.forEach(
  //     (sectionName, index) => {
  //       if (
  //         sensorModuleAttached?.sensorData[0]?.vibration[index] <
  //           shockEventForVibrationValueMax &&
  //         sensorData?.vibration[index] > shockEventForVibrationValueMax
  //       ) {
  //         shockEventsCount.vibration[index] += 1;
  //       }
  //     },
  //   );
  // }

  sensorModuleAttached?.sectionName?.temperature?.forEach(
    (sectionName, index) => {
      if (sectionName === 'washingtank') {
        const shockEventForTemperatureValueMax = 80;
        if (
          sensorModuleAttached?.sensorData[0]?.temperature[index] + 3 <
            shockEventForTemperatureValueMax &&
          sensorData?.temperature[index] > shockEventForTemperatureValueMax
        ) {
          shockEventsCount.temperature[index] += 1;
        }

        // sending shock events count
        req.io.emit(
          `machine=${sensorModuleAttached?.machine?.toString()}&category=shockEvents&sensorType=temperature&sectionName=${sensorModuleAttached
            ?.sectionName?.temperature[index]}`,
          { value: shockEventsCount.temperature[index], createdAt: now },
        );
        //sending sensor reading
        req.io.emit(
          `machine=${sensorModuleAttached?.machine?.toString()}&category=sensorData&sensorType=temperature&sectionName=${sensorModuleAttached
            ?.sectionName?.temperature[index]}`,
          { value: sensorData?.temperature[index], createdAt: now },
        );
      } else if (sectionName === 'rincetank') {
        const shockEventForTemperatureValueMax = 50;
        if (
          sensorModuleAttached?.sensorData[0]?.temperature[index] + 3 <
            shockEventForTemperatureValueMax &&
          sensorData?.temperature[index] > shockEventForTemperatureValueMax
        ) {
          shockEventsCount.temperature[index] += 1;
        }
        // sending shock events count
        req.io.emit(
          `machine=${sensorModuleAttached?.machine?.toString()}&category=shockEvents&sensorType=temperature&sectionName=${sensorModuleAttached
            ?.sectionName?.temperature[index]}`,
          { value: shockEventsCount.temperature[index], createdAt: now },
        );
        //sending sensor reading
        req.io.emit(
          `machine=${sensorModuleAttached?.machine?.toString()}&category=sensorData&sensorType=temperature&sectionName=${sensorModuleAttached
            ?.sectionName?.temperature[index]}`,
          { value: sensorData?.temperature[index], createdAt: now },
        );
      } else if (sectionName === 'recycletank') {
        const shockEventForTemperatureValueMax = 50;
        if (
          sensorModuleAttached?.sensorData[0]?.temperature[index] + 3 <
            shockEventForTemperatureValueMax &&
          sensorData?.temperature[index] > shockEventForTemperatureValueMax
        ) {
          shockEventsCount.temperature[index] += 1;
        }
        // sending shock events count
        req.io.emit(
          `machine=${sensorModuleAttached?.machine?.toString()}&category=shockEvents&sensorType=temperature&sectionName=${sensorModuleAttached
            ?.sectionName?.temperature[index]}`,
          { value: shockEventsCount.temperature[index], createdAt: now },
        );
        //sending sensor reading
        req.io.emit(
          `machine=${sensorModuleAttached?.machine?.toString()}&category=sensorData&sensorType=temperature&sectionName=${sensorModuleAttached
            ?.sectionName?.temperature[index]}`,
          { value: sensorData?.temperature[index], createdAt: now },
        );
      }
      // for other section name now it's pending
      // else {
      //   if (
      //     sensorModuleAttached?.sensorData[0]?.temperature[index] + 3 <
      //       shockEventForTemperatureValueMax &&
      //     sensorData?.temperature[index] > shockEventForTemperatureValueMax
      //   ) {
      //     shockEventsCount.temperature[index] += 1;
      //   }
      // }
    },
  );
  //---------------------------------------------------
  await SensorModuleAttached.findOneAndUpdate(
    {
      macAddress,
    },
    { $push: { sensorData: sensorData }, shockEventsCount },
    { new: false },
  );
  sensorData?.temperature?.forEach((each, index) => {
    req.io.emit(
      `macAddress=${macAddress}&sensorType=temperature&sensorPosition=${index}`,
      { value: each, createdAt: now },
    );
    req.io.emit(
      `machine=${sensorModuleAttached?.machine?.toString()}&sensorType=temperature&sectionName=${sensorModuleAttached
        ?.sectionName?.temperature[index]}`,
      { value: each, createdAt: now },
    );
  });
  sensorData?.vibration?.forEach((each, index) => {
    req.io.emit(
      `macAddress=${macAddress}&sensorType=vibration&sensorPosition=${index}`,
      { value: each, createdAt: now },
    );
    req.io.emit(
      `machine=${sensorModuleAttached?.machine?.toString()}&sensorType=vibration&sectionName=${sensorModuleAttached
        ?.sectionName?.vibration[index]}`,
      { value: each, createdAt: now },
    );
  });

  // console.log(
  //   '\nprevious Shock event\n',
  //   sensorModuleAttached?.shockEventsCount,
  // );
  // console.log('\ncurrent Shock event\n', shockEventsCount);
  // console.log('\n-----------------------------------------\n');
  // Now need last inserted data
  // req.io.emit(macAddress.toLowerCase(), { ...sensorData, createdAt: now });
  // {
  // for sending this information , first get last sensor module attached data and compare it section wise to current data for rapidly increasing value or notDeepEqual, if it is increases then count 1
  //   Shock Events (Recycle Tank): Number of excessive temperature events
  //   Shock Events (Rince Tank): Number of excessive temperature events
  //   Shock Events (Washing Tank): Number of excessive temperature events
  // }
  return sensorData;
};

const getAttachedSensorModulesByUser = async ({
  user,
  attachedWith,
}: {
  user: mongoose.Types.ObjectId;
  attachedWith: TAttachedWith;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any;
  if (attachedWith === 'washingMachine') {
    result = await SensorModuleAttached.aggregate([
      {
        $project: {
          _id: 1,
          user: 1,
          macAddress: 1,
          purpose: 1,
          isSwitchedOn: 1,
          moduleType: 1,
          createdAt: 1,
          machine: 1,
        },
      },
      {
        $match: {
          user: user,
          machine: { $exists: true },
        },
      },
      {
        $lookup: {
          from: 'machines', // Name of the user collection
          localField: 'machine',
          foreignField: '_id',
          as: 'machine',
        },
      },
      {
        $project: {
          _id: 1,
          macAddress: 1,
          purpose: 1,
          // isSwitchedOn: 1,
          moduleType: 1,
          machine: { $arrayElemAt: ['$machine.category', 0] },
        },
      },
      {
        $match: {
          machine: 'washing-machine',
        },
      },
    ]);
  } else if (attachedWith === 'generalMachine') {
    result = await SensorModuleAttached.aggregate([
      {
        $project: {
          _id: 1,
          user: 1,
          macAddress: 1,
          purpose: 1,
          isSwitchedOn: 1,
          moduleType: 1,
          createdAt: 1,
          machine: 1,
        },
      },
      {
        $match: {
          user: user,
          machine: { $exists: true },
        },
      },
      {
        $lookup: {
          from: 'machines', // Name of the user collection
          localField: 'machine',
          foreignField: '_id',
          as: 'machine',
        },
      },
      {
        $project: {
          _id: 1,
          macAddress: 1,
          purpose: 1,
          // isSwitchedOn: 1,
          moduleType: 1,
          machine: { $arrayElemAt: ['$machine.category', 0] },
        },
      },
      {
        $match: {
          machine: 'general-machine',
        },
      },
    ]);
  } else if (attachedWith === 'unAssigned') {
    result = await SensorModuleAttached.aggregate([
      {
        $project: {
          _id: 1,
          user: 1,
          macAddress: 1,
          purpose: 1,
          isSwitchedOn: 1,
          moduleType: 1,
          createdAt: 1,
          machine: 1,
        },
      },
      {
        $match: {
          user: user,
          machine: { $exists: false },
        },
      },

      {
        $project: {
          _id: 1,
          macAddress: 1,
          purpose: 1,
          // isSwitchedOn: 1,
          moduleType: 1,
        },
      },
    ]);
  }

  return result;
};

const getAttachedSensorModulesByMachine = async (
  machine_id: mongoose.Types.ObjectId,
) => {
  const sensors = await SensorModuleAttached.find(
    { machine: machine_id },
    { sensorData: { $slice: [-10, 10] } },
  );
  return sensors;
};
const getAllAttachedSensorModulesByMachine = async (
  machine_id: mongoose.Types.ObjectId,
) => {
  const sensors = await SensorModuleAttached.find(
    { machine: machine_id },
    { sensorData: 0 },
  );
  return sensors;
};

const getSensorDataFromDB = async ({
  macAddress,
  sensorType,
  sensorPosition,
  page,
  limit,
}: {
  macAddress: string;
  sensorType: TSensorType;
  sensorPosition: number;
  page: number;
  limit: number;
}) => {
  // we must check the user role here, if it is customer then we need to check subscription validation; if it is admin then we may skip this part

  const sensorModuleAttachedData = await SensorModuleAttached.findOne({
    macAddress,
  })
    .select('subscriptionPurchased')
    .populate({
      path: 'subscriptionPurchased',
      select: 'isActive',
      options: { strictPopulate: false },
    });

  const subscriptionPurchased =
    sensorModuleAttachedData?.subscriptionPurchased as unknown as TSubscriptionPurchased;
  if (!subscriptionPurchased?.isActive) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Your subscription has expired for this machine, please renew your subscription',
    );
  }

  const result = await SensorModuleAttached.aggregate([
    { $match: { macAddress: macAddress } },
    {
      $project: {
        count: {
          $size: '$sensorData',
        },
      },
    },
  ]);

  if (result?.length === 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'No attached sensor module available with this macAddress!',
    );
  }

  const dataCount = result.length > 0 ? result[0].count : 0;

  const remaining = dataCount - page * limit;
  let skip = -limit * page;
  let limitTemp = limit;
  if (remaining < 0) {
    skip = -dataCount;
    limitTemp = remaining + limit;
    if (limitTemp < 0) limitTemp = 0;
  }

  if (limitTemp === 0) {
    return {
      prevPage:
        limitTemp <= 0
          ? Math.ceil(dataCount / limit)
          : page - 1 == 0
            ? false
            : page - 1,

      nextPage: false,
      sensorData: [],
    };
  }
  const sensorModuleAttached = await SensorModuleAttached.findOne(
    { macAddress: macAddress },
    { sensorData: { $slice: [skip, limitTemp] } },
  );
  if (!sensorModuleAttached) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `No sensor data for this page ${page}`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sensorData =
    sensorModuleAttached?.sensorData?.length > 0
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sensorModuleAttached?.sensorData?.map((each: any) => {
          const value = each[sensorType][sensorPosition];

          if (!value && value !== 0) {
            throw new AppError(
              httpStatus.BAD_REQUEST,
              `No sensor data for position of ${sensorPosition}`,
            );
          }
          return {
            value,
            createdAt: each?.createdAt,
          };
        })
      : [];
  const sensor = {
    prevPage:
      limitTemp <= 0
        ? Math.ceil(dataCount / limit)
        : page - 1 == 0
          ? false
          : page - 1,
    nextPage: page == Math.ceil(dataCount / limit) ? false : page + 1,
    sensorData,
    // finished: true,
    // sensorModuleAttached: sensorModuleAttached.sensorModule,
    sensorType,
    sensorPosition,
    macAddress,
    // price: iot.price,
    // status: iot.status,
    // uid: iot.uid,
    // purpose: sensorModuleAttached.purpose,
    // sectionName: sensorModuleAttached.sectionName,
    // isSwitchedOn: sensorModuleAttached.isSwitchedOn,
    // moduleType: sensorModuleAttached.moduleType,
    // machine_id: sensorModuleAttached.machine,
  };

  return { totalData: sensor?.sensorData?.length || 0, ...sensor };
};
const getSensorModuleAttachedByMacAddress = async (macAddress: string) => {
  const sensorModuleAttached = await SensorModuleAttached.findOne(
    {
      macAddress: macAddress,
    },
    { sensorData: 0 },
  );
  return sensorModuleAttached;
};
export const sensorAttachedModuleServices = {
  addSensorAttachedModuleIntoDB, //  to do
  addSensorDataInToDB,
  getAttachedSensorModulesByUser,
  getAttachedSensorModulesByMachine,
  getAllAttachedSensorModulesByMachine,
  getSensorDataFromDB,
  getSensorModuleAttachedByMacAddress,
};
