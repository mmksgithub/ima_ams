import asyncHandler from "express-async-handler";
import path from "path";

import fs from "fs";

const uploadImage = asyncHandler(async (req, res) => {
  const folderName = req.query.folderName;

  const imageBuffer = req.filter.imagebuffer;
});
