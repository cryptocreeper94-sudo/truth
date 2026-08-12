import { Router, type IRouter } from "express";
import healthRouter from "./health";
import keyManagementRouter from "./key-management";
import composeRouter from "./compose";
import composeShareRouter from "./compose-share";
import imageGenRouter from "./image-gen";
import exportPdfRouter from "./export-pdf";
import demoRouter from "./demo";
import verifyRouter from "./verify";

const router: IRouter = Router();

router.use(healthRouter);
router.use(keyManagementRouter);
router.use(composeRouter);
router.use(composeShareRouter);
router.use(imageGenRouter);
router.use(exportPdfRouter);
router.use(demoRouter);
router.use(verifyRouter);

export default router;
