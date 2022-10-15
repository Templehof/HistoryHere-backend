const express = require("express");
const { addItem, getAllItems, deleteItem } = require("../../controllers/items/itemsController");
const router = express.Router();

router.get("/favourites", getAllItems);
router.post("/favourites", addItem);
router.delete("/favourites/:id", deleteItem);

module.exports = router;