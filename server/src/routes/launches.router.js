const express = require('express')

const {
    httpGetAllLaunches,
    httpAddNewLaunches,
    httpAbortLaunch,
} = require('../controllers/launches.controller')

const launchesRouter = express.Router()

launchesRouter.get('/', httpGetAllLaunches)

launchesRouter.post('/', httpAddNewLaunches)

//mycode
launchesRouter.delete('/:id', httpAbortLaunch)



module.exports = launchesRouter