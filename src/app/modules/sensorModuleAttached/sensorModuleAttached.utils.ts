/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyZodObject } from 'zod';
import { TModuleType } from './sensorModuleAttached.interface';
import { sensorDataValidationSchema } from './sensorModuleAttached.validation';

const validateModuleData = async (sensorData: any, schema: AnyZodObject) => {
  try {
    //validation check
    //if everything allright then next() -->
    const result = await schema.safeParseAsync(sensorData);
    return result.success;
    // return result;
  } catch (error) {
    return false;
  }
};

export const validateSensorData = async ({
  moduleType,
  sensorData,
}: {
  moduleType: TModuleType;
  sensorData: any;
}) => {
  if (moduleType === 'module-1') {
    // validationSchema = sensorDataValidationSchema.moduleOneSchema;
    return await validateModuleData(
      sensorData,
      sensorDataValidationSchema.moduleOneSchema,
    );
  } else if (moduleType === 'module-2') {
    return await validateModuleData(
      sensorData,
      sensorDataValidationSchema.moduleTwoSchema,
    );
  } else if (moduleType === 'module-3') {
    console.log('3333333');
    return await validateModuleData(
      sensorData,
      sensorDataValidationSchema.moduleThreeSchema,
    );
  } else if (moduleType === 'module-4') {
    console.log('4444444444444444');
    return await validateModuleData(
      sensorData,
      sensorDataValidationSchema.moduleFourSchema,
    );
  }
};
