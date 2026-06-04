async function main() {
  const suffix = Math.floor(Math.random() * 100000);
  const email = `therapist_check_${suffix}@gmail.com`;
  const password = "Password123!";

  try {
    // 1. Sign up therapist
    const form = new FormData();
    form.append("userName", `Dr. Test ${suffix}`);
    form.append("email", email);
    form.append("password", password);
    form.append("cPassword", password);
    form.append("phoneNumber", "01099999999");
    form.append("role", "therapist");
    form.append("age", "38");
    form.append("gender", "male");
    form.append("sessionFee", "180");
    form.append("experience", "8");
    form.append("specialty", "therapist");

    const signupRes = await fetch("https://mind-space-ov3r.onrender.com/auth/sign-up", {
      method: "POST",
      body: form
    });
    const signupData = await signupRes.json();
    const therapistId = signupData?.data?._id;
    console.log("Therapist Signed Up. ID:", therapistId);

    // 2. Sign up admin to verify
    const adminEmail = `admin_check_${suffix}@gmail.com`;
    const aForm = new FormData();
    aForm.append("userName", `Admin_${suffix}`);
    aForm.append("email", adminEmail);
    aForm.append("password", password);
    aForm.append("cPassword", password);
    aForm.append("phoneNumber", "01555555555");
    aForm.append("role", "admin");
    aForm.append("age", "30");
    aForm.append("gender", "male");
    await fetch("https://mind-space-ov3r.onrender.com/auth/sign-up", { method: "POST", body: aForm });

    const aLoginRes = await fetch("https://mind-space-ov3r.onrender.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password })
    });
    const aLoginData = await aLoginRes.json();
    const aToken = aLoginData.data.accessToken;

    await fetch(`https://mind-space-ov3r.onrender.com/admin/judge-cv/${therapistId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `dash ${aToken}` },
      body: JSON.stringify({ decision: "accepted" })
    });

    // 3. Log in therapist
    const loginRes = await fetch("https://mind-space-ov3r.onrender.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const loginData = await loginRes.json();
    const token = loginData?.data?.accessToken;

    // 4. Fetch profile
    const profileRes = await fetch("https://mind-space-ov3r.onrender.com/user/profile", {
      headers: { Authorization: `dash ${token}` }
    });
    const profileData = await profileRes.json();
    console.log("Therapist Full Profile Data:", JSON.stringify(profileData, null, 2));

  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
