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
router.get(
  '/get-iot-section-names',
  predefinedValueController.getIotSectionNames,
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
router.post(
  '/add-reservation-request-area',
  predefinedValueController.addReservationRequestArea,
);
router.post(
  '/add-reservation-request-issue',
  predefinedValueController.addReservationRequestIssue,
);

// customer ---------------******---------------
//  machine ---------------******---------------
router.post(
  '/add-machine-brand-name',
  predefinedValueController.addMachineBrandName,
);
router.post(
  '/add-machine-model-name',
  predefinedValueController.addMachineModelName,
);

router.get(
  '/get-all-machine-brands',
  predefinedValueController.getMachineBrands,
);




export const predefinedValueRoutes = router;
