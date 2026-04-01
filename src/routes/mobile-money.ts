import { Router } from 'express';
import { MobileMoneyController } from '../controllers/MobileMoneyController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const controller = new MobileMoneyController();

router.use(authenticateJWT);

router.get('/', controller.index.bind(controller));
router.get('/status/:reference', controller.getStatus.bind(controller));
router.post('/initiate', controller.initiate.bind(controller));
router.post('/:id/release-escrow', controller.releaseEscrow.bind(controller));

export default router;
