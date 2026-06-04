async function main() {
  const suffix = Math.floor(Math.random() * 100000);
  const patientEmail = `patient_${suffix}@gmail.com`;
  const password = "Password123!";

  try {
    // 1. Sign up patient
    const pForm = new FormData();
    pForm.append("userName", `Patient_${suffix}`);
    pForm.append("email", patientEmail);
    pForm.append("password", password);
    pForm.append("cPassword", password);
    pForm.append("phoneNumber", "01234567890");
    pForm.append("role", "user");
    pForm.append("age", "25");
    pForm.append("gender", "male");
    await fetch("https://mind-space-ov3r.onrender.com/auth/sign-up", { method: "POST", body: pForm });

    // 2. Log in patient
    const pLoginRes = await fetch("https://mind-space-ov3r.onrender.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: patientEmail, password })
    });
    const pLoginData = await pLoginRes.json();
    const pToken = pLoginData?.data?.accessToken;
    if (!pToken) {
      console.log("Failed to log in patient.");
      return;
    }

    const testEndpoints = [
      "https://mind-space-ov3r.onrender.com/session/patient",
      "https://mind-space-ov3r.onrender.com/session/user",
      "https://mind-space-ov3r.onrender.com/session",
      "https://mind-space-ov3r.onrender.com/session/my-sessions",
      "https://mind-space-ov3r.onrender.com/session/patient-sessions"
    ];

    for (const url of testEndpoints) {
      console.log(`Testing GET ${url} ...`);
      const res = await fetch(url, {
        headers: { Authorization: `dash ${pToken}` }
      });
      console.log(`Status: ${res.status}`);
      const data = await res.json().catch(() => ({}));
      console.log(`Response:`, JSON.stringify(data).substring(0, 200));
      console.log("----------------------------------------");
    }

  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
