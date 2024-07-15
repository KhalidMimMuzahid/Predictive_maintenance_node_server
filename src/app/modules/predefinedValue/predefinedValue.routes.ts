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
// router.post(
//   '/add-reservation-request-status',
//   predefinedValueController.addReservationRequestStatus,
// );



// router.get(
//   '/add-reservation-request-nearest-location',
//   predefinedValueController.addReservationRequestNearestLocation,
// );
// router.get(
//   '/add-reservation-request-area',
//   predefinedValueController.addReservationRequestArea,
// );
// router.get(
//   '/add-reservation-request-issue',
//   predefinedValueController.addReservationRequestIssue,
// );



export const predefinedValueRoutes = router;
