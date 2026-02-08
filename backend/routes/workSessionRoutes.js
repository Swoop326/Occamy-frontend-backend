const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const {
    startWork,
    endWork,
    getWorkStatus
} = require("../controllers/workSessionController");


// ✅ Start Field Work (Toggle ON)
router.post(
    "/start",
    authMiddleware,
    roleMiddleware("distributor"),
    startWork
);


// ✅ End Field Work (Toggle OFF)
router.patch(
    "/end",
    authMiddleware,
    roleMiddleware("distributor"),
    endWork
);


// ✅ Check Toggle State (when app loads)
router.get(
    "/status",
    authMiddleware,
    roleMiddleware("admin"),
    getWorkStatus
);

module.exports = router;