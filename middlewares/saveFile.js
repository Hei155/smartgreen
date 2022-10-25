const multer = require('multer');
const data = new Date().getTime();
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'requestsBuffer/')
    },
    filename(req, file, cb) {
        cb(null, 'new.xlsx')
    }
})


module.exports = multer({storage});