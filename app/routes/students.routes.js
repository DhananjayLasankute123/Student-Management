'use strict'

const upload = require('../middleware/upload');
const studentsController = require('../controllers/students.controller');

module.exports = app => {

    // Retrieve student result by id
    app.get('/students/:id', (req, res, next) => {
        studentsController.findById(req, res, next);
    });

    // Retrieve students based on result status
    app.get('/students', (req, res, next) => {
        studentsController.findByStatus(req, res, next);
    });

    // Upload a csv file and create student result records
    app.post('/upload', upload.single('file'), (req, res, next) => {
        studentsController.upload(req, res, next);
    });
};