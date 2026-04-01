import { Router } from 'express';
import { MarketplaceController } from '../controllers/MarketplaceController';
import { authenticateJWT, optionalAuth } from '../middleware/auth';

const router = Router();
const controller = new MarketplaceController();

// Public: browse listings (optional auth for enhanced data)
router.get('/', optionalAuth, controller.index.bind(controller));
router.get('/stats', optionalAuth, controller.getStats.bind(controller));
router.get('/cooperative/:cooperativeId', optionalAuth, controller.getByCooperative.bind(controller));
router.get('/:id', optionalAuth, controller.show.bind(controller));

// Authenticated: manage listings
router.post('/', authenticateJWT, controller.store.bind(controller));
router.put('/:id', authenticateJWT, controller.update.bind(controller));
router.delete('/:id', authenticateJWT, controller.destroy.bind(controller));

export default router;
