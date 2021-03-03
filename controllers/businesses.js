const Business = require("../models/business");
const categories = ["dining", "grocery", "sleep/stay"];
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
	const { c } = req.query;
	if (c) {
		const businesses = await Business.find({ category: c });
		res.render("businesses/index", { businesses, categories, c });
	} else {
		const businesses = await Business.find({});
		res.render("businesses/index", { businesses, categories, c: "All" });
	}
};
module.exports.renderNewForm = async (req, res) => {
	res.render("businesses/new", { categories });
};
module.exports.createbusiness = async (req, res) => {
	const geoData = await geocoder
		.forwardGeocode({
			query: req.body.business.location,
			limit: 1
		})
		.send();

	const business = new Business(req.body.business);
	business.geometry = geoData.body.features[0].geometry;
	business.images = req.files.map((f) => ({
		url: f.path,
		filename: f.filename
	}));
	business.author = req.user._id;
	await business.save();
	req.flash("success", "Successfully made a new Business");
	res.redirect(`/businesses/${business._id}`);
};
module.exports.showbusiness = async (req, res) => {
	const business = await Business.findById(req.params.id)
		.populate({
			path: "reviews",
			populate: {
				path: "author"
			}
		})
		.populate("author");
	if (!business) {
		req.flash("error", "Cannot find that business!");
		return res.redirect("/businesses");
	}
	res.render("businesses/show", { business, categories });
};
module.exports.renderEditForm = async (req, res) => {
	const { id } = req.params;
	const business = await Business.findById(id);
	if (!business) {
		req.flash("error", "Cannot find that business!");
		return res.redirect("/businesses");
	}
	res.render("businesses/edit", { business, categories });
};
module.exports.updateBusiness = async (req, res) => {
	const { id } = req.params;
	const business = await Business.findByIdAndUpdate(id, {
		...req.body.business
	});
	const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
	business.images.push(...imgs);
	await business.save();
	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			await cloudinary.uploader.destroy(filename);
		}
		await business.updateOne({
			$pull: {
				images: {
					filename: { $in: req.body.deleteImages }
				}
			}
		});
	}
	req.flash("success", "Business updated!");
	res.redirect(`/businesses/${business._id}`);
};
module.exports.deleteBusiness = async (req, res) => {
	const { id } = req.params;
	const business = await Business.findByIdAndDelete(id);
	req.flash("success", "Successfully deleted business");
	res.redirect("/businesses");
};
