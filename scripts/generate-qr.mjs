import QRCode from "qrcode";
import fs from "fs";

const URL = "https://cv-blog.pages.dev";

const svgString = await QRCode.toString(URL, {
  type: "svg",
  errorCorrectionLevel: "M",
  margin: 2,
  color: { dark: "#006600", light: "#00000000" }
});
fs.writeFileSync("public/qr.svg", svgString);

await QRCode.toFile("public/qr.png", URL, {
  errorCorrectionLevel: "M",
  margin: 2,
  width: 1024,
  color: { dark: "#006600", light: "#faf9f5" }
});

console.log("QR generated:", "public/qr.svg", "+", "public/qr.png");
