import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    res.send("Welcome to site!");
});

router.get('*', (req, res) => {
    res.send("Error 404! Not Found! There is nothing...");
});

export default router;
