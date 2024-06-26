const router = require("express").Router();

const { authJWT } = require("../../app/middlewares");
const FruitController = require("../../app/controllers/fruit.controller");

router.get("/", authJWT, FruitController.getListfruit);
router.get("/count", authJWT, FruitController.countFruit);
router.get("/:id", authJWT, FruitController.findFruit);
router.post("/", authJWT, FruitController.createFruit);
router.put("/:id", authJWT, FruitController.updateFruit);
router.delete("/:id", authJWT, FruitController.deleteFruit);

module.exports = router;