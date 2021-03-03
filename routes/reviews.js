const express = require("express");
const router = express.Router({ mergeParams: true });
const reviews = require("../controllers/reviews");
const catchAsync = require("../utilities/catchAsync");
const {
	isLoggedIn,
	validateReview,
	isReviewAuthor
} = require("../utilities/middleware");

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete(
	"/:reviewId",
	isLoggedIn,
	isReviewAuthor,
	catchAsync(reviews.deleteReview)
);

module.exports = router;
