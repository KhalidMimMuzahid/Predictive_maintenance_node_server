import express, { Router } from 'express';
import { predefinedValueController } from './predefinedValue.controller';

const router: Router = express.Router();
//  marketplace ---------------******---------------
router.post(
  '/add-product-categories',
  predefinedValueController.addProductCategories,
);
router.post(
  '/add-product-sub-categories',
  predefinedValueController.addProductSubCategories,
);
router.post(
  '/add-shop-categories',
  predefinedValueController.addShopCategories,
);
router.get(
  '/get-product-all-categories',
  predefinedValueController.getProductCategories,
);
router.get('/get-shop-categories', predefinedValueController.getShopCategories);
//  sensorModuleAttached ---------------******---------------
router.post(
  '/add-iot-section-name',
  predefinedValueController.addIotSectionName,
);
router.post(
  '/add-iot-section-name2',
  predefinedValueController.addIotSectionName2,
);
router.delete(
  '/delete-iot-section-name2',
  predefinedValueController.deleteIotSectionNames2,
);
router.get(
  '/get-iot-section-names',
  predefinedValueController.getIotSectionNames,
);
router.get(
  '/get-iot-section-names2',
  predefinedValueController.getIotSectionNames2,
);

//  reservationRequest ---------------******---------------
router.post(
  '/add-reservation-request-status',
  predefinedValueController.addReservationRequestStatus,
);

router.post(
  '/add-reservation-request-nearest-location',
  predefinedValueController.addReservationRequestNearestLocation,
);
router.get(
  '/get-reservation-request-nearest-location',
  predefinedValueController.getReservationRequestNearestLocation,
);
router.post(
  '/set-reservation-request-nearest-location',
  predefinedValueController.setReservationRequestNearestLocation,
);
router.post(
  '/add-reservation-request-area',
  predefinedValueController.addReservationRequestArea,
);
router.post(
  '/add-reservation-request-issue',
  predefinedValueController.addReservationRequestIssue,
);

// customer ---------------******---------------
// wallet ---------------******---------------
router.post(
  '/set-transaction-fee-for-wallet',
  predefinedValueController.setTransactionFeeForWallet,
);
router.get(
  '/get-transaction-fee-for-wallet',
  predefinedValueController.getTransactionFeeForWallet,
);
//  machine ---------------******---------------
router.post(
  '/add-machine-brand-name',
  predefinedValueController.addMachineBrandName,
);
router.post(
  '/add-machine-model-name',
  predefinedValueController.addMachineModelName,
);
router.post('/add-machine-issue', predefinedValueController.addMachineIssue);
router.post(
  '/add-general-or-washing-machine-type',
  predefinedValueController.addGeneralOrWashingMachineType,
);

router.get(
  '/get-all-machine-brands',
  predefinedValueController.getMachineBrands,
);
router.get(
  '/get-all-machine-issues-brand-and-model-wise',
  predefinedValueController.getAllMachineIssuesBrandAndModelWise,
);
router.get(
  '/get-all-machine-types-category-wise',
  predefinedValueController.getAllMachineTypesCategoryWise,
);




export const predefinedValueRoutes = router;
