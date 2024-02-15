import mongoose from 'mongoose';

const connectDB = async () => {
    mongoose.set("strictQuery", false);

    console.log('DB_CONNECTION', process.env.DB_CONNECTION)
    mongoose.set('debug', true)
    mongoose.connect(process.env.DB_CONNECTION, {
        useNewUrlParser: true,
        dbName: process.env.DB_NAME,
        useUnifiedTopology: true,
        serverApi: '1'
    }).then(() => console.log('DB Connection Successful!'))
    .catch((err) => console.log('DB Connection error ', err));
}

export { connectDB }
