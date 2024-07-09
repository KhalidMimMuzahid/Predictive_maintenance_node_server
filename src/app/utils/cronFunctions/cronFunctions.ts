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
            sectionName: sensorModuleData?.sectionName,
            moduleType: sensorModuleData?.moduleType,
            sensorData: sensorModuleData?.sensorData?.map(each=>{
                const eachPeriodData = {
                  vibration: each?.vibration,
                  temperature: each?.temperature
                }
              return eachPeriodData
            })
          };
        },
      );
  
      try {
         await fetch(`http://13.112.8.235/predict?machine=${_id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({sensorModulesAttached})
        })
    
        // const data = await res.json()


      //  return data
      } catch (error) {
        // console.log({error})
      }

      // return { _id, sensorModulesAttached };
    })
  )


};

export const cronFunctions = { sendIotDataToAIServer };



