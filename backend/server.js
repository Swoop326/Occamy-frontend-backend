require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middlewares/authMiddleware");
const adminRoutes = require("./routes/adminRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const visitRoutes = require("./routes/visitRoutes");
const distributorRoutes = require("./routes/distributorRoutes");
const workSessionRoutes = require("./routes/workSessionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const fieldVisitRoutes = require("./routes/fieldVisitRoutes");
const seedDemoUsers = require("./utils/seedDemoUsers");

const app = express();
app.use(cors());
app.use((req,res,next)=>{
    res.set("Cache-Control","no-store");
    next();
});


app.use(express.json());
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/dashboard", dashboardRoutes);
app.use("/visits", visitRoutes);
app.use("/distributor/notifications", notificationRoutes);
app.use("/distributor", distributorRoutes);
app.use("/work", workSessionRoutes);
app.use("/field-visits", fieldVisitRoutes);




connectDB();

app.get("/protected", authMiddleware, (req,res)=>{
    res.json({
        message:"You are authorized ✅",
        user:req.user
    });
});

app.get("/", (req,res)=>{
    res.send("API Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`Server started on port ${PORT}`);
});
