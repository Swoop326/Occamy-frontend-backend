const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const { createFieldVisit } = require("../controllers/fieldVisitController");

router.post(
    "/create",
    authMiddleware,
    roleMiddleware("distributor"),

    // ✅ Accept ONLY visit images (max 5)
    upload.array("visitImage", 5),

    createFieldVisit
);

module.exports = router;