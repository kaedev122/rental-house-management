import moment from "moment"
import Promise from 'bluebird'
import { Apartment, Bill, Contract } from "../../models/index.js"

const start = async (contract) => {
    // run job to calculate static daily about yesterday
    const dayString = new Date()
    const today = moment(dayString, "YYYYMMDD")
    const lastExportDay = moment(contract.last_check_date, "YYYYMMDD")
    if (today.diff(lastExportDay, 'days' >= contract.days_per_check)) await changeContractBillStatus(contract)
}

// create static of each day since 2024-01-01
const changeContractBillStatus = async (contract) => {
    if (contract.bill_status == 1) {
        let today = new Date()
        await Contract.findByIdAndUpdate(contract._id, {
            bill_status: 0,
            last_check_date: today
        })
    }
}

// create job at start of day (0:01:00)
const scheduler =  {
    start,
    scheduler: '1 0 * * *',
    hour: 0,
    minute: 1,
}

export default scheduler