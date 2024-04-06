// for module-1:
export type TModule1 = [{ vibration: [number]; temperature: [number] }];

// for module-2:
export type TModule2 = [
  { vibration: [number, number, number]; temperature: [number] },
];

// for module-3:
export type TModule3 = [
  {
    vibration: [number, number, number, number, number, number];
    temperature: [number, number, number];
  },
];

//for module-4:
export type TModule4 = [
  {
    vibration: [number, number, number, number, number, number];
    temperature: [number, number, number, number, number, number];
  },
];
export type TModule = (TModule1 | TModule2 | TModule3 | TModule4)[];
export type TAttachedSensor = {
  sensor: string; // objectId of TSensor
  machine: string; // objectId of Machine model  ; if machine field is not empty , that means this machine is connected to this sensor
  user: string; // objectId of User model who purchase this sensor
  purpose?: string; // showa admin can set this value when it will be installed in the machine by showa admin/engineer
  sectionName?: string; // showa admin can set this value
  isSwitchedOn: boolean; // when the sensor is active then it's value is true
  currentSubscription: string; // objectId of Subscription model
  sensorData: TModule[];
};
