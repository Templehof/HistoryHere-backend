const express = require("express");
const authController = require("../../controllers/auth/authController")
const { addItem, getAllItems, removeItem } = require("../../controllers/items/itemsController");
const router = express.Router();


router.get("/favourites", authController.protect, getAllItems);
router.patch("/favourites", authController.protect, addItem);
router.patch("/favourites/remove", authController.protect, removeItem);

module.exports = router;
