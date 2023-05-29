const axios = require("axios");
// const launches = new Map();
const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");
const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

// let latestFlightNumber = 0;
const DEFAULT_FLIGHT_NUMBER = 0;

// const launch = {
//   mission: "Kepler Exploratiion X",  --name - nasa-api
//   rocket: "Explorer IS1",   ---rocket.name - nasa-api
//   launchDate: new Date("December 27, 2030"),  --date_local -nasa-api
//   target: "Kepler-442 b", --not applicable  --nasa--api
//   success: true, success  --nasa-api
//   upcoming: true,  upcoming  --nasa-api
//   customers: ["Zero to Mastery", "Nasa"], --payloads.customers for each payload -nasanapi
//   flightNumber: 100,  --flight_number  - nasa-api
// };

// launches.set(launch.flightNumber, launch);
// saveLaunch(launch);

// function addNewLaunch(launch) {
//   latestFlightNumber++;
//   launches.set(
//     latestFlightNumber,
//     Object.assign(launch, {
//       sucess: true,
//       upcoming: true,
//       customers: ["Zero to Mastery", "Nasa"],
//       flightNumber: latestFlightNumber,
//     })
//   );
// console.log(launches)
// }

//updated Code
async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });
  if (!planet) {
    throw new Error("No Matching Planets Found");
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    sucess: true,
    upcoming: true,
    customers: ["Zero to Mastery", "Nasa"],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLaunch);
}

async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

// function existsLaunchWithId(launchId) {
//   return launches.has(launchId);
// }

//update existsLaunchWithId(launchId)
// async function existsLaunchWithId(launchId) {
//   return await launchesDatabase.findOne({
//     flightNumber: launchId,
//   });
// }

async function existsLaunchWithId(launchId) {
  return await findLaunch({
    flightNumber: launchId,
  });
}

async function populateLaunches() {
  console.log("Downloading launch data...");
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log("Problem downloading launch data");
    throw new Error("Launch data download failed");
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers,
    };

    console.log(`${launch.flightNumber} ${launch.mission}`);

    await saveLaunch(launch);
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });
  if (firstLaunch) {
    console.log("Launch data already loaded!");
  } else {
    populateLaunches();
  }
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne({}).sort("-flightNumber"); //sort in descending order

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
  //   return Array.from(launches.values());
  return await launchesDatabase
    .find({}, { _id: 0, __v: 0 })
    .sort({flightNumber: 1})
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch) {
  await launchesDatabase.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

//mycode
// function abortLaunchById(launchId) {
//   //launches.delete(launchId)
//   const aborted = launches.get(launchId);
//   aborted.upcoming = false;
//   aborted.sucess = false;
//   return aborted;
// }

//update code for database
async function abortLaunchById(launchId) {
  const aborted = await launchesDatabase.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      sucess: false,
    }
  );

  //   return aborted.ok === 1 && aborted.nModified === 1;
  //updated code Heads up! If you've installed the latest version of Mongoose
  //   (version 6 and higher), the developers have improved the naming of some properties.
  //   Because of this, the updateOne function will now give us a different response.
  return aborted.modifiedCount === 1;
}

// addNewLaunch(launch)

//console.log(launches)

module.exports = {
  loadLaunchData,
  existsLaunchWithId,
  getAllLaunches,
  // addNewLaunch,
  scheduleNewLaunch,
  abortLaunchById,
};
