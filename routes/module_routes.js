const express = require("express");
const { getAllModules, addModules } = require("../controller/modules");
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Module:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The module's unique identifier.
 *         name:
 *           type: string
 *           description: The name of the module.
 *         description:
 *           type: string
 *           description: A brief description of the module.
 *
 * /modules/getModules:
 *   get:
 *     summary: Get all modules
 *     tags:
 *       - Modules
 *     responses:
 *       200:
 *         description: Successfully fetched all modules
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 modules:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Module'  # Referensi ke skema Module
 *       500:
 *         description: Internal server error
 * 
 */
router.get("/getModules", getAllModules);

/**
 * @swagger
 * /modules/addModules:
 *   post:
 *     summary: Add a new module
 *     tags:
 *       - Modules
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the new module.
 *               description:
 *                 type: string
 *                 description: A brief description of the new module.
 *     responses:
 *       201:
 *         description: Module successfully added.
 *       400:
 *         description: Invalid input data.
 */
router.post("/addModules", addModules);

module.exports = router;
