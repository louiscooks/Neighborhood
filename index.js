if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}

const express = require("express");
const path = require("path");
const methodoverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const ExpressError = require("./utilities/ExpressError");
const mongoose = require("mongoose");
const User = require("./models/user");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const businessRoutes = require("./routes/businesses");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");
const MongoStore = require("connect-mongo").default;

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-business";
mongoose.connect(dbUrl, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
	useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	console.log("Database connected");
});

const app = express();

//middleware
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodoverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

const secret = process.env.SECRET || "thisshouldnotbeabettersecret!";

const store = MongoStore.create({
	mongoUrl: dbUrl,
	secret,
	touchAfter: 24 * 60 * 60
});
store.on("error", function (e) {
	console.log("SESSION STORE ERROR", e);
});
const sessionConfig = {
	store,
	name: "session",
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		// secure: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7
	}
};
app.use(session(sessionConfig));
app.use(flash());

app.use(helmet());

const scriptSrcUrls = [
	"https://stackpath.bootstrapcdn.com",
	"https://api.tiles.mapbox.com",
	"https://api.mapbox.com",
	"https://kit.fontawesome.com",
	"https://cdnjs.cloudflare.com",
	"https://cdn.jsdelivr.net"
];
const styleSrcUrls = [
	"https://kit-free.fontawesome.com",
	"https://api.mapbox.com",
	"https://api.tiles.mapbox.com",
	"https://fonts.googleapis.com",
	"https://use.fontawesome.com",
	"https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
	"https://api.mapbox.com",
	"https://*.tiles.mapbox.com",
	"https://events.mapbox.com"
];
const fontSrcUrls = [];
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", "blob:"],
			childSrc: ["blob:"],
			objectSrc: [],
			imgSrc: [
				"'self'",
				"blob:",
				"data:",
				"https://res.cloudinary.com/dbxpvccux/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
				"https://images.unsplash.com"
			],
			fontSrc: ["'self'", ...fontSrcUrls]
		}
	})
);
app.use(passport.initialize());
app.use(passport.session());
//strategy passport is using // specify authentication method added automatically by passport-local-mongoose
passport.use(new LocalStrategy(User.authenticate()));
//how to store and unstore a user in the session //also specified and added automatically on user model
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	res.locals.currentUser = req.user;
	next();
});

//set views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//businesses routes
app.use("/businesses", businessRoutes);
//review routes
app.use("/businesses/:id/reviews", reviewRoutes);
//user routes
app.use("/", userRoutes);

app.get("/", (req, res) => {
	res.render("home");
});
//error handling middleware
app.all("*", (req, res, next) => {
	next(new ExpressError("Page Not Found", 404));
});
app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = "Oh No, Something Went Wrong!";
	res.status(statusCode).render("error", { err });
});

//server port
app.listen(3000, () => {
	console.log("listening on port 3000");
});
