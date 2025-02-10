import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = path.resolve("public/images");

export const POST = async (req: NextRequest) => {
  const formData = await req.formData();
  const body = Object.fromEntries(formData);
  const file = (body.image as Blob) || null;  // Fixed field name

  if (file) {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Ensure the images directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    // Create a unique file name to avoid overwriting
    const uniqueFileName = `${(body.image as File).name}`            //`${Date.now()}-${(body.image as File).name}`;

    fs.writeFileSync(
      path.resolve(UPLOAD_DIR, uniqueFileName),
      buffer
    );

    return NextResponse.json({
      success: true,
      name: uniqueFileName,  // Return the file name
      url: `/images/${uniqueFileName}`,  // Provide the URL to access it
    });
  } else {
    return NextResponse.json({
      success: false,
      message: 'No file uploaded',
    });
  }
};
