import { Router } from 'express';
import { WeighingController } from '../controllers/WeighingController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const controller = new WeighingController();

// IoT device data ingestion (device authenticates via API key in production)
router.post('/iot/:deviceId', controller.ingestIoT.bind(controller));

// Authenticated routes
router.use(authenticateJWT);

router.get('/', controller.index.bind(controller));
router.get('/stats', controller.getStats.bind(controller));
router.get('/:id', controller.show.bind(controller));
router.post('/', controller.store.bind(controller));
router.post('/:id/verify', controller.verify.bind(controller));

export default router;
