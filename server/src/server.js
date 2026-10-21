const http = require("http");

require('dotenv').config()

const app = require("./app");

const { mongoConnect } = require("./services/mongo");

const { loadPlanetsData } = require("./models/planets.model");

const {loadLaunchData} = require('./models/launches.model')

const PORT = process.env.PORT || 5000;
const LAUNCH_DATA_RETRY_INTERVAL = 60 * 1000;
const MAX_LAUNCH_DATA_RETRY_INTERVAL = 5 * 60 * 1000;

const server = http.createServer(app);

function loadLaunchDataWithRetry(attempt = 1) {
  loadLaunchData().catch((error) => {
    const retryInterval = Math.min(
      LAUNCH_DATA_RETRY_INTERVAL * attempt,
      MAX_LAUNCH_DATA_RETRY_INTERVAL
    );
    console.error(
      `Could not load SpaceX launch data: ${error.message}. Retrying in ${Math.round(retryInterval / 1000)} seconds.`
    );
    setTimeout(() => loadLaunchDataWithRetry(attempt + 1), retryInterval);
  });
}

async function startServer() {
  await mongoConnect();
  await loadPlanetsData();
  server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
    loadLaunchDataWithRetry();
  });
}

startServer();
