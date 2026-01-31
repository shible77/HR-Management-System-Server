import { Request, Response } from "express";
import { handleError } from "../../utils/handleError";
import { db } from "../../db/setup";
import { users, passwordResetTokens } from "../../db/schema";
import { sendVerificationEmail } from "../../services/mailService";
import { z } from "zod";
import { eq } from "drizzle-orm";
const crypto = require("crypto");

function generateVerificationCode() {
  return crypto.randomInt(100000, 1000000); // Generates a 6-digit number
}

const verifyEmailSchema = z.object({
  email: z.string().email(),
});
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email } = verifyEmailSchema.parse(req.body);
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .execute();
    if (user.length === 0) {
      return res
        .status(404)
        .json({
          status: false,
          message: "No user exist for this email",
          email,
        });
    }
    const token = JSON.stringify(generateVerificationCode());
    const insertTokenForUser = await db
      .insert(passwordResetTokens)
      .values({
        token: token,
        userId: user[0].userId,
      })
      .returning({
        tokenId: passwordResetTokens.tokenId,
        createdAt: passwordResetTokens.createdAt,
      })
      .execute();
    await sendVerificationEmail(email, token);
    return res
      .status(200)
      .json({
        status: true,
        message: "Verification code sent to your email",
        email,
        tokenInfo: insertTokenForUser[0]
      });
  } catch (error) {
    handleError(error, res);
  }
};

const verifyTokenSchema = z.object({
  token: z.string(),
});
export const verifyToken = async (req: Request, res: Response) => {
    try{
        const { token } = verifyTokenSchema.parse(req.body);
        const tokenId  = z.coerce.number().parse(req.params.id);
        const tokenInfo = await db
            .select()
            .from(passwordResetTokens)
            .where(eq(passwordResetTokens.tokenId, tokenId))
            .execute();
        if(tokenInfo.length > 0 && (Date.now() - tokenInfo[0].createdAt.getTime() > 1000 * 60 * 5)){
            return res.status(401).json({status : false, message:"Token expired"});
        }
        if(token !== tokenInfo[0].token){
            return res.status(401).json({status : false, message:"Invalid token"});
        }
        await db.update(passwordResetTokens).set({isUsed : true}).where(eq(passwordResetTokens.tokenId, tokenId)).execute();
        return res.status(200).json({status : true, message:"Token verified", userId : tokenInfo[0].userId});
    }catch(error){
        handleError(error, res);
    }
};

const resetPasswordSchema = z.object({
    password : z.string().min(6)
})
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { password } = resetPasswordSchema.parse(req.body);
        const userId  = z.coerce.string().parse(req.params.id);
        await db.update(users).set({password}).where(eq(users.userId, userId)).execute();
        return res.status(200).json({status : true, message:"Password reset successfully"});
    }catch(error){
        handleError(error, res);
    }
}