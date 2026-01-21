const http = require("http");

function checkEndpoint(path) {
  return new Promise((resolve) => {
    http
      .get(`http://localhost:5000${path}`, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode === 200) {
            try {
              const json = JSON.parse(data);
              console.log(
                `✅ ${path}: OK`,
                JSON.stringify(json).substring(0, 50) + "...",
              );
              resolve(true);
            } catch (e) {
              console.log(`❌ ${path}: Invalid JSON`);
              resolve(false);
            }
          } else {
            console.log(`❌ ${path}: Failed (Status: ${res.statusCode})`);
            resolve(false);
          }
        });
      })
      .on("error", (err) => {
        console.log(`❌ ${path}: Error (${err.message})`);
        resolve(false);
      });
  });
}

async function test() {
  console.log("🚀 Testing Dashboard APIs...");
  const p1 = await checkEndpoint("/api/memory");
  const p2 = await checkEndpoint("/api/learning");
  const p3 = await checkEndpoint("/api/notifications");

  if (p1 && p2 && p3) {
    console.log("\n✅ All Dashboard APIs are operational!");
  } else {
    console.log("\n❌ Some APIs failed. Did you restart the server?");
  }
}

test();
