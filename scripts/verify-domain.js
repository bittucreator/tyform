const https = require("https");

const data = JSON.stringify({
  status: "verified",
  verified_at: new Date().toISOString()
});

const options = {
  hostname: "dvuumqmcugednobczjwy.supabase.co",
  path: "/rest/v1/workspace_domains?id=eq.e209b2e4-2bfc-4d4a-bd69-584be6da5690",
  method: "PATCH",
  headers: {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dXVtcW1jdWdlZG5vYmN6and5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYxODQ3MywiZXhwIjoyMDg1MTk0NDczfQ.1x--sL5unKnT9gX8aTDvIwYJ3eWnPw-OpYKhLHg3Cpo",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dXVtcW1jdWdlZG5vYmN6and5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYxODQ3MywiZXhwIjoyMDg1MTk0NDczfQ.1x--sL5unKnT9gX8aTDvIwYJ3eWnPw-OpYKhLHg3Cpo",
    "Content-Type": "application/json",
    "Content-Length": data.length
  }
};

const req = https.request(options, res => {
  console.log("Status:", res.statusCode);
  let body = "";
  res.on("data", d => body += d);
  res.on("end", () => {
    if (body) console.log("Response:", body);
    console.log("Domain verified!");
  });
});

req.on("error", e => console.error("Error:", e.message));
req.write(data);
req.end();
