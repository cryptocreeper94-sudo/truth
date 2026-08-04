import { Router, type IRouter } from "express";
import healthRouter from "./health";
import keyManagementRouter from "./key-management";
import composeShareRouter from "./compose-share";
import imageGenRouter from "./image-gen";

const router: IRouter = Router();

router.use(healthRouter);
router.use(keyManagementRouter);
router.use(composeShareRouter);
router.use(imageGenRouter);

export default router;
