const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDBandServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started");
    });
  } catch (error) {
    console.log(`DB Error ${error.message}`);
    process.exit(1);
  }
};

initializeDBandServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const covertDirectorDbObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getAllMoviesFromDB = `
    SELECT 
        movie_name
    FROM
        movie;
    `;
  const movieArray = await database.all(getAllMoviesFromDB);
  response.send(
    movieArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;

  const postMovieQuery = `
  INSERT INTO
    movie(director_id,movie_name,lead_actor)
  VALUES
    (${directorId},'${movieName}','${leadActor}');
  `;

  const moviePost = await database.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieFromDB = `
    SELECT
        *
    FROM
        movie
    WHERE
        movie_id = ${movieId};
    `;
  const movieArray = await database.get(getMovieFromDB);
  response.send(convertDbObjectToResponseObject(movieArray));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const getMovieFromDB = `
    UPDATE
        movie
    SET
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE
        movie_id = ${movieId};
    `;
  const movieArray = await database.get(getMovieFromDB);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieFromDB = `
    DELETE FROM
        movie
    WHERE
        movie_id = ${movieId};
    `;
  const movieArray = await database.run(deleteMovieFromDB);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getAllDirectorsFromDB = `
    SELECT 
        *
    FROM
        director;
    `;
  const directorArray = await database.all(getAllDirectorsFromDB);
  response.send(
    directorArray.map((eachDirector) => covertDirectorDbObject(eachDirector))
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id='${directorId}';`;
  const moviesArray = await database.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;
