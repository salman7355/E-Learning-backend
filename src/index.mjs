import express, { response } from "express";
import { users } from "./constants/users.mjs";
import cors from "cors";
import routes from "./routes/index.mjs";
import { courses } from "./constants/courses.mjs";
import { pool } from "./Services/database.mjs";
import bodyParser from "body-parser";
import fs from "fs";

const app = express();

app.use(
  cors({
    origin: "exp://192.168.1.10:8081",
  })
);

app.use(express.json());

app.use(routes);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`App is running port ${port}`);
});

app.get("/api/courses", async (request, response) => {
  try {
    const {
      query: { category },
    } = request;
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM courses");
    client.release();
    const courses = result.rows;

    // courses.forEach((course) => {
    //   // console.log(course);
    //   const imagePath = course["imagepath"];
    //   // console.log(imagePath);
    //   const base64 = fs.readFileSync(imagePath, { encoding: "base64" });
    //   course.imagepath = base64;
    // });

    if (category) {
      return response.send(
        courses.filter((course) => course.category === category)
      );
    }

    return response.json(courses);
  } catch (error) {
    console.error("Error fetching courses", error);
    response.status(500).json({ error: "Failed to fetch courses" });
  }
});

app.get("/api/categories", async (request, response) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT category FROM courses");
    client.release();
    const categories = result.rows;
    const uniqueCategories = Array.from(
      new Set(categories.map((course) => course.category))
    ).map((category, index) => ({ id: index + 1, category }));

    return response.status(201).send(uniqueCategories);
  } catch (error) {
    console.error("Error fetching courses", error);
    response.status(500).json({ error: "Failed to fetch courses" });
  }
});

app.get("/api/courses/:id", async (request, response) => {
  const {
    params: { id },
  } = request;

  const parsedId = parseInt(id);
  if (isNaN(parsedId)) return response.status(400).send("Bad Request");

  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM courses WHERE id=$1", [
      parsedId,
    ]);
    client.release();
    const course = result.rows;
    return response.status(201).send(course);
  } catch (error) {
    console.error("Error fetching courses", error);
    response.status(500).json({ error: "Failed to fetch courses" });
  }

  const findCourseById = courses.findIndex((course) => course.id === id);

  if (findCourseById === -1)
    return response.status(404).send("Course not found");

  const matchedCourse = courses[findCourseById];
  if (!matchedCourse) return response.sendStatus(400);

  return response.status(200).send(matchedCourse);
});

app.get("/", (request, response) => {
  return response.sendStatus(200);
});

app.post("/cart/add", async (request, response) => {
  const {
    body: { courseId, userId },
  } = request;

  if (!userId || !courseId) {
    return response.status(400).json({ message: "Invalid userId or courseId" });
  }

  try {
    const client = await pool.connect();

    // Check if the record already exists
    const checkResult = await client.query(
      "SELECT * FROM cart WHERE userId = $1 AND courseId = $2",
      [userId, courseId]
    );

    if (checkResult.rows.length > 0) {
      // Record already exists
      client.release();
      return response.status(400).send({ msg: "Record already exists" });
    }

    // Record does not exist, insert new record
    await client.query("INSERT INTO cart (userId, courseId) VALUES ($1, $2)", [
      userId,
      courseId,
    ]);
    client.release();
    return response
      .status(201)
      .send({ msg: "Course is added to the cart successfully" });
  } catch (error) {
    console.error("Error fetching courses", error);
    response.status(500).send({ msg: "Failed to fetch courses" });
  }
});

app.get("/cart/:userId", async (request, response) => {
  const {
    params: { userId },
  } = request;

  if (!userId) {
    return response.status(400).json({ message: "User ID not provided" });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT c.* FROM cart AS ca JOIN courses AS c ON ca.courseId = c.id  WHERE ca.userId=$1",
      [parseInt(userId)]
    );
    client.release();
    return response.status(201).send(result.rows);
  } catch (error) {
    console.error("Error retrieving cart items", error);
    return response
      .status(500)
      .json({ message: "Error retrieving cart items" });
  }
});

app.delete("/cart/delete/:userId/:courseId", async (request, response) => {
  const {
    params: { userId, courseId },
  } = request;

  if (!courseId && !userId) {
    return res.status(400).json({ message: "Invalid courseId" });
  }

  try {
    const client = await pool.connect();
    await client.query("DELETE FROM cart WHERE userId=$1 AND courseId=$2", [
      userId,
      courseId,
    ]);
    client.release();
    return response
      .status(200)
      .send({ message: "Course removed from Cart successfully" });
  } catch (error) {
    console.error("Error removing course from cart", error);
    return response
      .status(500)
      .send({ message: "Error removing course from cart" });
  }
});

app.post("/course/add", async (request, response) => {
  const {
    body: { userId, courseId },
  } = request;

  if (!userId || !courseId) {
    return response.status(400).json({ message: "Invalid userId or courseId" });
  }

  try {
    const client = await pool.connect();

    // Check if the record already exists
    const checkResult = await client.query(
      "SELECT * FROM student_course WHERE userId = $1 AND courseId = $2",
      [userId, courseId]
    );

    if (checkResult.rows.length > 0) {
      // Record already exists
      client.release();
      return response.status(400).send({ message: "Record already exists" });
    }

    // Record does not exist, insert new record
    await client.query(
      "INSERT INTO student_course (userId, courseId) VALUES ($1, $2)",
      [userId, courseId]
    );
    client.release();
    return response
      .status(200)
      .send({ message: "Student added to course successfully" });
  } catch (error) {
    console.error("Error adding student to course", error);
    return response
      .status(500)
      .send({ message: "Error adding student to course" });
  }
});

app.get("/Mycourse/:userId", async (request, response) => {
  const {
    params: { userId },
  } = request;

  if (!userId) {
    return response.status(400).json({ message: "Invalid studentId" });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT c.* FROM student_course AS sc JOIN courses AS c ON sc.courseId = c.id WHERE sc.userId = $1",
      [userId]
    );
    client.release();

    return response.status(200).send(result.rows);
  } catch (error) {
    console.error("Error retrieving courses for student", error);
    return response
      .status(500)
      .send({ message: "Error retrieving courses for student" });
  }
});

app.delete("/Mycourse/delete/:userId/:courseId", async (request, response) => {
  const {
    params: { userId, courseId },
  } = request;

  if (!courseId && !userId) {
    return res.status(400).json({ message: "Invalid courseId" });
  }

  try {
    const client = await pool.connect();
    await client.query(
      "DELETE FROM student_course WHERE userId = $1 AND courseId = $2",
      [userId, courseId]
    );

    client.release();
    return response.status(201).send({ msg: "course is deleted successfully" });
  } catch (error) {
    console.error("Error removing course from student", error);
    return response
      .status(500)
      .send({ message: "Error removing course from student" });
  }
});

app.get("/api/courses/search/:search", async (request, response) => {
  const {
    params: { search },
  } = request;

  try {
    const client = await pool.connect();
    let result;

    if (search.trim() === "") {
      // If search term is empty, return an empty result set
      return response.send([]);
    } else {
      // If search term is not empty, perform the search
      result = await client.query(
        "SELECT * FROM courses WHERE coursename ILIKE $1",
        [`%${search}%`]
      );
    }
    client.release();
    const courses = result.rows;

    // courses.forEach((course) => {
    //   // console.log(course);
    //   const imagePath = course["imagepath"];
    //   // console.log(imagePath);
    //   const base64 = fs.readFileSync(imagePath, { encoding: "base64" });
    //   course.imagepath = base64;
    // });

    return response.status(201).send(courses);
  } catch (error) {
    console.error("Error fetching courses", error);
    response.status(500).send({ error: "Failed to fetch courses" });
  }
});

app.get("/api/user/:id", async (request, response) => {
  const {
    params: { id },
  } = request;

  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);

    const user = result.rows[0];

    if (!user) {
      return response.status(404).send({ message: "User not found" });
    }
    // console.log(user);

    // if (!user.imagepath) {
    //   return response.status(400).send({ message: "User image not found" });
    // }

    // const imagePath = user.imagepath;
    // const base64 = fs.readFileSync(imagePath, { encoding: "base64" });

    // // Update the user object with the base64-encoded image
    // user.imagepath = base64;

    return response.status(201).send(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return response.status(500).send({ message: "Internal server error" });
  }
});

// profile
app.patch("/api/edit/:id", async (request, response) => {
  const {
    params: { id },
    body,
  } = request;

  const { name, email, area, address, mobile } = body;

  try {
    const client = await pool.connect();
    const result = await client.query(
      "UPDATE users SET name = $1, email = $2, area = $3 , address=$4 , mobilenumber = $5  WHERE id = $6 RETURNING *",
      [name, email, area, address, mobile, id]
    );

    client.release();
    if (result.rowCount === 1) {
      const updatedUser = result.rows[0];
      return response.status(200).send({
        message: "User updated successfully",
        updatedUser,
      });
    } else {
      return response.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return response.status(500).send({ message: "Internal server error" });
  }

  // response.sendStatus(200);
});

app.put("/api/editPassword/:id", async (request, response) => {
  const {
    params: { id },
    body,
  } = request;

  const { password } = body;

  try {
    const client = await pool.connect();
    const result = await client.query(
      "UPDATE users SET password = $1 WHERE id = $2 RETURNING *",
      [password, id]
    );
    client.release();

    if (result.rows.length > 0) {
      const updatedUser = result.rows[0];
      return response.status(200).send({
        message: "Password updated successfully",
        updatedUser,
      });
    } else {
      return response.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error updating password:", error);
    return response.status(500).send({ message: "Error updating password" });
  }
});

app.delete("/api/delete/:id", async (request, response) => {
  const {
    params: { id },
  } = request;

  try {
    const client = await pool.connect();
    const result = await client.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );
    client.release();
    if (result.rows.length > 0) {
      return response.status(200).send({
        message: "User deleted successfully",
      });
    } else {
      return response.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    return response.status(500).send({ message: "Error deleting user" });
  }
});

// admin functions

// admin function return all users
app.get("/api/auth/users", async (request, response) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM users");
    client.release();
    return response.send(result.rows);
  } catch (error) {
    console.error("Error fetching courses", error);
    response.status(500).json({ error: "Failed to fetch courses" });
  }
  return response.status(201).send(users);
});

// edit course /:id
app.put("/api/editCourse/:id", async (request, response) => {
  const { id } = request.params;
  const { name, description, price, imagepath } = request.body;

  if (!name || !description || !price || !imagepath) {
    return response.status(400).json({ message: "Missing required fields" });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      "UPDATE courses SET name = $1, description = $2, price = $3, imagePath = $4 WHERE id = $5 RETURNING *",
      [name, description, price, imagepath, id]
    );
    client.release();

    if (result.rows.length === 0) {
      return response.status(404).send({ message: "Course not found" });
    }

    const updatedCourse = result.rows[0];
    return response
      .status(200)
      .send({ message: "Course updated successfully", updatedCourse });
  } catch (error) {
    console.error("Error updating course:", error);
    return response.status(500).send({ message: "Internal server error" });
  }
});

// delete course /:id
app.delete("/api/deleteCourse/:id", async (request, response) => {
  const { id } = request.params;

  try {
    const client = await pool.connect();
    const result = await client.query(
      "DELETE FROM courses WHERE id = $1 RETURNING *",
      [id]
    );
    client.release();

    if (result.rows.length === 0) {
      return response.status(404).send({ message: "Course not found" });
    }

    return response
      .status(200)
      .send({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    return response.status(500).send({ message: "Internal server error" });
  }
});

// add course    ba5o delsoora felfront end a7otha fe firebase we a5od ellink wab3t b2a elrequest
