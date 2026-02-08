const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");


const {
    getDistributorStats,
    getDistributorProfile,
    getAssignedVisits,
    getOverdueVisits,
    getUpcomingVisits,
    getVisitHistory,
    getMapVisits
} = require("../controllers/distributorController");

// ✅ Profile
router.get(
    "/me",
    authMiddleware,
    roleMiddleware("distributor"),
    getDistributorProfile
);


// ✅ Stats
router.get(
    "/stats",
    authMiddleware,
    roleMiddleware("distributor"),
    getDistributorStats
);


// ✅ Today's Visits
router.get(
    "/assigned-visits",
    authMiddleware,
    roleMiddleware("distributor"),
    getAssignedVisits
);


// ✅ Overdue
router.get(
    "/pending-visits",
    authMiddleware,
    roleMiddleware("distributor"),
    getOverdueVisits
);

router.get(
   "/upcoming-visits",
   authMiddleware,
   roleMiddleware("distributor"),
   getUpcomingVisits
);

// ✅ Completed Visit History
router.get(
    "/history",
    authMiddleware,
    roleMiddleware("distributor"),
    getVisitHistory
);

router.get(
    "/map-visits",
    authMiddleware,
    roleMiddleware("distributor"),
    getMapVisits
)


module.exports = router;
