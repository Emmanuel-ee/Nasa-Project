# NASA Project

A React frontend and Express API for exploring habitable planets and managing
launches. The API and production frontend are served by the same Node.js
process; MongoDB stores the application data.

## Run locally

1. Install Node.js and MongoDB.
2. Create `server/.env` with your MongoDB connection string:

   ```env
   MONGO_URL=mongodb://127.0.0.1:27017/nasa
   ```

3. From the project root, install dependencies and start the app:

   ```sh
   npm install
   npm run watch
   ```

   The development frontend is at `http://localhost:3000`. The API runs on
   `http://localhost:5000`.

To build and serve the production frontend through the API, run
`npm run build --prefix client`, then `npm run server`. The app is available at
`http://localhost:5000`.

## Deploy the full app with Render

The repository includes a Render Blueprint in `render.yaml`. It deploys the
Dockerized frontend and API as one web service. MongoDB must be hosted
separately; Render does not provide MongoDB.

1. Create a MongoDB Atlas cluster and a database user with access to the
   application's database. Configure Atlas Network Access to allow connections
   from the Render service. Use a strong, unique database password.
2. In the Atlas connection dialog, select the Node.js driver and copy the
   connection string. Replace its username, password, and database name as
   needed, and ensure the database name is `nasa`.
3. In Render, choose **New + > Blueprint**, connect this GitHub repository,
   and deploy the blueprint. Set `MONGO_URL` to the Atlas connection string
   when prompted. Keep it in Render's environment settings; do not commit it
   or put it in frontend environment variables.
4. Wait for the service health check to pass. Open the `onrender.com` URL
   shown in the Render dashboard to use the site.

The Render service is configured on its free plan to avoid creating a paid
service by default. Free services may spin down when idle and take longer to
respond to the first visit; choose a paid instance in Render if you need
always-on availability. Pushes to `main` trigger redeploys.
