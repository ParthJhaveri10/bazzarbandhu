import express from "express"
import { supabase } from "../config/supabase.js"

const router = express.Router()

router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Auth service using Supabase",
    timestamp: new Date().toISOString()
  })
})

export default router
