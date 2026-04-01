import { Router } from 'express';
import { ComplianceController } from '../controllers/ComplianceController';
import { authenticateJWT, optionalAuth } from '../middleware/auth';

const router = Router();
const controller = new ComplianceController();

// Public: view price floors
router.get('/price-floors', optionalAuth, controller.getPriceFloors.bind(controller));

// Authenticated routes
router.use(authenticateJWT);

// Price floor management (government/admin roles)
router.post('/price-floors', controller.setPriceFloor.bind(controller));
router.put('/price-floors/:id', controller.updatePriceFloor.bind(controller));

// Compliance reports
router.get('/report', controller.getComplianceReport.bind(controller));

// Market trends
router.get('/trends/:crop', controller.getMarketTrends.bind(controller));

export default router;
