import { Router } from "express";
import { getAlbumById, getAlbums } from "../controllers/album.controller.js";

const route = Router();

route.get("/", getAlbums);
route.get("/:albumId", getAlbumById);

export default route;
