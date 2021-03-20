const express = require("express");
const router = express.Router();
const businessinsider = require("../controllers/businessinsider");
const medium = require("../controllers/medium");

router.get("/businessinsider/:pages", businessinsider);
router.get("/medium/:pages", medium);

module.exports = router;