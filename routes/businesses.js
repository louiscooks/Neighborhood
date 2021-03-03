const express = require("express");
const router = express.Router();
const businesses = require("../controllers/businesses");
const catchAsync = require("../utilities/catchAsync");
const { storage } = require("../cloudinary");
const multer = require("multer");
const upload = multer({ storage });
const {
	isLoggedIn,
	isAuthor,
	validateBusiness
} = require("../utilities/middleware");

router
	.route("/")
	.get(catchAsync(businesses.index))
	.post(
		isLoggedIn,
		upload.array("image"),
		validateBusiness,
		catchAsync(businesses.createbusiness)
	);

router.get("/new", isLoggedIn, businesses.renderNewForm);

router
	.route("/:id")
	.get(catchAsync(businesses.showbusiness))
	.put(
		isLoggedIn,
		isAuthor,
		upload.array("image"),
		validateBusiness,
		catchAsync(businesses.updateBusiness)
	)
	.delete(isLoggedIn, isAuthor, catchAsync(businesses.deleteBusiness));

router.get(
	"/:id/edit",
	isLoggedIn,
	isAuthor,
	catchAsync(businesses.renderEditForm)
);

module.exports = router;
