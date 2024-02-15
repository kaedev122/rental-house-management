import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import promBundle from "express-prom-bundle";
import dayjs from "dayjs";

import { connectDB } from "./connections/mongodb.js";
import { AuthController, ErrorController } from "./controllers/index.js";

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

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(metricsMiddleware)

app.get('/api', (req, res) => {
    res.send("Server online!")
})

connectDB()

app.use('/api/auth', AuthController)

app.use((req, res, next) => {
    throw new NotFoundError(`Path ${req.originalUrl} is Not Found`)
})

app.use(ErrorController)

process.on('uncaughtException', function (err) {
    logger.error(`Caught exception: ${err.message} \n ${err.stack}`)
})

const PORT = process.env.PORT || 9090
app.listen(PORT, '0.0.0.0', () => {
    console.log(`API is listening on port ${PORT}`)
})

const METRICS_PORT = process.env.METRICS_PORT || 9091
metricsApp.listen(METRICS_PORT,'0.0.0.0', () => {
    console.log(`API METRICSis listening on port ${METRICS_PORT}`)
})