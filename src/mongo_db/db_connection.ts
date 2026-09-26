import mongoose from "mongoose";
let db_data =
  "mongodb+srv://hack4erp_db_user:tHMBvTjuYBMKUg1l@cluster0.ruqco2j.mongodb.net";

const db_connection = async () => {
  let data = await mongoose.connect(db_data);
  if (data) {
    console.log("connected");
  }
};

export default db_connection;
