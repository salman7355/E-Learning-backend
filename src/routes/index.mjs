import { Router } from "express";
import authRouter from "./auth/auth.mjs";

const router = Router();

router.use(authRouter);





export default router;
