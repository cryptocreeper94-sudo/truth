import { Router, type IRouter } from "express";
import healthRouter from "./health";
import keyManagementRouter from "./key-management";

const router: IRouter = Router();

router.use(healthRouter);
router.use(keyManagementRouter);

export default router;
