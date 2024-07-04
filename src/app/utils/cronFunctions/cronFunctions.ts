import { Machine } from '../../modules/machine/machine.model';
import { SensorModuleAttached } from '../../modules/sensorModuleAttached/sensorModuleAttached.model';

const sendIotDataToAIServer = async () => {
  // const job =
  console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxx');

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
        { sensorData: { $slice: [-10] } },
      ).select('sectionName sensorData moduleType');
      return {
        _id: machine?._id,
        sensorModulesAttached: allIots,
      };
    }),
  );

  console.log(allMachineIotData); //  now we need to do promise all for this all machines
};

export const cronFunctions = { sendIotDataToAIServer };
