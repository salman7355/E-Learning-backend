import { Router } from "express";
import { checkSchema, matchedData, validationResult } from "express-validator";
import {
  LoginValidateScheme,
  RegisterValidateScheme,
} from "../../validation/validationScheme.mjs";
import { users } from "../../constants/users.mjs";

const router = Router();

router.post(
  "/api/auth/register",
  checkSchema(RegisterValidateScheme),
  (request, response) => {
    const {
      body: { name, email, password, address, area, mobile },
    } = request;

    const result = validationResult(request);

    if (!result.isEmpty())
      return response.status(400).send({
        errors: result.array(),
      });

    const data = matchedData(request);
    console.log(data);

    const findusers = users.find((user) => user.email === data.email);

    if (findusers) return response.status(400).send("Invalid Email");

    users.push(data);

    return response.status(200).send(data);
  }
);

router.post(
  "/api/auth/login",
  checkSchema(LoginValidateScheme),
  (request, response) => {
    const result = validationResult(request);
    if (!result.isEmpty()) {
      return response.status(400).send({
        errors: result.array(),
      });
    }

    const data = matchedData(request);

    const findUser = users.find((user) => user.email === data.email);

    if (!findUser) return response.status(404).send("Invalid Credentials");

    if (findUser.password !== data.password)
      return response.status(400).send("Invalid Credentials");

    return response.status(200).send(findUser);
  }
);

export default router;
