import { Router, type IRouter } from "express";
import healthRouter from "./health";
import searchRouter from "./search";
import playRouter from "./play";
import recommendationsRouter from "./recommendations";
import historyRouter from "./history";
import likesRouter from "./likes";
import playlistsRouter from "./playlists";

const router: IRouter = Router();

router.use(healthRouter);
router.use(searchRouter);
router.use(playRouter);
router.use(recommendationsRouter);
router.use(historyRouter);
router.use(likesRouter);
router.use(playlistsRouter);

export default router;
