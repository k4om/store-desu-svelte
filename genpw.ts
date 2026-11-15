import argon2 from "argon2";

const hash = await argon2.hash("Admin123");
console.log(hash);