import { Router } from "express";
import {
  body,
  checkSchema,
  matchedData,
  validationResult,
} from "express-validator";
import {
  LoginValidateScheme,
  RegisterValidateScheme,
} from "../../validation/validationScheme.mjs";
import { users } from "../../constants/users.mjs";
import { pool } from "../../Services/database.mjs";
import fs from "fs";
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";

const router = Router();

router.post(
  "/api/auth/register",
  checkSchema(RegisterValidateScheme),
  async (request, response) => {
    const result = validationResult(request);
    // console.log(result.profilePicture);
    if (!result.isEmpty())
      return response.status(400).send({
        errors: result.array(),
      });

    const data = matchedData(request);
    // console.log(data["profilePicture"]);
    // const __dirname = dirname(fileURLToPath(import.meta.url));
    // const uploadDir = join(__dirname, "..", "..", "uploads", "users");
    // let counter = 1;

    // console.log(__dirname);
    // const base64Image = data["profilePicture"].split(";base64,").pop();
    // const imagePath = join(uploadDir, `image${counter}.jpg`);
    // fs.writeFileSync(imagePath, base64Image, { encoding: "base64" });

    // console.log(imagePath);

    // const saveToFE = join(
    //   __dirname,
    //   "..",
    //   "..",
    //   "..",
    //   "..",
    //   "front-end",
    //   "assets",
    //   "uploads"
    // );

    // const anotherImagePath = join(saveToFE, `image${counter}.jpg`);
    // fs.writeFileSync(anotherImagePath, base64Image, { encoding: "base64" });
    // counter++;
    try {
      const client = await pool.connect();
      const ExistingUser = await client.query(
        "SELECT * FROM users WHERE email = $1",
        [data.email]
      );
      if (ExistingUser.rows.length > 0) {
        // Email already exists, return a 409 Conflict status
        client.release();
        return response.status(409).json({ error: "Email already registered" });
      }

      const resultt = await client.query(
        "INSERT INTO users (name,  email , password ,address, imagePath, role ,balance, area , mobileNumber) VALUES ($1, $2, $3 ,$4 ,$5, $6, $7, $8, $9) RETURNING *",
        [
          data.name,
          data.email,
          data.password,
          data.address,
          data.profilePicture,
          data.role,
          data.balance,
          data.area,
          data.mobile,
        ]
      );

      client.release();
      return response.status(201).send({ msg: "User Created Successfully" });
    } catch (error) {
      console.error("Error registering user", error);
      return response.status(500).json({ error: "Failed to register user" });
    }
  }
);

router.post(
  "/api/auth/login",
  checkSchema(LoginValidateScheme),
  async (request, response) => {
    const result = validationResult(request);
    if (!result.isEmpty()) {
      return response.status(400).send({
        errors: result.array(),
      });
    }
    const data = matchedData(request);

    try {
      const client = await pool.connect();
      const result = await client.query(
        "SELECT * FROM users WHERE email = $1 AND password = $2",
        [data.email, data.password]
      );
      if (result.rows.length === 1) {
        // User authenticated
        const user = result.rows[0];
        client.release();
        return response.status(200).send({
          message: "Login successful",
          user,
        });
      } else {
        client.release();
        return response
          .status(401)
          .json({ error: "Invalid email or password" });
      }
    } catch (error) {
      console.error("Error authenticating user", error);
      return response
        .status(500)
        .json({ error: "Failed to authenticate user" });
    }
  }
);

// router.get("/api/userImage", (resquest, response) => {
//   const imagePath = join(__dirname, "uploads", "image.jpg");
//   response.sendFile(imagePath);
// });

export default router;
