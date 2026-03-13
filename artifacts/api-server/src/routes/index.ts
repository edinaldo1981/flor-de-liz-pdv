import { Router, type IRouter } from "express";
import healthRouter from "./health";
import clientesRouter from "./clientes";
import vendasRouter from "./vendas";
import produtosRouter from "./produtos";

const router: IRouter = Router();

router.use(healthRouter);
router.use(clientesRouter);
router.use(vendasRouter);
router.use(produtosRouter);

export default router;
