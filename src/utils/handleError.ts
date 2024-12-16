import { z } from "zod";
import { Response } from "express";
export const handleError = (error : any, res : Response) => {
    if (error instanceof z.ZodError) {
          return res.status(400).json({
            name: "Invalid Data Type",
            message: JSON.parse(error.message),
          });
        }
        return res.status(500).json({ message: "Internal Server Error", error });
}