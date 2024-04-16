import mongoose from 'mongoose';
import { Bank } from "../models/index.js"

export const listBank = async () => {
    const data = await Bank.find();
    return data;
}