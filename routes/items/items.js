const express = require("express");
const { addItem, getAllItems } = require("../../controllers/items/item");
const router = express.Router();

router.get("/favourites", getAllItems);
router.post("/favourites", addItem);

module.exports = router;
