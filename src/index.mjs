import express from "express";
import { users } from "./constants/users.mjs";
import routes from "./routes/index.mjs";
import { courses } from "./constants/courses.mjs";

const app = express();
app.use(express.json());
app.use(routes);

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`App is running port ${port}`);
});

app.get("/", (request, response) => {
  return response.sendStatus(200);
});

app.get("/api/auth/users", (request, response) => {
  return response.status(201).send(users);
});

app.get("/api/categories", (request, response) => {
  const categories = [...new Set(courses.map((course) => course.category))];
  response.json({ categories });
});

app.get("/api/courses", (request, response) => {
  const {
    query: { category },
  } = request;

  if (category) {
    return response.send(
      courses.filter((course) => course["category"] === category)
    );
  }
  return response.send(courses);
});

app.get("/api/courses/:id", (request, response) => {
  const {
    params: { id },
  } = request;

  const parsedId = parseInt(id);
  if (isNaN(parsedId)) return response.status(400).send("Bad Request");

  const findCourseById = courses.findIndex((course) => course.id === id);

  if (findCourseById === -1)
    return response.status(404).send("Course not found");

  const matchedCourse = courses[findCourseById];
  if (!matchedCourse) return response.sendStatus(400);

  return response.status(200).send(matchedCourse);
});


// add/remove to/from cart 
// checkout to get course (enroll now) it will send it to congratulations screen then my courses
// my courses