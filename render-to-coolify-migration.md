# Render → Coolify Migration Guide
**Owner:** DarkWave Studios LLC
**Goal:** Move all hosted sites off Render (~$500/mo) to a self-managed Hetzner VPS + Coolify (~$4-8/mo)
**Time required:** 2-3 hours first time. Subsequent sites: 10 minutes each.

---

## What You'll Have When Done
- One Hetzner VPS running Coolify
- All sites auto-deploying from GitHub on every push (identical to Render)
- Custom domains with automatic SSL on every site
- Zero cold starts — everything live 24/7
- One flat bill: ~$4-8/month total

---

## STEP 1 — Create Your Hetzner Account and VPS
*(~10 minutes)*

1. Go to **hetzner.com** → Create account
2. Go to **Cloud** → New Project → name it `DarkWave`
3. Click **Add Server**
   - Location: **Ashburn, VA** (closest US datacenter)
   - Image: **Ubuntu 24.04**
   - Type: **Shared CPU → CX22** (2 vCPU, 4GB RAM) — $4.49/mo
     - If you have 8+ sites running heavy traffic: **CX32** (4 vCPU, 8GB RAM) — $8.49/mo
   - SSH Keys: Click **Add SSH Key**
     - On your Windows machine open PowerShell and run:
       ```
       ssh-keygen -t ed25519 -C "darkwave"
       ```
     - Press Enter through all prompts (saves to `C:\Users\[you]\.ssh\id_ed25519`)
     - Run this to copy your public key:
       ```
       cat C:\Users\[you]\.ssh\id_ed25519.pub
       ```
     - Paste that output into Hetzner's SSH key box
   - Click **Create & Buy**
4. Copy the **server IP address** shown after creation

---

## STEP 2 — Install Coolify
*(~10 minutes)*

Open PowerShell on your machine and SSH in:
```
ssh root@[YOUR_SERVER_IP]
```

Once connected, run this single install command:
```
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Wait for it to finish (3-5 minutes). When done it will show:
```
Coolify is up and running!
Access it at: http://[YOUR_SERVER_IP]:8000
```

Open your browser and go to:
```
http://[YOUR_SERVER_IP]:8000
```

- Create your admin account (email + password — save these)
- You're now inside your Coolify dashboard

---

## STEP 3 — Connect GitHub
*(~5 minutes)*

1. In Coolify: **Settings** → **Source** → **GitHub App** → **Register GitHub App**
2. Follow the prompts — it opens GitHub and asks you to authorize
3. Select **cryptocreeper94-sudo** as the account
4. Give it access to **All repositories** (or select each one manually)
5. Click **Install & Authorize**

Coolify can now see and deploy all your GitHub repos.

---

## STEP 4 — Add Each Site
*(~10 minutes per site)*

For each site, click **New Resource** → **Application** → **GitHub Repository**

### cox.tlid.io (CEP)
- Repo: `cryptocreeper94-sudo/CEP` · Branch: `master`
- Build Command: `npm install && npm run build`
- Start Command: `npx vite preview --host 0.0.0.0 --port $PORT`
- Port: `$PORT` (Coolify sets this automatically)
- Domain: `cox.tlid.io`
- Copy all env variables from Render's CEP service

### gov.tlid.io (Gov-Site)
- Repo: `cryptocreeper94-sudo/Gov-Site` · Branch: `main`
- Build Command: `npm install && npm run build`
- Start Command: `npx vite preview --host 0.0.0.0 --port $PORT`
- Port: `$PORT`
- Domain: `gov.tlid.io`
- Copy all env variables from Render's Gov-Site service

### lotopspro.com (WLOPS)
- Repo: `cryptocreeper94-sudo/WLOPS` · Branch: `main`
- Build Command: `npm install && npm run build`
- Start Command: `npm run start`
- Port: `$PORT`
- Domain: `lotopspro.com`
- Copy all env variables from Render's WLOPS service

### axiomnews (Frontend)
- Repo: `cryptocreeper94-sudo/axiomnews` · Branch: `main`
- Build Command: `npm install && npm run build`
- Start Command: `npx vite preview --host 0.0.0.0 --port $PORT`
- Port: `$PORT`
- Domain: whatever domain you use for axiom news
- Env variable: `VITE_API_URL=https://[your-axiom-api-domain]`

### Axiom News API (Python backend)
- Repo: `cryptocreeper94-sudo/axiomnews` · Branch: `main`
- Root directory: `/` (or wherever the Python server lives)
- Build Command: `pip install -r requirements.txt`
- Start Command: `python server.py` (or whatever your start script is)
- Port: `$PORT`
- Domain: `axiom-api.[your-domain].com` or similar
- Copy all env variables (Gemini API key, ElevenLabs key, etc.)

---

## STEP 5 — Point Your Domains to the New Server
*(~5 minutes per domain — DNS propagation takes up to 1 hour)*

For each domain, go to wherever your DNS is managed (Cloudflare, GoDaddy, etc.):

1. Find the **A record** for that domain
2. Change the IP address from Render's IP → **your Hetzner IP**
3. Save

To find your current Render IPs (to confirm you have the right ones):
- Go to each Render service → Settings → you'll see the outbound IP

Repeat for every domain. Coolify handles SSL automatically once DNS points to your server.

---

## STEP 6 — Verify Each Site
*(~15 minutes)*

For each site after DNS propagates:
1. Open the domain in browser — confirm it loads
2. Push a small change to GitHub (add a space, save, commit, push)
3. Watch Coolify's deploy log — confirm it auto-deploys

If a site shows SSL error: wait 10 more minutes. Coolify generates the cert automatically via Let's Encrypt.

---

## STEP 7 — Cancel Render Services
*(Do this LAST — only after every site is verified on Coolify)*

1. Log into Render
2. For each service: **Settings** → **Delete Service**
3. Confirm deletion
4. Cancel your Render subscription if no services remain

**Do not cancel Render until every site is confirmed live on Coolify.**

---

## Auto-Deploy Behavior After Migration
Identical to Render:
- Push to GitHub → Coolify detects webhook → builds → deploys
- Build logs visible in real time in Coolify dashboard
- Failed builds do not take down the live site (same as Render)
- Rollback available from Coolify dashboard

---

## If Something Breaks

**Site not loading after DNS change:**
- DNS hasn't propagated yet — wait 30-60 minutes
- Check: `nslookup [yourdomain.com]` in PowerShell — should return your Hetzner IP

**Build failing:**
- Check build logs in Coolify (same info as Render logs)
- Most common issue: missing environment variable — copy from Render

**SSL certificate error:**
- Coolify auto-provisions via Let's Encrypt — wait 10 minutes after DNS points to server
- If still failing: Coolify dashboard → Service → SSL → Force Regenerate

**Server unresponsive:**
- Hetzner dashboard → Server → Power → Restart (30 seconds)

---

## Monthly Cost Comparison

| | Render | Coolify + Hetzner |
|---|---|---|
| Monthly cost | ~$500 | $4-8 |
| Auto-deploy | Yes | Yes |
| Custom domains | Yes | Yes |
| SSL | Yes | Yes |
| Cold starts | Yes (free tier) | No |
| You own the infrastructure | No | Yes |

---

*Built for DarkWave Studios LLC — Jason Andrews*
*Migration guide version 1.0 — June 2026*
