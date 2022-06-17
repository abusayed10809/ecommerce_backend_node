const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");

dotenv.config();

mongoose
    .connect(process.env.MONGO_URL) 
    .then(() => {
        console.log("DBConnection successful");
    })
    .catch((error) => {
        console.log("error occured "+error);
    });

app.use(express.json());
app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);

app.listen(process.env.PORT || 8000, () => {
    console.log("Backend server is running on port 8000");
});

// infinity04 ----- username
// yF6lwHiL2VhDEsIH ----- password