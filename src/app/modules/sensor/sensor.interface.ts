// sensor is actually not a sensor; its a module; each module can have multiple sensor;
export type TSensor = {
  sensorId: string; // unique identifier ;  iotProductId as mention in figma
  name: string;
  macAddress: string;
  price: number;
  status: 'in-stock' | 'sold-out';
  // sensorType: 'vibration' | 'temperature'; // we no need this field
  module: 'module-1' | 'module-2' | 'module-3' | 'module-4';
  // seller: string; // seller is always Showa company; thats why we no need this seller field for now
};
