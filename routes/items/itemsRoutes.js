const express = require("express");
const authController = require("../../controllers/auth/authController")
const { addItem, getAllItems, deleteItem } = require("../../controllers/items/itemsController");
const router = express.Router();


router.get("/favourites", authController.protect, getAllItems);
router.post("/favourites", authController.protect, addItem);
router.delete("/favourites/:id", authController.protect, deleteItem);

module.exports = router;
