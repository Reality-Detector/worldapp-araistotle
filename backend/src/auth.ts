import { Router } from "express";
import { Issuer, generators } from "openid-client";
import session from "express-session";

const router = Router();

// session middleware to be mounted in index.ts; here we only expose routes

// Discover and create client lazily
let clientPromise: Promise<any> | null = null;
function getClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      // World ID OIDC issuer configuration
      const issuer = await Issuer.discover("https://id.worldcoin.org");
      const client = new issuer.Client({
        client_id: process.env.WLD_CLIENT_ID!,
        client_secret: process.env.WLD_CLIENT_SECRET!,
        redirect_uris: [process.env.AUTH_CALLBACK_URL!],
        response_types: ["code"],
      });
      return client;
    })();
  }
  return clientPromise;
}

router.get("/login", async (req, res) => {
  const client = await getClient();
  const codeVerifier = generators.codeVerifier();
  const codeChallenge = generators.codeChallenge(codeVerifier);
  // store verifier in session
  req.session.codeVerifier = codeVerifier;
  const authUrl = client.authorizationUrl({
    scope: "openid profile email",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  res.redirect(authUrl);
});

router.get("/callback", async (req, res) => {
  try {
    const client = await getClient();
    const params = client.callbackParams(req);
    const tokenSet = await client.callback(process.env.AUTH_CALLBACK_URL!, params, {
      code_verifier: req.session.codeVerifier,
    });
    // tokenSet contains id_token, access_token
    // store the tokenSet in session (serialize minimally)
    req.session.user = tokenSet.claims();
    res.redirect(process.env.FRONTEND_URL || "/");
  } catch (err) {
    console.error("OIDC callback error", err);
    res.status(500).send("Authentication error");
  }
});

router.get("/me", (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ user: null });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error", err);
    }
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

export default router;
