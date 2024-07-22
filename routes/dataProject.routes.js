const express = require('express');
const router = express.Router();
const dataProjectController = require('../controllers/dataProject.controller.js');
const upload = require('../multer.js'); // Path ke konfigurasi multer

router.get('/', dataProjectController.getAllData);
router.get('/:id', dataProjectController.getDataById);
router.post('/', upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'image', maxCount: 1 }]), dataProjectController.createData);
router.patch('/:id', upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'image', maxCount: 1 }]), dataProjectController.patchData);
router.delete('/:id', dataProjectController.deleteData);

module.exports = router;
