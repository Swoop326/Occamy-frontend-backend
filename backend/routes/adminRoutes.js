const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const { 
    createDistributor,
    removeDistributor,
    getAllDistributors,
    getActiveDistributorCount
} = require("../controllers/adminController");

const { getDashboardStats } = require("../controllers/dashboardController");
const { assignVisit } = require("../controllers/adminController");
const { searchDistributors } = require("../controllers/adminController");



/*
=====================================
ADMIN ONLY ROUTES
=====================================
*/

// ✅ Create Distributor
router.post(
    "/create-distributor",
    authMiddleware,
    roleMiddleware("admin"),
    createDistributor
);





// ✅ Soft Remove Distributor
router.patch(
    "/remove-distributor",
    authMiddleware,
    roleMiddleware("admin"),
    removeDistributor
);


// ✅ Distributor Activity List
router.get(
    "/distributors",
    authMiddleware,
    roleMiddleware("admin"),
    getAllDistributors
);

router.get(
   "/dashboard-stats",
   authMiddleware,
   roleMiddleware("admin"),
   getDashboardStats
);

router.post(
   "/assign-visit",
   authMiddleware,
   roleMiddleware("admin"),
   assignVisit
);

router.get(
   "/search-distributors",
   authMiddleware,
   roleMiddleware("admin"),
   searchDistributors
);

router.get(
    "/active-distributors",
    authMiddleware,
    roleMiddleware("admin"),
    getActiveDistributorCount
);


module.exports = router;
