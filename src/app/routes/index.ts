/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import { userRoutes } from '../modules/user/user.routes';
import { reservationRoutes } from '../modules/reservation/reservation.routes';
import { reservationGroupRoutes } from '../modules/reservationGroup/reservationGroup.routes';
import { machineRoutes } from '../modules/machine/machine.routes';
import { serviceProviderCompanyRoutes } from '../modules/serviceProviderCompany/serviceProviderCompany.routes';
import { sensorModuleRoutes } from '../modules/sensorModule/sensorModule.routes';
import { sensorModuleAttachedRoutes } from '../modules/sensorModuleAttached/sensorModuleAttached.routes';
import { serviceProviderBranchRoutes } from '../modules/serviceProviderBranch/serviceProviderBranch.routes';
import { teamOfEngineersRoutes } from '../modules/teamOfEngineers/teamOfEngineers.routes';
import { invoiceGroupRoutes } from '../modules/invoiceGroup/invoiceGroup.routes';
import { invoiceRoutes } from '../modules/invoice/invoice.routes';
import { transactionRoutes } from '../modules/transaction/transaction.routes';
import { walletRoutes } from '../modules/wallet/wallet.routes';
import { messengerRoutes } from '../modules/messenger/messenger.routes';
import { subscriptionRoutes } from '../modules/subscription/subscription.routes';
import { extraDataRoutes } from '../modules/extraData/extraData.routes';
import { subscriptionPurchasedRoutes } from '../modules/subscriptionPurchased/subscriptionPurchased.routes';

const router = express.Router();

const moduleRoutes: any[] = [
  { path: '/user', route: userRoutes },
  { path: '/reservation', route: reservationRoutes },
  { path: '/reservations-group', route: reservationGroupRoutes },
  { path: '/invoice', route: invoiceRoutes },
  { path: '/invoices-group', route: invoiceGroupRoutes },
  { path: '/machine', route: machineRoutes },
  { path: '/service-provider-company', route: serviceProviderCompanyRoutes },
  { path: '/service-provider-branch', route: serviceProviderBranchRoutes },
  { path: '/sensor-module', route: sensorModuleRoutes },
  { path: '/sensor-module-attached', route: sensorModuleAttachedRoutes },
  { path: '/team-of-engineers', route: teamOfEngineersRoutes },
  { path: '/transaction', route: transactionRoutes },
  { path: '/wallet', route: walletRoutes },
  { path: '/messenger', route: messengerRoutes },
  { path: '/subscription', route: subscriptionRoutes },
  { path: '/subscription-purchase', route: subscriptionPurchasedRoutes },
  { path: '/extra-data', route: extraDataRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;