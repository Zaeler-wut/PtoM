import express from "express"
import * as model from "./authModel"

const router = express.Router()

router.post("/register", async (req, res) => {
  try {
    const result = await model.register(req.body)
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.post("/login", async (req, res) => {
  try {
    const result = await model.login(req.body)

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      sameSite: "strict"
    })

    res.json({ accessToken: result.accessToken })

  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.post("/refresh-token", async (req, res) => {
  try {
    const result = await model.refreshToken(req)
    res.json(result)
  } catch (err: any) {
    res.status(401).json({ error: err.message })
  }
})

router.post("/logout", async (req, res) => {
  res.clearCookie("refreshToken")
  res.json({ message: "Logged out" })
})


export default router