const express = require('express');
const router = express.Router();
const appController = require('../controllers/app.controller.js');
const upload = require('../multer.js'); // Path ke konfigurasi multer

router.get('/', appController.getAllItems);
router.get('/:id', appController.getItemById);
router.post('/', upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'image', maxCount: 1 }]), appController.createItem);
router.patch('/:id', upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'image', maxCount: 1 }]), appController.patchItem);
router.delete('/:id', appController.deleteItem);

module.exports = router;
