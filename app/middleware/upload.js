'use strict'

const path = require('path');
const multer = require('multer');

const csvFilter = (req, file, cb) => {
    if (file.mimetype.includes('csv')) {
        cb(null, true);
    } else {
        cb('Please upload only csv file.', false);
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve(__basedir,'app','resources','static','assets','uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-impactApp-${file.originalname}`);
    },
});

const uploadFile = multer({
    storage: storage,
    fileFilter: csvFilter
});

module.exports = uploadFile;