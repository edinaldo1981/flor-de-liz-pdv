import { Router, type IRouter } from "express";
import healthRouter from "./health";
import clientesRouter from "./clientes";
import vendasRouter from "./vendas";
import produtosRouter from "./produtos";
import webhookRouter from "./webhook";
import portalRouter from "./portal";
import haveresRouter from "./haveres";
import dashboardRouter from "./dashboard";
import financeiroRouter from "./financeiro";
import importarRouter from "./importar";
import sheetsRouter from "./sheets";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(clientesRouter);
router.use(vendasRouter);
router.use(produtosRouter);
router.use(webhookRouter);
router.use(portalRouter);
router.use(haveresRouter);
router.use(financeiroRouter);
router.use(importarRouter);
router.use(sheetsRouter);

export default router;
