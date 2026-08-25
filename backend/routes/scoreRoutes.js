const express = require("express");
const router = express.Router();
const scoreController = require("../controllers/scoreController");

router.get("/:slug", scoreController.getCompanyScore);
router.post("/:slug", scoreController.getCompanyScore);
router.get("/:slug/history", scoreController.getScoreHistory);

module.exports = router;
