import { Router, type IRouter } from "express";
import healthRouter from "./health";
import clientesRouter from "./clientes";
import vendasRouter from "./vendas";

const router: IRouter = Router();

router.use(healthRouter);
router.use(clientesRouter);
router.use(vendasRouter);

export default router;
