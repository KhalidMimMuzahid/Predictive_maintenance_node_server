import { Machine } from '../../modules/machine/machine.model';
import { TSensorModuleAttached } from '../../modules/sensorModuleAttached/sensorModuleAttached.interface';
import { SensorModuleAttached } from '../../modules/sensorModuleAttached/sensorModuleAttached.model';
import mongoose from 'mongoose';

const sendIotDataToAIServer = async () => {
  // we must get all machine using subscriptionPurchased and where isActive value is true
  const allMachines = await Machine.find(
    {
      sensorModulesAttached: { $ne: [] },
    },
    { sensorModulesAttached: 1 },
  );
  const allMachineIotData = await Promise.all(
    allMachines?.map(async (machine) => {
      const allIots = await SensorModuleAttached.find(
        {
          _id: {
            $in: machine?.sensorModulesAttached,
          },
        },
        { sensorData: { $slice: [-10, 10] } },
      ).select('sectionName moduleType');
      return {
        _id: machine?._id,
        sensorModulesAttached: allIots,
      };
    }),
  );
  // await Promise.all(
  const data = allMachineIotData?.map((machine) => {
    const _id = machine?._id;
    const sensorModulesAttached = machine?.sensorModulesAttached?.map(
      (sensorModule) => {
        const sensorModuleData =
          sensorModule as unknown as TSensorModuleAttached & {
            _id: mongoose.Types.ObjectId;
          };

        return {
          _id: sensorModuleData?._id,
          sectionName: sensorModuleData?.sectionName,
          moduleType: sensorModuleData?.moduleType,
          sensorData: {
            vibration:
              sensorModuleData?.sensorData?.reduce((total, current) => {
                const temperatureVibration: number =
                  current?.vibration?.reduce(
                    (total, current) => total + current,
                    0,
                  ) / (current?.vibration?.length || 1);
                return total + temperatureVibration;
              }, 0) / (sensorModuleData?.sensorData?.length || 1),
            temperature:
              sensorModuleData?.sensorData?.reduce((total, current) => {
                const temperatureAverage: number =
                  current?.temperature?.reduce(
                    (total, current) => total + current,
                    0,
                  ) / (current?.temperature?.length || 1);
                return total + temperatureAverage;
              }, 0) / (sensorModuleData?.sensorData?.length || 1),
          },
        };
      },
    );

    return { _id, sensorModulesAttached };
  });
  // );
  // console.log(allMachineIotData); //  now we need to do promise all for this all machines
  return data;
};

export const cronFunctions = { sendIotDataToAIServer };



