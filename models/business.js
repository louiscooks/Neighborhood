const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
	url: String,
	filename: String
});
ImageSchema.virtual("thumbnail").get(function () {
	return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } };

const BusinessSchema = new Schema(
	{
		title: String,
		images: [ImageSchema],
		category: {
			type: String,
			enum: ["dining", "grocery", "sleep/stay"],
			lowercase: true
		},
		description: String,
		location: String,
		geometry: {
			type: {
				type: String,
				enum: ["Point"],
				required: true
			},
			coordinates: {
				type: [Number],
				required: true
			}
		},
		author: {
			type: Schema.Types.ObjectId,
			ref: "User"
		},
		reviews: [
			{
				type: Schema.Types.ObjectId,
				ref: "Review"
			}
		]
	},
	opts
);

BusinessSchema.virtual("properties.popUpMarkup").get(function () {
	return `<storng><a href="/businesses/${this._id}">${this.title}</a></strong>
	<p>${this.description.substring(0, 75)}...</p>`;
});

BusinessSchema.post("findOneAndDelete", async function (doc) {
	if (doc) {
		await Review.deleteMany({
			_id: { $in: doc.reviews }
		});
	}
});

const Business = mongoose.model("Business", BusinessSchema);

module.exports = Business;
