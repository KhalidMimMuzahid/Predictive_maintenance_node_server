import { Machine } from '../../modules/machine/machine.model';
import { TSensorModuleAttached } from '../../modules/sensorModuleAttached/sensorModuleAttached.interface';
import { SensorModuleAttached } from '../../modules/sensorModuleAttached/sensorModuleAttached.model';
import mongoose from 'mongoose';

const sendIotDataToAIServer = async () => {
  // we must get all machine using subscriptionPurchased and where isActive value is true

  const timeDuration = 1; // in minutes
  const filterDate = new Date(Date.now() - timeDuration * 60 * 1000);

  const allMachines = await Machine.find(
    {
      sensorModulesAttached: { $ne: [] },
    },
    { sensorModulesAttached: 1 },
  );

  const allMachineIotData = await Promise.all(
    allMachines?.map(async (machine) => {
      // const allIots = await SensorModuleAttached.find(
      //   {
      //     _id: {
      //       $in: machine?.sensorModulesAttached,
      //     },
      //   },
      //   { sensorData: { $slice: [-10, 10] } },
      // ).select('sectionName moduleType');

      // 66f10d21fc6780b871b15f7c
      // 1173087
      // const allIots = await SensorModuleAttached.find(
      //   {
      //     _id: {
      //       $in: machine?.sensorModulesAttached,
      //     },
      //     'sensorData.createdAt': { $gte: filterDate },
      //   },
      //   // { sensorData: 1, sectionName: 1, moduleType: 1 },
      // ).select('sectionName moduleType');

      const allIots = await SensorModuleAttached.aggregate([
        {
          $match: {
            // _id: new mongoose.Types.ObjectId('66f11e8ffc6780b871b1d222'),
            _id: {
              $in: machine?.sensorModulesAttached,
            },
          },
        },
        {
          $unwind: '$sensorData', // Unwind the sensorData array
        },
        {
          $match: {
            'sensorData.createdAt': { $gte: filterDate }, // Filter by the last 10 minutes
          },
        },
        {
          $group: {
            _id: '$_id',
            sensorData: {
              // Group the filtered sensorData back into an array
              $push: {
                createdAt: '$sensorData.createdAt', // Include createdAt
                vibration: '$sensorData.vibration', // Include vibration
                temperature: '$sensorData.temperature', // Include temperature
              },
            },
            sectionName: { $first: '$sectionName' }, // Include other fields like sectionName and moduleType
            moduleType: { $first: '$moduleType' },
          },
        },
      ]);
      return {
        _id: machine?._id,
        sensorModulesAttached: allIots,
      };
    }),
  );

  // const data =
  await Promise.all(
    allMachineIotData?.map(async (machine) => {
      const _id = machine?._id;
      const sensorModulesAttached = machine?.sensorModulesAttached?.map(
        (sensorModule) => {
          const sensorModuleData =
            sensorModule as unknown as TSensorModuleAttached & {
              _id: mongoose.Types.ObjectId;
            };
          return {
            _id: sensorModuleData?._id,
            sectionName: sensorModuleData?.sectionName, // || null,
            moduleType: sensorModuleData?.moduleType,
            sensorData: sensorModuleData?.sensorData,

            // ?.map((each) => {
            //   const eachPeriodData = {
            //     vibration: each?.vibration,
            //     temperature: each?.temperature,
            //   };

            //   return eachPeriodData;
            // }),
          };
        },
      );
      if (machine && sensorModulesAttached?.length > 0)
        try {
          await fetch(`http://13.112.8.235/predict?machine=${_id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sensorModulesAttached }),
          });

          // const data = await res.json()

          //  return data
        } catch (error) {
          // console.log({error})
        }

      // return { _id, sensorModulesAttached };
    }),
  );

  // return data;
};

export const cronFunctions = { sendIotDataToAIServer };



