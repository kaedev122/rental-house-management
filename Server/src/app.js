import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import promBundle from "express-prom-bundle";
import dayjs from "dayjs";
import schedule from 'node-schedule'

import { Apartment, Bill, Contract } from "./models/index.js"
import { DailyContractCheck } from './schedulers/index.js'
import Promise from 'bluebird'
import multer from "multer";

import { connectDB } from "./connections/mongodb.js";
import { AuthController, ErrorController, cmsController, AdminController } from "./controllers/index.js";
import { NotFoundError } from "./utils/errors.js";
import { v2 as cloudinary } from "cloudinary";

dayjs.locale('vi')
dotenv.config();
const app = express()
const metricsApp = express()

const metricsMiddleware = promBundle({
    includeMethod: true,
    metricsApp: metricsApp,
    autoregister: true,
    includePath: true
})

app.use(cors({
    origin: ['https://www.kaedev.me', 'http://localhost:5173', 'https://rental-house-management-client.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(metricsMiddleware)

app.get('/api', (req, res) => {
    res.send("Server online!")
})

connectDB()

// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_CLOUD_KEY,
    api_secret: process.env.API_CLOUD_SECRET,
    secure: true,
});

app.use('/api/auth', AuthController)
app.use('/api/cms', cmsController)
app.use('/api/admin', AdminController)

app.use((req, res, next) => {
    throw new NotFoundError(`Path ${req.originalUrl} is Not Found`)
})

app.use(ErrorController)

process.on('uncaughtException', function (err) {
    console.log(`Caught exception: ${err.message} \n ${err.stack}`)
})

const PORT = process.env.PORT || 9090
app.listen(PORT, '0.0.0.0', () => {
    console.log(`API is listening on port ${PORT}`)
})

const METRICS_PORT = process.env.METRICS_PORT || 9091
metricsApp.listen(METRICS_PORT,'0.0.0.0', () => {
    console.log(`API METRICSis listening on port ${METRICS_PORT}`)
})

const runningScheduler = async (runNow) => {
    // scan all active contract
    const getAllContract = async () => {
        return await Contract.find({status: 1}).lean()
    }
    console.log(`Schedulers is register to run at ${DailyContractCheck.hour}:${DailyContractCheck.minute}`)
    // set timezone schedule
    const rule = new schedule.RecurrenceRule()
    rule.tz = 'Asia/Ho_Chi_Minh'
    rule.hour = DailyContractCheck.hour
    rule.minute = DailyContractCheck.minute
    // set schedule run job with setting time
    const job = schedule.scheduleJob(rule, async () => {
        const contracts = await getAllContract()
        await Promise.map(contracts, async (contract) => {
            await DailyContractCheck.start(contract)
        }, {concurrency: 5})
    })

    // run now for testing
    if (runNow) {
        console.log(`Schedulers is running now`)
        const contracts = await getAllContract()
        await Promise.map(contracts, async (contract) => {
            await DailyContractCheck.start(contract)
        }, {concurrency: 5})
    }
}

// create job at start of day (00:00:00)
const running = async (runNow = false) => {
    await runningScheduler(runNow)
}

setImmediate(running)

process.on('SIGINT', function() {
    schedule.gracefulShutdown()
    console.log('Got SIGINT.  Press Control-D to exit.');
    process.exit();
})