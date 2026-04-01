import { Router } from 'express';
import { BidController } from '../controllers/BidController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const controller = new BidController();

router.use(authenticateJWT);

// Get bids for a listing (cooperative can view all bids on their listing)
router.get('/listing/:listingId', controller.getByListing.bind(controller));

// Get my bids (buyer)
router.get('/my', controller.getMyBids.bind(controller));

// Place a bid
router.post('/', controller.store.bind(controller));

// Accept a bid (cooperative only)
router.post('/:id/accept', controller.accept.bind(controller));

// Reject a bid (cooperative only)
router.post('/:id/reject', controller.reject.bind(controller));

// Withdraw a bid (buyer only)
router.post('/:id/withdraw', controller.withdraw.bind(controller));

export default router;
