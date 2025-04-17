const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors(
  {
      origin: ["https://railway-reservation-site.vercel.app"],
      methods: ["POST", "GET"],
      credentials: true
  }
));
app.use(express.json())

const PORT = 8000;


const bcrypt = require("bcrypt");

app.use(cors());
app.use(bodyParser.json());

require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected to Atlas"))
  .catch(err => console.error("MongoDB Connection Error:", err));


const userSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

const adminSchema = new mongoose.Schema({
  adminName: String,
  adminPhone: String,
  adminEmail: String,
  adminPassword: String,
});
const Admin = mongoose.model("Admin", adminSchema);

const authenticateAdmin = async (req, res, next) => {
  const adminId = req.headers.authorization;
  if (!adminId) {
    return res.status(401).json({ message: "Unauthorized access. Please log in as admin." });
  }
  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }
    req.admin = admin;
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


app.post("/register", async (req, res) => {
  const { name, phone, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });

    if (existingUser) {
      let message = "";
      if (existingUser.email === email && existingUser.phone === phone) {
        message = "Email and Phone number already exist";
      } else if (existingUser.email === email) {
        message = "Email already exists";
      } else if (existingUser.phone === phone) {
        message = "Phone number already exists";
      }
      return res.status(400).json({ message });
    }

    const newUser = new User({ name, phone, email, password });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully! Please Login" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({ message: "No user found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login success", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.post("/get-user", async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  try {
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.post("/update-password", async (req, res) => {
  const { phone, currentPassword, newPassword } = req.body;

  if (!phone || !currentPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password !== currentPassword) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});




app.post("/register-admin", async (req, res) => {
  const { adminName, adminPhone, adminEmail, adminPassword } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ $or: [{ adminEmail }, { adminPhone }] });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin Email or Phone already exists" });
    }

    const newAdmin = new Admin({ adminName, adminPhone, adminEmail, adminPassword });
    await newAdmin.save();
    res.status(201).json({ message: "Admin registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.post("/login-admin", async (req, res) => {
  const { adminPhone, adminPassword } = req.body;

  try {
    const admin = await Admin.findOne({ adminPhone });
    if (!admin) {
      return res.status(400).json({ message: "No admin found" });
    }
    if (admin.adminPassword !== adminPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    res.status(200).json({ message: "Admin login successful", admin });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

const trainSchema = new mongoose.Schema({
  trainNumber: String,
  trainName: String,
  source: {
    station: String,
    departure: String,
    distance: String,
    day: String
  },
  intermediate: [{
    station: String,
    arrival: String,
    departure: String,
    distance: String,
    day: String
  }],
  destination: {
    station: String,
    distance: String,
    arrival: String,
    day: String
  },
  seatAvailability: {
    general: Object,
    tatkal: Object,
    totalCoaches: {},
    seatsPerCoach: {}
  },
  seatAvailabilityByDate: { type: Object, default: {}, waitlist: { type: Object, default: {} }, tqwl: { type: Object, default: {} } },
  runningDays: {
    allDays: Boolean,
    sunday: Boolean,
    monday: Boolean,
    tuesday: Boolean,
    wednesday: Boolean,
    thursday: Boolean,
    friday: Boolean,
    saturday: Boolean
  }
});

const Train = mongoose.model("Train", trainSchema);

const bookingSchema = new mongoose.Schema({
  userPhone: String,
  trainNumber: String,
  trainName: String,
  selectedClass: String,
  quota: String,
  journeyDate: String,
  source: String,
  sourceDeparture: String,
  destination: String,
  formattedArrivalDate: String,
  destinationArrival: String,
  distance: String,
  duration: String,
  passengers: [{
    name: String,
    age: Number,
    gender: String,
    seatNumber: { type: String, default: "WL" },
  }],
  totalFare: Number,
  pnrNumber: String,
  status: { type: String, default: "Booked" }

});

const Booking = mongoose.model("Booking", bookingSchema);

const formatSeatAvailability = (seatAvailability) => {
  let formattedAvailability = { general: {}, tatkal: {}, totalCoaches: {}, seatsPerCoach: {} };

  Object.keys(seatAvailability.general).forEach((classKey) => {
    formattedAvailability.general[classKey] = parseInt(seatAvailability.general[classKey], 10) || 0;
    formattedAvailability.tatkal[classKey] =
      seatAvailability.tatkal[classKey] === "Not Available"
        ? "Not Available"
        : parseInt(seatAvailability.tatkal[classKey], 10) || 0;
    formattedAvailability.totalCoaches[classKey] = parseInt(seatAvailability.totalCoaches[classKey], 10) || 0;
  });

  return formattedAvailability;
};

app.post("/add-train", async (req, res) => {
  try {
    const { trainNumber, trainName, source, intermediate, destination, seatAvailability, runningDays } = req.body;
    const formattedSeatAvailability = formatSeatAvailability(seatAvailability);
    const defaultSeatPattern = [
      "1LB", "2MB", "3UB", "4LB", "5MB", "6UB", "7SL", "8SU",
      "9LB", "10MB", "11UB", "12LB", "13MB", "14UB", "15SL", "16SU",
      "17LB", "18MB", "19UB", "20LB", "21MB", "22UB", "23SL", "24SU",
      "25LB", "26MB", "27UB", "28LB", "29MB", "30UB", "31SL", "32SU",
      "33LB", "34MB", "35UB", "36LB", "37MB", "38UB", "39SL", "40SU",
      "41LB", "42MB", "43UB", "44LB", "45MB", "46UB", "47SL", "48SU",
      "49LB", "50MB", "51UB", "52LB", "53MB", "54UB", "55SL", "56SU",
      "57LB", "58MB", "59UB", "60LB", "61MB", "62UB", "63SL", "64SU",
      "65LB", "66MB", "67UB", "68LB", "69MB", "70UB", "71SL", "72SU"
    ];

    const acFirstClassSeatPattern = [
      "1LB", "2UB", "3LB", "4UB", "5LB", "6UB", "7LB", "8UB",
      "9LB", "10UB", "11LB", "12UB", "13LB", "14UB", "15LB", "16UB",
      "17LB", "18UB", "19LB", "20UB", "21LB", "22UB"
    ];

    const acTwoTierSeatPattern = [
      "1LB", "2UB", "3LB", "4UB", "5SL", "6SU",
      "7LB", "8UB", "9LB", "10UB", "11SL", "12SU",
      "13LB", "14UB", "15LB", "16UB", "17SL", "18SU",
      "19LB", "20UB", "21LB", "22UB", "23SL", "24SU",
      "25LB", "26UB", "27LB", "28UB", "29SL", "30SU",
      "31LB", "32UB", "33LB", "34UB", "35SL", "36SU",
      "37LB", "38UB", "39LB", "40UB", "41SL", "42SU",
      "43LB", "44UB", "45LB", "46UB"
    ];

    const acChairCarSeatPattern = [
      "1W", "2M", "3W", "4M", "5A", "6M", "7W", "8A", "9M", "10A", "11M", "12W",
      "13A", "14M", "15A", "16M", "17W", "18A", "19M", "20A", "21M", "22W", "23A", "24M",
      "25A", "26M", "27W", "28A", "29M", "30A", "31M", "32W", "33A", "34M", "35A", "36M",
      "37W", "38A", "39M", "40A", "41M", "42W", "43A", "44M", "45A", "46M", "47W", "48A",
      "49M", "50A", "51M", "52W", "53A", "54M", "55A", "56M", "57W", "58A", "59M", "60A",
      "61M", "62W", "63A", "64M", "65A", "66M", "67W", "68A", "69M", "70A", "71M", "72W",
      "73A", "74M", "75A", "76M", "77W", "78M"
    ];
    const acThreeEconomySeatPattern = [
      "1LB", "2LB", "3LB", "4LB", "5LB", "6LB", "7SL", "8SL",
      "9LB", "10LB", "11LB", "12LB", "13LB", "14LB", "15SL", "16SL",
      "17LB", "18LB", "19LB", "20UB", "21UB", "22UB", "23UB", "24UB",
      "25MB", "26MB", "27MB", "28MB", "29MB", "30MB", "31MB", "32MB",
      "33LB", "34LB", "35LB", "36LB", "37LB", "38LB", "39LB", "40LB",
      "41LB", "42LB", "43LB", "44SL", "45SL", "46SL", "47SL", "48SL",
      "49LB", "50LB", "51LB", "52SU", "53SU", "54SU", "55SU", "56SU",
      "57LB", "58LB", "59LB", "60LB", "61LB", "62LB", "63SU", "64SU",
      "65LB", "66LB", "67LB", "68LB", "69LB", "70LB", "71SU", "72SU"
    ];
    const secondSeatingPattern = [
      "1W", "2M", "3A", "4A", "5M", "6W",
      "12W", "11M", "10A", "9A", "8M", "7W",
      "13W", "14M", "15A", "16A", "17M", "18W",
      "24W", "23M", "22A", "21A", "20M", "19W",
      "25W", "26M", "27A", "28A", "29M", "30W",
      "36W", "35M", "34A", "33A", "32M", "31W",
      "37W", "38M", "39A", "40A", "41M", "42W",
      "48W", "47M", "46A", "45A", "44M", "43W",
      "49W", "50M", "51A", "52A", "53M", "54W",
      "60W", "59M", "58A", "57A", "56M", "55W",
      "61W", "62M", "63A", "64A", "65M", "66W",
      "72W", "71M", "70A", "69A", "68M", "67W",
      "73W", "74M", "75A", "76A", "77M", "78W",
      "84W", "83M", "82A", "81A", "80M", "79W",
      "85W", "86M", "87A", "88A", "89M", "90W",
      "96W", "95M", "94A", "93A", "92M", "91W",
      "97W", "98M", "99A", "100A", "101M", "102W",
      "108W", "107M", "106A", "105A", "104M", "103W"
    ];

    Object.keys(seatAvailability.general).forEach((classKey) => {
      if (classKey.includes("1A")) {
        seatAvailability.seatsPerCoach[classKey] = acFirstClassSeatPattern.join(", ");
      } else if (classKey.includes("2A")) {
        seatAvailability.seatsPerCoach[classKey] = acTwoTierSeatPattern.join(", ");
      } else if (classKey.includes("CC")) {
        seatAvailability.seatsPerCoach[classKey] = acChairCarSeatPattern.join(", ");
      } else if (classKey.includes("3E")) {
        seatAvailability.seatsPerCoach[classKey] = acThreeEconomySeatPattern.join(", ");
      } else if (classKey.includes("2S")) {
        seatAvailability.seatsPerCoach[classKey] = secondSeatingPattern.join(", ");
      } else {
        seatAvailability.seatsPerCoach[classKey] = defaultSeatPattern.join(", ");
      }
    });

    const newTrain = new Train({ trainNumber, trainName, source, intermediate, destination, seatAvailability, runningDays });
    await newTrain.save();

    res.status(201).json({ message: "Train added successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});


app.put("/update-train/:trainNumber", async (req, res) => {
  try {
    const { trainName, source, intermediate, destination, seatAvailability, runningDays } = req.body;
    const { trainNumber } = req.params;

    const existingTrain = await Train.findOne({ trainNumber });
    if (!existingTrain) {
      return res.status(404).json({ message: "Train not found." });
    }

    const formattedSeatAvailability = {
      general: {},
      tatkal: {},
      totalCoaches: {},
      seatsPerCoach: {}
    };

    Object.keys(seatAvailability.general).forEach((classKey) => {
      formattedSeatAvailability.general[classKey] = parseInt(seatAvailability.general[classKey], 10) || 0;
      formattedSeatAvailability.tatkal[classKey] =
        seatAvailability.tatkal[classKey] === "Not Available"
          ? "Not Available"
          : parseInt(seatAvailability.tatkal[classKey], 10) || 0;
      formattedSeatAvailability.totalCoaches[classKey] = parseInt(seatAvailability.totalCoaches[classKey], 10) || 0;
    });

    const defaultSeatPattern = [
      "1LB", "2MB", "3UB", "4LB", "5MB", "6UB", "7SL", "8SU",
      "9LB", "10MB", "11UB", "12LB", "13MB", "14UB", "15SL", "16SU",
      "17LB", "18MB", "19UB", "20LB", "21MB", "22UB", "23SL", "24SU",
      "25LB", "26MB", "27UB", "28LB", "29MB", "30UB", "31SL", "32SU",
      "33LB", "34MB", "35UB", "36LB", "37MB", "38UB", "39SL", "40SU",
      "41LB", "42MB", "43UB", "44LB", "45MB", "46UB", "47SL", "48SU",
      "49LB", "50MB", "51UB", "52LB", "53MB", "54UB", "55SL", "56SU",
      "57LB", "58MB", "59UB", "60LB", "61MB", "62UB", "63SL", "64SU",
      "65LB", "66MB", "67UB", "68LB", "69MB", "70UB", "71SL", "72SU"
    ];

    const acFirstClassSeatPattern = [
      "1LB", "2UB", "3LB", "4UB", "5LB", "6UB", "7LB", "8UB",
      "9LB", "10UB", "11LB", "12UB", "13LB", "14UB", "15LB", "16UB",
      "17LB", "18UB", "19LB", "20UB", "21LB", "22UB"
    ];

    const acTwoTierSeatPattern = [
      "1LB", "2UB", "3LB", "4UB", "5SL", "6SU",
      "7LB", "8UB", "9LB", "10UB", "11SL", "12SU",
      "13LB", "14UB", "15LB", "16UB", "17SL", "18SU",
      "19LB", "20UB", "21LB", "22UB", "23SL", "24SU",
      "25LB", "26UB", "27LB", "28UB", "29SL", "30SU",
      "31LB", "32UB", "33LB", "34UB", "35SL", "36SU",
      "37LB", "38UB", "39LB", "40UB", "41SL", "42SU",
      "43LB", "44UB", "45LB", "46UB"
    ];

    const acThreeEconomySeatPattern = [
      "1LB", "2LB", "3LB", "4LB", "5LB", "6LB", "7SL", "8SL",
      "9LB", "10LB", "11LB", "12LB", "13LB", "14LB", "15SL", "16SL",
      "17LB", "18LB", "19LB", "20UB", "21UB", "22UB", "23UB", "24UB",
      "25MB", "26MB", "27MB", "28MB", "29MB", "30MB", "31MB", "32MB",
      "33LB", "34LB", "35LB", "36LB", "37LB", "38LB", "39LB", "40LB",
      "41LB", "42LB", "43LB", "44SL", "45SL", "46SL", "47SL", "48SL",
      "49LB", "50LB", "51LB", "52SU", "53SU", "54SU", "55SU", "56SU",
      "57LB", "58LB", "59LB", "60LB", "61LB", "62LB", "63SU", "64SU",
      "65LB", "66LB", "67LB", "68LB", "69LB", "70LB", "71SU", "72SU"
    ];

    const acChairCarSeatPattern = [
      "1W", "2M", "3W", "4M", "5A", "6M", "7W", "8A", "9M", "10A", "11M", "12W",
      "13A", "14M", "15A", "16M", "17W", "18A", "19M", "20A", "21M", "22W", "23A", "24M",
      "25A", "26M", "27W", "28A", "29M", "30A", "31M", "32W", "33A", "34M", "35A", "36M",
      "37W", "38A", "39M", "40A", "41M", "42W", "43A", "44M", "45A", "46M", "47W", "48A",
      "49M", "50A", "51M", "52W", "53A", "54M", "55A", "56M", "57W", "58A", "59M", "60A",
      "61M", "62W", "63A", "64M", "65A", "66M", "67W", "68A", "69M", "70A", "71M", "72W",
      "73A", "74M", "75A", "76M", "77W", "78M"
    ];
    const secondSeatingPattern = [
      "1W", "2M", "3A", "4A", "5M", "6W",
      "12W", "11M", "10A", "9A", "8M", "7W",
      "13W", "14M", "15A", "16A", "17M", "18W",
      "24W", "23M", "22A", "21A", "20M", "19W",
      "25W", "26M", "27A", "28A", "29M", "30W",
      "36W", "35M", "34A", "33A", "32M", "31W",
      "37W", "38M", "39A", "40A", "41M", "42W",
      "48W", "47M", "46A", "45A", "44M", "43W",
      "49W", "50M", "51A", "52A", "53M", "54W",
      "60W", "59M", "58A", "57A", "56M", "55W",
      "61W", "62M", "63A", "64A", "65M", "66W",
      "72W", "71M", "70A", "69A", "68M", "67W",
      "73W", "74M", "75A", "76A", "77M", "78W",
      "84W", "83M", "82A", "81A", "80M", "79W",
      "85W", "86M", "87A", "88A", "89M", "90W",
      "96W", "95M", "94A", "93A", "92M", "91W",
      "97W", "98M", "99A", "100A", "101M", "102W",
      "108W", "107M", "106A", "105A", "104M", "103W"
    ];

    if (trainName) existingTrain.trainName = trainName;
    if (source) existingTrain.source = source;
    if (intermediate) existingTrain.intermediate = intermediate;
    if (destination) existingTrain.destination = destination;
    if (runningDays) existingTrain.runningDays = runningDays;

    if (seatAvailability) {
      existingTrain.seatAvailability.general = seatAvailability.general || {};
      existingTrain.seatAvailability.tatkal = seatAvailability.tatkal || {};
      existingTrain.seatAvailability.totalCoaches = seatAvailability.totalCoaches || {};

      if (!existingTrain.seatAvailability.seatsPerCoach) {
        existingTrain.seatAvailability.seatsPerCoach = {};
      }

      Object.keys(seatAvailability.general || {}).forEach((classKey) => {
        if (classKey.includes("1A")) {
          existingTrain.seatAvailability.seatsPerCoach[classKey] = acFirstClassSeatPattern.join(", ");
        } else if (classKey.includes("2A")) {
          existingTrain.seatAvailability.seatsPerCoach[classKey] = acTwoTierSeatPattern.join(", ");
        } else if (classKey.includes("CC")) {
          existingTrain.seatAvailability.seatsPerCoach[classKey] = acChairCarSeatPattern.join(", ");
        } else if (classKey.includes("3E")) {
          existingTrain.seatAvailability.seatsPerCoach[classKey] = acThreeEconomySeatPattern.join(", ");
        } else if (classKey.includes("2S")) {
          existingTrain.seatAvailability.seatsPerCoach[classKey] = secondSeatingPattern.join(", ");
        } else {
          existingTrain.seatAvailability.seatsPerCoach[classKey] = defaultSeatPattern.join(", ");
        }
      });
    }

    await existingTrain.save();
    res.json({ message: "Train details updated successfully", updatedTrain: existingTrain });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server error while updating train", error: error.message });
  }
});




app.delete('/delete-train/:trainNumber', async (req, res) => {
  try {
    const deletedTrain = await Train.findOneAndDelete({ trainNumber: req.params.trainNumber });
    if (!deletedTrain) return res.status(404).json({ message: 'Train not found' });
    res.json({ message: 'Train deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: Unable to delete train' });
  }
});

app.get('/train/:trainNumber', async (req, res) => {
  try {
    const train = await Train.findOne({ trainNumber: req.params.trainNumber });

    if (!train) return res.status(404).json({ message: 'Train not found' });

    res.json(train);
  } catch (error) {
    console.error("Error fetching train:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get("/search-trains", async (req, res) => {
  const { from, to } = req.query;

  try {
    const trains = await Train.find({
      $or: [
        { "source.station": from },
        { "intermediate.station": from },
      ],
    });

    const validTrains = trains.filter(train => {
      let stations = [train.source.station, ...train.intermediate.map(s => s.station), train.destination.station];

      let fromIndex = stations.indexOf(from);
      let toIndex = stations.indexOf(to);

      return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
    }).map(train => {
      let fromDistance = train.source.distance;
      let toDistance = train.destination.distance;

      train.intermediate.forEach(stop => {
        if (stop.station === from) fromDistance = stop.distance;
        if (stop.station === to) toDistance = stop.distance;
      });

      return {
        ...train.toObject(),
        distance: toDistance - fromDistance
      };
    });

    res.json({ trains: validTrains });
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching trains", error });
  }
});



app.get("/api/schedule/:trainNumber", async (req, res) => {
  try {
    const train = await Train.findOne({ trainNumber: req.params.trainNumber });

    if (!train) {
      return res.status(404).json({ error: "Train not found" });
    }

    res.json(train);
  } catch (error) {
    console.error("Error fetching train:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/train/:trainNumber/:quota', async (req, res) => {
  try {
    const { trainNumber, quota } = req.params;
    const { date } = req.query;

    const train = await Train.findOne({ trainNumber });
    if (!train) return res.status(404).json({ message: 'Train not found' });

    if (!train.seatAvailabilityByDate) {
      train.seatAvailabilityByDate = {};
    }

    if (!train.seatAvailabilityByDate[date]) {
      train.seatAvailabilityByDate[date] = JSON.parse(JSON.stringify(train.seatAvailability));
      await Train.findOneAndUpdate(
        { trainNumber },
        { $set: { [`seatAvailabilityByDate.${date}`]: train.seatAvailability } },
        { new: true }
      );
    }

    const seatAvailabilityForDate = quota === "Tatkal"
      ? train.seatAvailabilityByDate?.[date]?.tatkal || {}
      : train.seatAvailabilityByDate?.[date]?.general || {};

    const updatedAvailability = {};
    for (const className in seatAvailabilityForDate) {
      const availableSeats = seatAvailabilityForDate[className] || 0;
      const waitlistCount = train.seatAvailabilityByDate?.[date]?.waitlist?.[className] || 0;
      const tqwlCount = train.seatAvailabilityByDate?.[date]?.tqwl?.[className] || 0;

      updatedAvailability[className] = {
        available: availableSeats,
        waitlist: { count: waitlistCount },
        tqwl: { count: tqwlCount }
      };
    }

    res.json({
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      seatAvailabilityByDate: { [date]: updatedAvailability }
    });

  } catch (error) {
    console.error("Error fetching train data:", error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/seats', (req, res) => {
  const { date, quota } = req.query;

  if (!trainData[date]) {
    return res.status(404).json({ error: "No data available for this date" });
  }

  let seats = trainData[date];

  if (quota === 'Tatkal') {
    seats = seats.tatkal;
  } else {
    seats = seats.general;
  }

  res.json(seats);
});


app.get("/search-trains", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const trains = await Train.find({
      $or: [
        { trainNumber: { $regex: query, $options: 'i' } },
        { trainName: { $regex: query, $options: 'i' } }
      ]

    });

    res.status(200).json(trains);
  } catch (error) {
    res.status(500).json({ message: "Server error while searching trains", error });
  }
});



app.post("/book-ticket", async (req, res) => {
  try {
    const { trainNumber, class: selectedClass, quota, passengers, journeyDate, userPhone, source, destination, formattedArrivalDate, totalFare } = req.body;

    let train = await Train.findOne({ trainNumber });
    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }

    if (quota === "Tatkal" && selectedClass === "AC First Class (1A)") {
      return res.status(400).json({ message: "Tatkal quota is not available for AC First Class (1A)" });
    }

    const trainName = train.trainName;
    const sourceDeparture = train.source.departure;
    const destinationArrival = train.destination.arrival;

    let fromDistance = train.source.distance;
    let toDistance = train.destination.distance;

    train.intermediate.forEach(stop => {
      if (stop.station === source) fromDistance = stop.distance;
      if (stop.station === destination) toDistance = stop.distance;
    });

    const distance = Math.abs(toDistance - fromDistance);
    const parseTime = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const departureTime = parseTime(sourceDeparture);
    const arrivalTime = parseTime(destinationArrival);
    let durationMinutes = arrivalTime - departureTime;

    if (durationMinutes < 0) {
      durationMinutes += 24 * 60;
    }

    const duration = `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`;

    if (!train.seatAvailabilityByDate) {
      train.seatAvailabilityByDate = {};
    }

    if (!train.seatAvailabilityByDate[journeyDate]) {
      train.seatAvailabilityByDate[journeyDate] = {
        general: {},
        tatkal: {},
        waitlist: {},
        tqwl: {}
      };

      if (train.seatAvailability?.general) {
        for (const [classKey, value] of Object.entries(train.seatAvailability.general)) {
          train.seatAvailabilityByDate[journeyDate].general[classKey] = parseInt(value) || 0;
        }
      }

      if (train.seatAvailability?.tatkal) {
        for (const [classKey, value] of Object.entries(train.seatAvailability.tatkal)) {
          train.seatAvailabilityByDate[journeyDate].tatkal[classKey] =
            value === "Not Available" ? "Not Available" : parseInt(value) || 0;
        }
      }
    }


    if (!train.seatAvailabilityByDate) train.seatAvailabilityByDate = {};

    if (!train.seatAvailabilityByDate[journeyDate]) {
      train.seatAvailabilityByDate[journeyDate] = {
        general: {},
        tatkal: {},
        waitlist: {},
        tqwl: {}
      };
    }

    if (!train.seatAvailabilityByDate[journeyDate].general) train.seatAvailabilityByDate[journeyDate].general = {};
    if (!train.seatAvailabilityByDate[journeyDate].tatkal) train.seatAvailabilityByDate[journeyDate].tatkal = {};
    if (!train.seatAvailabilityByDate[journeyDate].waitlist) train.seatAvailabilityByDate[journeyDate].waitlist = {};
    if (!train.seatAvailabilityByDate[journeyDate].tqwl) train.seatAvailabilityByDate[journeyDate].tqwl = {};

    const quotaKey = quota === "Tatkal" ? "tatkal" : "general";

    if (typeof train.seatAvailabilityByDate[journeyDate][quotaKey][selectedClass] !== "number") {
      train.seatAvailabilityByDate[journeyDate][quotaKey][selectedClass] =
        parseInt(train.seatAvailability?.[quotaKey]?.[selectedClass] || 0, 10);
    }

    if (typeof train.seatAvailabilityByDate[journeyDate].waitlist[selectedClass] !== "number") {
      train.seatAvailabilityByDate[journeyDate].waitlist[selectedClass] = 0;
    }
    if (typeof train.seatAvailabilityByDate[journeyDate].tqwl[selectedClass] !== "number") {
      train.seatAvailabilityByDate[journeyDate].tqwl[selectedClass] = 0;
    }


    let availableSeats = train.seatAvailabilityByDate[journeyDate][quotaKey][selectedClass] || 0;
    const maxCoaches = train.seatAvailability.totalCoaches[selectedClass] || 1;

    const existingBookings = await Booking.find({ trainNumber, journeyDate });
    let bookedSeats = new Set(existingBookings.flatMap(booking =>
      booking.passengers.map(p => p.seatNumber.split(" / ")[2])
    ));

    let seatPattern = train.seatAvailability.seatsPerCoach[selectedClass]?.split(", ") || [];
    let availableSeatsList = seatPattern.filter(seat => !bookedSeats.has(seat));
    availableSeatsList.sort((a, b) => parseInt(a) - parseInt(b));

    const classPrefixes = {
      "AC First Class (1A)": "H",
      "AC 2 Tier (2A)": "A",
      "AC 3 Tier (3A)": "B",
      "AC 3 Economy (3E)": "B",
      "AC Chair Car (CC)": "C",
      "Sleeper (SL)": "S",
      "Second Sitting (2S)": "D"
    };

    let assignedSeats = [];
    let assignedCoach = Math.floor(Math.random() * maxCoaches) + 1;

    let lowerBerths = availableSeatsList.filter(seat => seat.includes("LB"));
    let otherSeats = availableSeatsList.filter(seat => !seat.includes("LB"));

    passengers.forEach((passenger, index) => {
      let assignedSeat = null;
      let isSeniorCitizen = (passenger.age >= 60 && passenger.gender === "M") ||
        (passenger.age >= 45 && passenger.gender === "F");

      if (availableSeats > 0 && availableSeatsList.length > 0) {
        if (isSeniorCitizen && lowerBerths.length > 0) {
          assignedSeat = lowerBerths.shift();
        } else {
          assignedSeat = otherSeats.shift() || lowerBerths.shift();
        }

        if (index > 0 && assignedSeats[index - 1]) {
          let previousSeatIndex = seatPattern.indexOf(assignedSeats[index - 1].split(" / ")[2]);
          if (previousSeatIndex !== -1 && previousSeatIndex + 1 < seatPattern.length) {
            let nextSeat = seatPattern[previousSeatIndex + 1];
            if (availableSeatsList.includes(nextSeat)) {
              assignedSeat = nextSeat;
              availableSeatsList.splice(availableSeatsList.indexOf(nextSeat), 1);
            }
          }
        }

        let prefix = classPrefixes[selectedClass] || "X";
        passenger.seatNumber = `CNF / ${prefix}${assignedCoach} / ${assignedSeat}`;
        availableSeats--;
      } else {
        let waitlistType = quota === "Tatkal" ? "tqwl" : "waitlist";
        let waitlistCount = (train.seatAvailabilityByDate[journeyDate][waitlistType][selectedClass] || 0) + 1;
        passenger.seatNumber = `${quota === "Tatkal" ? "TQWL" : "WL"}${waitlistCount}`;
        train.seatAvailabilityByDate[journeyDate][waitlistType][selectedClass] = waitlistCount;
      }

      assignedSeats.push(passenger.seatNumber);
      bookedSeats.add(assignedSeat);
    });

    const generatePNR = () => {
      return (Math.floor(Math.random() * 6) + 4).toString() +
        Math.floor(Math.random() * 1e9).toString().padStart(9, "0");
    };
    const pnrNumber = generatePNR();

    let updatedTrain = await Train.findOneAndUpdate(
      { trainNumber },
      {
        $set: {
          [`seatAvailabilityByDate.${journeyDate}.${quotaKey}.${selectedClass}`]: availableSeats,
          [`seatAvailabilityByDate.${journeyDate}.waitlist.${selectedClass}`]:
            train.seatAvailabilityByDate[journeyDate].waitlist[selectedClass],
          [`seatAvailabilityByDate.${journeyDate}.tqwl.${selectedClass}`]:
            train.seatAvailabilityByDate[journeyDate].tqwl[selectedClass]
        }
      },
      { new: true }
    );

    const booking = new Booking({
      userPhone,
      trainNumber,
      trainName,
      journeyDate,
      selectedClass,
      quota,
      source,
      sourceDeparture,
      destination,
      formattedArrivalDate,
      destinationArrival,
      duration,
      distance,
      passengers,
      pnrNumber,
      totalFare,
    });

    await booking.save();

    res.status(201).json({
      message: "Booking Confirmed",
      pnrNumber,
      duration,
      distance,
      remainingSeats: updatedTrain.seatAvailabilityByDate[journeyDate][quotaKey][selectedClass],
      passengers,
      totalFare
    });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});

app.get("/api/user-bookings", async (req, res) => {
  try {
    const userPhone = req.headers["user-phone"];
    if (!userPhone) {
      return res.status(400).json({ message: "User phone number is required" });
    }

    const bookings = await Booking.find({ userPhone });

    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found for this user" });
    }

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ message: "Server error", error });
  }
});


app.post("/cancel-ticket", async (req, res) => {
  try {
    const { pnrNumber } = req.body;
    const booking = await Booking.findOne({ pnrNumber });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const { trainNumber, journeyDate, passengers, selectedClass, quota } = booking;
    const canceledSeatsCount = passengers.length;
    let train = await Train.findOne({ trainNumber });
    if (!train) return res.status(404).json({ message: "Train not found" });

    const hasWaitlistedPassengers = passengers.some(p =>
      p.seatNumber.startsWith("WL") || p.seatNumber.startsWith("TQWL")
    );


    await Booking.findOneAndUpdate({ pnrNumber }, { status: "Cancelled" });

    let seatPattern = train.seatAvailability.seatsPerCoach[selectedClass]?.split(", ") || [];
    const maxCoaches = train.seatAvailability.totalCoaches[selectedClass] || 1;

    const getRandomCoachNumber = (maxCoaches) => {
      return Math.floor(Math.random() * maxCoaches) + 1;
    };

    const classPrefixes = {
      "AC First Class (1A)": "H",
      "AC 2 Tier (2A)": "A",
      "AC 3 Tier (3A)": "B",
      "AC 3 Economy (3E)": "B",
      "AC Chair Car (CC)": "C",
      "Sleeper (SL)": "S",
      "Second Sitting (2S)": "D"
    };

    const existingBookings = await Booking.find({ trainNumber, journeyDate });
    let bookedSeats = new Set(existingBookings.flatMap(b => b.passengers.map(p => p.seatNumber)));
    let availableSeatsList = seatPattern.filter(seat => !bookedSeats.has(seat));

    let waitlistKey = quota === "Tatkal" ? "tqwl" : "waitlist";
    let waitlistedBookings = await Booking.find({
      trainNumber,
      journeyDate,
      "passengers.seatNumber": { $regex: new RegExp(`^${quota === "Tatkal" ? "TQWL" : "WL"}`) },
      selectedClass
    }).sort({ "passengers.seatNumber": 1 });

    let updatedBookings = [];
    let reallocatedSeats = 0;
    let assignedCoach = getRandomCoachNumber(maxCoaches);

    if (hasWaitlistedPassengers) {
      await Train.findOneAndUpdate(
        { trainNumber },
        { $inc: { [`seatAvailabilityByDate.${journeyDate}.${waitlistKey}.${selectedClass}`]: -canceledSeatsCount } }
      );
    }

    for (let booking of waitlistedBookings) {
      let hasUpdates = false;
      for (let passenger of booking.passengers) {
        if (passenger.seatNumber.startsWith(quota === "Tatkal" ? "TQWL" : "WL") && reallocatedSeats < canceledSeatsCount && availableSeatsList.length > 0) {
          let assignedSeat = availableSeatsList.shift();
          let prefix = classPrefixes[selectedClass] || "X";
          passenger.seatNumber = `CNF / ${prefix}${assignedCoach} / ${assignedSeat}`;
          reallocatedSeats++;
          hasUpdates = true;
        }
      }
      if (hasUpdates) {
        await Booking.findByIdAndUpdate(booking._id, { passengers: booking.passengers });
        updatedBookings.push(booking);
      }
      if (reallocatedSeats >= canceledSeatsCount) break;
    }

    await Booking.updateMany(
      { pnrNumber },
      { $set: { "passengers.$[].seatNumber": "CAN", "passengers.$[].coach": "CAN" } }
    );

    if (reallocatedSeats > 0) {
      let quotaKey = quota === "Tatkal" ? "tatkal" : "general";
      await Train.findOneAndUpdate(
        { trainNumber },
        { $inc: { [`seatAvailabilityByDate.${journeyDate}.${quotaKey}.${selectedClass}`]: canceledSeatsCount } },
        { new: true }
      );
    }

    if (reallocatedSeats > 0 || hasWaitlistedPassengers) {
      let updatedWaitlist = await Booking.find({
        trainNumber,
        journeyDate,
        "passengers.seatNumber": { $regex: new RegExp(`^${quota === "Tatkal" ? "TQWL" : "WL"}`) },
        selectedClass,
        status: { $ne: "Cancelled" }
      }).sort({ "passengers.seatNumber": 1 });

      let newWLNumber = 1;
      for (let booking of updatedWaitlist) {
        let hasUpdates = false;
        for (let passenger of booking.passengers) {
          if (passenger.seatNumber.startsWith(quota === "Tatkal" ? "TQWL" : "WL")) {
            passenger.seatNumber = `${quota === "Tatkal" ? "TQWL" : "WL"}${newWLNumber++}`;
            hasUpdates = true;
          }
        }
        if (hasUpdates) {
          await Booking.findByIdAndUpdate(booking._id, { passengers: booking.passengers });
        }
      }

      await Train.findOneAndUpdate(
        { trainNumber },
        { $set: { [`seatAvailabilityByDate.${journeyDate}.${waitlistKey}.${selectedClass}`]: newWLNumber - 1 } }
      );
    }

    res.status(200).json({
      message: `Ticket canceled & ${reallocatedSeats} waitlist passengers confirmed with assigned coach in the same class!`,
      updatedBookings
    });
  } catch (error) {
    console.error("Cancellation Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});



app.get("/api/pnr-status/:pnr", async (req, res) => {
  try {
    const booking = await Booking.findOne({ pnrNumber: req.params.pnr });

    if (!booking) {
      return res.status(404).json({ message: "PNR not found" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/api/bookings/:trainNumber", async (req, res) => {
  try {
    const { trainNumber } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Journey date is required" });
    }

    const bookings = await Booking.find({
      trainNumber,
      journeyDate: date,
      status: { $ne: "Cancelled" }
    });

    if (!bookings.length) {
      return res.status(404).json({ message: "No active bookings found for this train on this date" });
    }

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Server error", error });
  }
});


const tteSchema = new mongoose.Schema({
  tteId: { type: String, required: true, unique: true },
  ttePassword: { type: String, required: true }
});

const TTE = mongoose.model('TTE', tteSchema)

app.post('/api/register-tte', async (req, res) => {
  const { tteId, ttePassword } = req.body;

  if (!tteId || !ttePassword) {
    return res.status(400).json({ message: "TTE ID and Password are required." });
  }

  try {
    const newTTE = new TTE({ tteId, ttePassword });
    await newTTE.save();

    return res.status(201).json({ message: "TTE registered successfully." });
  } catch (error) {
    console.error("Error registering TTE:", error);
    return res.status(500).json({ message: "Registration failed.", error });
  }
});

app.post('/api/login-tte', async (req, res) => {
  const { tteId, ttePassword } = req.body;

  if (!tteId || !ttePassword) {
    return res.status(400).json({ message: "TTE ID and Password are required." });
  }

  try {
    const tte = await TTE.findOne({ tteId });
    if (!tte) {
      return res.status(404).json({ message: "TTE not found." });
    }

    if (tte.ttePassword !== ttePassword) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    return res.status(200).json({ message: "Login successful.", tteId });
  } catch (error) {
    console.error("Error logging in TTE:", error);
    return res.status(500).json({ message: "Login failed.", error });
  }
});

app.delete('/api/delete-tte/:tteId', async (req, res) => {
  const { tteId } = req.params;

  try {
    const deletedTTE = await TTE.findOneAndDelete({ tteId });
    if (!deletedTTE) {
      return res.status(404).json({ message: "TTE not found." });
    }

    return res.status(200).json({ message: "TTE deleted successfully." });
  } catch (error) {
    console.error("Error deleting TTE:", error);
    return res.status(500).json({ message: "Deletion failed.", error });
  }
});


const cron = require("node-cron");
const moment = require("moment");

const cleanupPastDates = async () => {
  try {
    const trains = await Train.find({});
    const today = moment().startOf('day');

    for (const train of trains) {
      if (train.seatAvailabilityByDate && typeof train.seatAvailabilityByDate === 'object') {
        const newAvailability = {};
        for (const date in train.seatAvailabilityByDate) {
          const dateMoment = moment(date, "DD-MMM-YYYY");
          if (dateMoment.isSameOrAfter(today)) {
            newAvailability[date] = train.seatAvailabilityByDate[date];
          }
        }

        train.seatAvailabilityByDate = newAvailability;
        await train.save();
      }
    }

  } catch (err) {
    console.error("Error cleaning seatAvailabilityByDate:", err.message);
  }
};

cleanupPastDates();
const cleanupOldBookings = async () => {
  try {
    const thresholdDate = moment().subtract(7, 'days').startOf('day');

    const bookings = await Booking.find({});
    let deletedCount = 0;

    for (const booking of bookings) {
      const journeyDateMoment = moment(booking.formattedArrivalDate, "DD-MMM-YYYY");

      if (journeyDateMoment.isValid() && journeyDateMoment.isBefore(thresholdDate)) {
        await Booking.deleteOne({ _id: booking._id });
        deletedCount++;
        console.log(`Deleted booking with journeyDate ${booking.formattedArrivalDate}`);
      }
    }

  } catch (err) {
    console.error("Error deleting old bookings:", err.message);
  }
};

cleanupOldBookings();


cron.schedule("0 1 * * *", async () => {
  await cleanupPastDates();
  await cleanupOldBookings();
});



app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));