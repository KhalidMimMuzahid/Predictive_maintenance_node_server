import express, { Router } from 'express';
import { teamOfEngineersControllers } from './teamOfEngineers.controller';
import validateRequest from '../../middlewares/validateRequest';
import { teamOfEngineersValidation } from './teamOfEngineers.validation';

const router: Router = express.Router();

router.post(
  '/make-team-of-engineers',
  validateRequest(
    teamOfEngineersValidation.teamOfEngineersCreateValidationSchema,
  ),
  teamOfEngineersControllers.makeTeamOfEngineers,
);
export const teamOfEngineersRoutes = router;
