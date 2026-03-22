import express from "express"
import { prisma } from './lib/prisma'
import cors from "cors"
import cookieParser from "cookie-parser"

import authRouter from "./modules/auth/authRouter"
import propertyRouter from "./modules/property/propertyRouter"
import roomRouter from "./modules/room/roomRouter"
import bookingRouter from "./modules/booking/bookingRouter"
import contractRouter from "./modules/contract/contractRouter"
import tenantRouter from "./modules/tenant/tenantRouter"
import billingRouter from "./modules/billing/billingRouter"
import moveOutRouter from "./modules/moveout/moveOutRouter"
import dashboardRouter from "./modules/dashboard/dashboardRouter"
import uploadRouter from "./modules/upload/uploadRouter"


const app = express();
const port = process.env.PORT || 8080;

app.use(cors({
  origin: true,
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

console.log("uploadRouter loaded:", uploadRouter)  // ← เพิ่ม
app.use("/api/upload", uploadRouter)

app.get("/api/upload/test", (req, res) => {
  res.json({ ok: true })
})
 
app.use("/api/auth",  authRouter)
app.use("/api/admin", propertyRouter)
app.use("/api/admin", roomRouter)
app.use("/api/admin", bookingRouter)
app.use("/api/admin", contractRouter)
app.use("/api/admin", tenantRouter)
app.use("/api/admin", billingRouter)
app.use("/api/admin", moveOutRouter)
app.use("/api/admin", dashboardRouter)

app.listen(port, () => {
    console.log(`Server is running on http:localhost:${port}`);
});