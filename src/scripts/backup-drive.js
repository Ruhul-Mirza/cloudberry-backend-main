require("dotenv").config();

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { google } = require("googleapis");
const { createClient } = require("@supabase/supabase-js");
const { Parser } = require("json2csv");

// 🔐 ENV
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 📁 OAuth setup
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const TOKEN_PATH = path.join(__dirname, "token.json");

const credentials = require("./credentials.json");
const { client_secret, client_id, redirect_uris } = credentials.installed;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0],
);

// 🔑 Authorize
function authorize() {
  return new Promise((resolve, reject) => {
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) {
        getAccessToken(oAuth2Client).then(resolve).catch(reject);
      } else {
        oAuth2Client.setCredentials(JSON.parse(token));
        resolve(oAuth2Client);
      }
    });
  });
}

// 🔐 First time login
function getAccessToken(oAuth2Client) {
  return new Promise((resolve, reject) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });

    console.log("\n👉 Open this link in browser:\n", authUrl);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("\n👉 Paste the code here: ", (code) => {
      rl.close();
      oAuth2Client.getToken(code.trim(), (err, token) => {
        if (err) return reject(err);

        oAuth2Client.setCredentials(token);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
        console.log("✅ Token saved!");
        resolve(oAuth2Client);
      });
    });
  });
}

// 📅 Date
const now = new Date();
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const monthName = months[now.getMonth()];
const day = String(now.getDate()).padStart(2, "0");

// 📁 Create / Get Folder
async function getOrCreateFolder(auth, name, parent) {
  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.list({
    q: `name='${name}' and '${parent}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
  });

  if (res.data.files.length > 0) {
    return res.data.files[0].id;
  }

  const folder = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parent],
    },
    fields: "id",
  });

  return folder.data.id;
}

// 📤 Upload file
async function uploadFile(auth, filePath, fileName, folderId) {
  const drive = google.drive({ version: "v3", auth });

  await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType: "text/csv",
      body: fs.createReadStream(filePath),
    },
  });
}

// 🔥 MAIN BACKUP
async function runBackup() {
  console.log("🚀 Backup started...");

  const auth = await authorize();

  // 👉 👇 APNA FOLDER ID DAAL
  const ROOT_FOLDER_ID = "1R-HTqxdpZNmJh-Yxn8FpVHy9qQea9Zml";

  // 📁 Folder structure
  const monthFolder = await getOrCreateFolder(auth, monthName, ROOT_FOLDER_ID);
  const dayFolder = await getOrCreateFolder(auth, day, monthFolder);

  // ✅ Tables
  const tables = [
    "admins",
    "bootcamp_page_data",
    "categories",
    "certificates",
    "contact_forms",
    "courses",
    "reviews",
  ];

  console.log("📦 Tables:", tables);

  for (const table of tables) {
    try {
      console.log(`⬇️ Backing up ${table}`);

      const { data, error } = await supabase.from(table).select("*");

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
        continue;
      }

      if (!data || data.length === 0) {
        console.log(`⚠️ ${table} empty`);
        continue;
      }

      const parser = new Parser();
      const csv = parser.parse(data);

      const filePath = path.join(__dirname, `${table}.csv`);
      fs.writeFileSync(filePath, csv);

      // ✅ Upload inside DAY folder
      await uploadFile(auth, filePath, `${table}.csv`, dayFolder);

      fs.unlinkSync(filePath);

      console.log(`✅ Uploaded ${table}`);
    } catch (err) {
      console.log(`❌ Error in ${table}:`, err.message);
    }
  }

  console.log("🎉 Backup completed successfully!");
}

runBackup();
