const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Business = require("../models/business");

mongoose.connect("mongodb://localhost:27017/yelp-business", {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];
const categories = ["dining", "grocery", "sleep/stay"];

const seedDB = async () => {
	await Business.deleteMany({});
	for (let i = 0; i < 500; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const cat = Math.floor(Math.random() * 3) + 1;
		const business = new Business({
			author: "6020032f7fcb90127c43be84",
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			geometry: {
				type: "Point",
				coordinates: [cities[random1000].longitude, cities[random1000].latitude]
			},
			description:
				"Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!",
			images: [
				{
					url:
						"https://res.cloudinary.com/dbxpvccux/image/upload/v1614318140/YelpBusiness/vpboxmph55dgguztng7q.jpg",
					filename: "YelpBusiness/vpboxmph55dgguztng7q"
				},
				{
					url:
						"https://res.cloudinary.com/dbxpvccux/image/upload/v1614318145/YelpBusiness/yqsh5kkexkacpeobs4ts.jpg",
					filename: "YelpBusiness/yqsh5kkexkacpeobs4ts"
				}
			],
			category: categories[cat - 1]
		});
		await business.save();
	}
};

seedDB().then(() => {
	mongoose.connection.close();
});
