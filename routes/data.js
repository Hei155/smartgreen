const router = require('express').Router();
const file = require('../middlewares/saveFile')
const { setData, calculation, confirmData} = require('../controllers/data');
const reader = require('xlsx');

router.post('/', file.single('file'), setData);
router.post('/upload', file.single('file'), confirmData);
router.get('/get', calculation)


module.exports = router;