import express from "express"
import * as model from "./adminModel"

import { authenticate } from "../../middlewares/authenticate"
import { authorize } from "../../middlewares/authorize"
import { authorizePropertyAdmin } from "../../middlewares/authorizePropertyAdmin"

import * as service from "./adminService";

const router = express.Router()

// GET PROPERTIES
router.get(
  "/properties",
  authenticate,
  authorize("ADMIN"),
  async (req: any, res) => {
    try {
      const data = await service.getMyProperties(req.user.id);
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);



//สร้าง สถานที่
router.post(
  "/properties",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {

    try {

      const result = await service.createProperty(req.body)

      res.status(201).json(result)

    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }
)


// สร้างประเภทห้อง
router.post(
  "/properties/:propertyId/room-types",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      const propertyId = req.params.propertyId;

      const data = await service.createRoomType(
        propertyId,
        req.body
      );

      res.json(data);
    } catch (err: any) {
      console.error(err);
      res.status(400).json({
        message: err.message || "Create failed"
      });
    }
  }
);


// ดึงข้อมูลประเภทห้อง
router.get(
  "/properties/:propertyId/room-types/:roomTypeId",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    const { roomTypeId } = req.params;

    const data = await service.getRoomTypeDetail(roomTypeId);

    res.json(data);
  }
);




// dashboard
router.get(
  "/properties/:propertyId/dashboard",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      const propertyId = req.params.propertyId;

      const data = await service.getDashboard(propertyId);

      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);


export default router



// จัดการห้อง
router.get(
  "/properties/:propertyId/rooms",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    const propertyId = req.params.propertyId;

    const data = await service.getRooms(propertyId);

    res.json(data);
  }
);

router.post(
  "/properties/:propertyId/rooms",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      const propertyId = req.params.propertyId;

      const data = await service.createRoom(
        propertyId,
        req.body
      );

      res.json(data);
    } catch (err: any) {
      console.error(err);
      res.status(400).json({
        message: err.message || "Create room failed"
      });
    }
  }
);