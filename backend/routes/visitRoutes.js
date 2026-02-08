const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const { createVisit, completeVisit } = require("../controllers/visitController");

router.post(
    "/create",
    authMiddleware,
    upload.single("photo"),
    createVisit
);

router.patch(
    "/complete/:id",
    authMiddleware,
    completeVisit
);

module.exports = router;
