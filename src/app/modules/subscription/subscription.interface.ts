// import { TIsDeleted } from '../common/common.interface';
// import { TModuleType } from '../sensorModuleAttached/sensorModuleAttached.interface';

// type TCustomerPackage = {
//   totalMachine: number;
//   totalIOT: number;
//   applicableModules: TModuleType[];
// };
// type TTimeLengthPlane = {
//   type: 'basic' | 'standard';
//   basic: TCustomerPackage;
//   standard: TCustomerPackage;
// };
// //admin can change the whole package
// export type TSubscription = {
//   // currentOffer: string  // the current offer can be changed by admin
//   package: {
//     packageFor: 'showaUser' | 'serviceProviderCompany';
//     showaUser?: {
//       plane: {
//         type: 'fixedPlane' | 'payAsYouGo';
//         fixedPlane?: {
//           type: 'monthly' | 'yearly';
//           monthly: TTimeLengthPlane;
//           yearly: TTimeLengthPlane;
//         };
//         payAsYouGo: {
//           // type: 'A' | 'B';
//           // A: {};
//           // B: {};
//         };
//       };
//     };
//     //serviceProviderCompany?: { totalEngineer: number };
//   };
//   price: {
//     netAmount: number;
//     discount: {
//       type: 'percentage' | 'flat-rate';
//       amount: number; // for percentage, value must be between 0 and 100 and for flat rate value can be grater than zero and smaller than or equal package Amount
//     };
//   };

//   isDeleted: TIsDeleted; // by default false
// };
