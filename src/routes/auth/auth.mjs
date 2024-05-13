import { Router } from "express";
import { checkSchema, matchedData, validationResult } from "express-validator";
import {
  LoginValidateScheme,
  RegisterValidateScheme,
} from "../../validation/validationScheme.mjs";
import { pool } from "../../Services/database.mjs";
import bcrypt from "bcrypt";

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

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const resultt = await client.query(
        "INSERT INTO users (name,  email , password ,address, imagePath, role ,balance, area , mobileNumber) VALUES ($1, $2, $3 ,$4 ,$5, $6, $7, $8, $9) RETURNING *",
        [
          data.name,
          data.email,
          hashedPassword,
          data.address,
          data.profilePicture,
          data.role,
          data.balance,
          data.area,
          data.mobile,
        ]
      );

      client.release();
      const user = resultt.rows[0];
      return response
        .status(201)
        .send({ msg: "User Created Successfully", user });
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
        "SELECT * FROM users WHERE email = $1",
        [data.email]
      );
      if (result.rows.length === 1) {
        const user = result.rows[0];
        // Use bcrypt.compare to compare the hashed password
        const passwordMatch = await bcrypt.compare(
          data.password,
          user.password
        );
        if (passwordMatch) {
          // Passwords match, user authenticated
          client.release();
          return response.status(200).send({
            message: "Login successful",
            user,
          });
        }
      }
      client.release();
      return response.status(401).json({ error: "Invalid email or password" });
    } catch (error) {
      console.error("Error authenticating user", error);
      return response
        .status(500)
        .json({ error: "Failed to authenticate user" });
    }
  }
);

export default router;
