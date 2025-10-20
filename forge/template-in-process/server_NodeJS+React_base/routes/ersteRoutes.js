import express from 'express';
const router = express.Router();

import * as ersteController from '../controllers/ersteController.js';

router.get('/', ersteController.getItems);


export default router;
