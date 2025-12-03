// export function parseBase64(base64: string) {
//     return Buffer.from(base64, "base64").toString("utf8");
// }

// export function decodeJwt(token: string) {
//     if (!token || typeof token !== "string" || token.length == 0) return null;
//     const [, payload] = token.split(".");
//     if (!payload || payload.length == 0) return null;
//     const json = parseBase64(payload);
//     return JSON.parse(json);
// }
