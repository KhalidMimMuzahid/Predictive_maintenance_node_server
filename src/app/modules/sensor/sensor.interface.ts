export type TSensor = {
  iotProductId: string; // unique identifier
  name: string;
  macAddress: string;
  price: number;
  status: 'in-stock' | 'sold-out';
  sensorType: 'temperature' | 'vibration';
  seller: string; // objectId of ServiceProviderBranch  or ServiceProviderCompany or Showa company?
};
export type TAttachedSensor = {
  sensor: string; // objectId of TSensor
  purpose: string;
  sectionName: string;
  isSwitchedOn: string;
  module: string;
  machine: string; // objectId of Machine model
  sensorData: [{ vibration: [number]; temperature: [number] }];
};
