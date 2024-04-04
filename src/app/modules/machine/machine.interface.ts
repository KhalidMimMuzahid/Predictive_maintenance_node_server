import { TCompany } from '../common/common.interface';
import { TSensor } from '../sensor/sensor.interface';

export type TMachine = {
  status: 'abnormal' | 'normal';
  category: 'washing-machine' | 'general-machine';
  name: string;
  generalMachine?: {
    homeName: string;
    homeType: string;
  };
  company: TCompany;
  type: string;
  brand: string; // as mentioned in figma
  model: string; // as mentioned in figma
  environment: 'indoor' | 'outdoor'; // as mentioned in figma  like  "indoor" or "outdoor"
  sensors?: [TSensor];
};
