import mongoose from 'mongoose';
import { Bank } from "../models/index.js"

export const listBank = async ({ 
    query: {
        q = ""
    }, 
    user 
}) => {
    let conditions = {}
    if (q) {
        conditions = {
            ...conditions,
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { short_name: { $regex: q, $options: 'i' } },
            ]
        }
    }

    const data = await Bank.find({
        ...conditions
    });
    return data;
}