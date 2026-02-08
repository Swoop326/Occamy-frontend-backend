const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const { getDashboardStats } = require("../controllers/dashboardController");


router.get(
   "/stats",
   authMiddleware,
   roleMiddleware("admin"),
   getDashboardStats
);

module.exports = router;