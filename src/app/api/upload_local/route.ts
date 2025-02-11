import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

// // localhost
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


// // // GitHub API Constants
// const GITHUB_API_URL = "https://api.github.com";
// const REPO_OWNER = "mammoth-xcode"; // Your GitHub username or organization name
// const REPO_NAME = "meeting-booking"; // Your repository name
// const BRANCH_NAME = "main"; // The branch you want to commit to
// const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Store your GitHub token securely in .env

// export const POST = async (req: NextRequest) => {
//   const formData = await req.formData();
//   const body = Object.fromEntries(formData);
//   const file = (body.image as Blob) || null;

//   if (file) {
//     const buffer = Buffer.from(await file.arrayBuffer());
//     const fileName = `${(body.image as File).name}`;

//     // Encode the file content in base64
//     const base64Content = buffer.toString('base64');

//     // GitHub API - Create or update a file in the repository
//     try {
//       const createOrUpdateFileResponse = await fetch(
//         `${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/public/images/${fileName}`,
//         {
//           method: 'PUT',
//           headers: {
//             'Authorization': `Bearer ${GITHUB_TOKEN}`,
//             'Accept': 'application/vnd.github.v3+json',
//           },
//           body: JSON.stringify({
//             message: `Upload image: ${fileName}`, // Commit message
//             content: base64Content, // The content of the file (in base64)
//             branch: BRANCH_NAME,
//           }),
//         }
//       );

//       const responseData = await createOrUpdateFileResponse.json();

//       if (createOrUpdateFileResponse.ok) {
//         return NextResponse.json({
//           success: true,
//           name: fileName,
//           url: `https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/${BRANCH_NAME}/public/images/${fileName}`,
//         });
//       } else {
//         return NextResponse.json({
//           success: false,
//           message: `GitHub API error: ${responseData.message || 'Unknown error'}`,
//         });
//       }
//     } catch (error) {
//       // Handle network or other errors
//       return NextResponse.json({
//         success: false,
//         message: `Network or server error: ${error}`,
//       });
//     }
//   } else {
//     return NextResponse.json({
//       success: false,
//       message: 'No file uploaded',
//     });
//   }
// };