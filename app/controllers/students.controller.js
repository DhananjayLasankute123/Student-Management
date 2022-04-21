'use strict'

const db = require('../models');
const students = db.students;
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

/**
 * Function to retrive student result by id.
 * @param id
 */
exports.findById = async (req, res, next) => {
    try {
        let id = req.params.id;
        if (!id) {
            res.status(400).json('Student Id missing');
        }
        let student = await students.findOne({
            where: {
                id
            }
        });
        if (!student) {
            res.status(200).json({
                message: `No result found for student ${id}`
            });
        }
        if (student.dataValues.mark1 >= 35 && student.dataValues.mark2 >= 35 && student.dataValues.mark3 >= 35) {
            student.dataValues.result = 'Pass';
        } else {
            student.dataValues.result = 'Fail';
        }
        res.status(200).json({
            message: `Result for student ${id}`,
            response: student
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Function to retrive students by result status.
 * @param resultStatus
 */
exports.findByStatus = async (req, res, next) => {
    try {
        let result;
        let resultStatus = req.query.resultStatus;
        if (resultStatus == 'Pass') {
            result = await students.findAll({
                where: {
                    mark1: {
                        [Op.gte]: 35
                    },
                    mark2: {
                        [Op.gte]: 35
                    },
                    mark3: {
                        [Op.gte]: 35
                    }
                }
            });
        } else if (resultStatus == 'Fail') {
            result = await students.findAll({
                where: {
                    [Op.or]: [{
                            mark1: {
                                [Op.lt]: 35
                            },
                        },
                        {
                            mark2: {
                                [Op.lt]: 35
                            }
                        },
                        {
                            mark3: {
                                [Op.lt]: 35
                            }
                        }
                    ]
                }
            })
        } else {
            res.status(400).json({
                message: `Result status should be either Pass or Fail`
            });
        }
        res.status(200).json({
            message: `${resultStatus} Students List`,
            response: result
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Function to save student records into database.
 */
exports.upload = (req, res, next) => {
    try {
        let studentsData = [];
        if (req.file == undefined) {
            return res.status(400).send('Please upload a CSV file!');
        }
        let filePath = path.resolve(__basedir,'app','resources','static','assets','uploads') + '/' + req.file.filename;
        fs.createReadStream(filePath)
            .pipe(csv.parse({
                headers: true
            }))
            .on('error', (error) => {
                throw error.message;
            })
            .on('data', (row) => {
                studentsData.push(row);
            })
            .on('end', () => {
                students.bulkCreate(studentsData)
                    .then(() => {
                        if(fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        res.status(200).send({
                            message: `File ${req.file.originalname} uploaded and data imported into database successfully`
                        });
                    })
                    .catch((error) => {
                        res.status(500).send({
                            message: 'Fail to import data into database!',
                            error: error.message,
                        });
                    });
            });
    } catch (err) {
        next(err);
    }
}