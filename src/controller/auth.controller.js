// File: src/controllers/auth.controller.ts
// (This file can be almost entirely copied from your original. The controller just calls the service.)
// Remember to update `req.user.id` to be a string if you are passing the Mongoose `_id` object.
// The `getCurrentUser` function is a good example of a small change:

export const getCurrentUser = async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("TOKEN_INVALID");
    const user = await findUserById(req.user.id);
    if (!user) throw new AppError("USER_NOT_FOUND");

    const userProfile = user.toObject();
    // Mongoose models have a `password` field even if not selected, so we remove it.
    delete (userProfile as any).password;

    sendSuccessResponse(res, { user: userProfile }, "User profile retrieved");
};
