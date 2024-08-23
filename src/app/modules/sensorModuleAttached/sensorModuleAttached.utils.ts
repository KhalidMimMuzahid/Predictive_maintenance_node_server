/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyZodObject } from 'zod';
import { TModuleType } from './sensorModuleAttached.interface';
import {
  sectionNamesDataValidationSchema,
  sensorDataValidationSchema,
} from './sensorModuleAttached.validation';

const validateModuleData = async (payload: any, schema: AnyZodObject) => {
  try {
    //validation check
    //if everything allright then next() -->
    const result = await schema.safeParseAsync(payload);
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
    return await validateModuleData(
      sensorData,
      sensorDataValidationSchema.moduleThreeSchema,
    );
  } else if (moduleType === 'module-4') {
    return await validateModuleData(
      sensorData,
      sensorDataValidationSchema.moduleFourSchema,
    );
  }
};
export const validateSectionNamesData = async ({
  moduleType,
  sectionNamesData,
}: {
  moduleType: TModuleType;
  sectionNamesData: any;
}) => {
  if (moduleType === 'module-1') {
    // validationSchema = sensorDataValidationSchema.moduleOneSchema;
    return await validateModuleData(
      sectionNamesData,
      sectionNamesDataValidationSchema.moduleOneSchemaForSectionNames,
    );
  } else if (moduleType === 'module-2') {
    return await validateModuleData(
      sectionNamesData,
      sectionNamesDataValidationSchema.moduleTwoSchemaForSectionNames,
    );
  } else if (moduleType === 'module-3') {
    return await validateModuleData(
      sectionNamesData,
      sectionNamesDataValidationSchema.moduleThreeSchemaForSectionNames,
    );
  } else if (moduleType === 'module-4') {
    return await validateModuleData(
      sectionNamesData,
      sectionNamesDataValidationSchema.moduleFourSchemaForSectionNames,
    );
  }
};