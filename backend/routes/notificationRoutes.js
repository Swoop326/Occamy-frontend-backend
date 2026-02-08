const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const {
    getNotifications,
    markAsRead
} = require("../controllers/notificationController");


// GET notifications
router.get(
    "/",
    authMiddleware,
    roleMiddleware("distributor"),
    getNotifications
);

// MARK AS READ
router.patch(
    "/:id/read",
    authMiddleware,
    roleMiddleware("distributor"),
    markAsRead
);

module.exports = router;
