# Obscura Vault
Obscura Vault is a  **Secure-by-Design**, and **Zero-Knowledge** personal password and secret management platform. 

The core architectural directive of Obscura Vault is absolute client-side data isolation. The remote application backend and database function purely as a blind storage locker—the host infrastructure holds zero knowledge of the user's master credentials or raw unencrypted secrets. If the remote database cluster were completely compromised, an attacker would harvest only cryptographically signed, randomized ciphertext blocks and unreadable execution hashes.
---## 🛠 Cryptographic & System Architecture
Obscura Vault splits network operations, data structure validation, and raw cryptography into strict runtime boundaries:


[ Next.js Browser Workspace (RAM) ] ──> Form Input: Master Password + Email Salt
│
▼
[ PBKDF2: 100,000 Iterations ]
│
┌────────────────────────┴────────────────────────┐
▼ ▼
[ 256-bit Master Key (Km) ] [ 256-bit Auth Password (Pa) ]
(Trapped in Non-Exportable RAM) (Hex Token Sent to Next.js Proxy)
│ │
▼ ▼
[ Local AES-GCM Encrypt/Decrypt ] [ Secret Backend API Route ]
│ │
▼ ▼
(Ciphertext Blobs + 12-byte IV) [ Server Hashing: Argon2id ]
│ │
▼ ▼
[ Blind Storage Database Commit ] [ Session Auth Cookie: RS256 ]


### 1. Client-Side Cryptographic Schemes (The Web Crypto API)
All encryption and decryption operations execute inside the user's browser via the native **Web Crypto API** (`window.crypto.subtle`), completely decoupled from the internet layer:
*   **Key Derivation**: When logging in, the raw master password string and the user's email address (acting as a unique cryptographic salt) are processed through **PBKDF2 running 100,000 hashing loops** using a SHA-256 wrapper. This process blocks rainbow table and dictionary brute-force attacks.
*   **Deterministic Key Splitting**: The derivation loop outputs a 512-bit binary sequence that is sliced cleanly in half:
    1.  *First 256 bits (`masterKey`)*: Imported as a non-extractable browser `CryptoKey` object instance. It remains inside volatile React state memory and can never be read by malicious browser extensions or disk scrapers.
    2.  *Second 256 bits (`authPasswordHex`)*: Converted into a hex string used exclusively as a single-use identity token passed to the backend API over TLS/HTTPS.
*   **Data Scrambling**: Individual secrets are encrypted using **AES-GCM (256-bit)**. Every database entry generates a unique, cryptographically random **12-byte Initialization Vector (IV)** to eliminate identifiable ciphertext patterns. AES-GCM's built-in authentication tags guarantee payload integrity; if a database administrator alters a single byte of stored data, decryption fails instantly at the client boundary.

### 2. Backend Security Perimeter (FastAPI)
The Python application microservice enforces strict data mapping, session guarding, and perimeter defense:
*   **Asymmetric Session Verification (RS256)**: Authentication session cookies are signed on the backend using an **Asymmetric RSA Private Key** and verified throughout protected vault modules using a non-secret **RSA Public Key**. This ensures that even if a specific storage or vault service container is compromised, a threat actor has zero capacity to forge user access tokens.
*   **Server-Side Hashing (Argon2id)**: The server takes the client's incoming `auth_password` token and hashes it a second time using **Argon2id** before evaluating database authentication checks. This protects the identity index against hardware-accelerated GPU cracking arrays.
*   **Network Boundary Control**: Authentication JWT payloads are delivered solely inside isolated **HTTP-Only, Secure, SameSite=Strict cookies**. Browser JavaScript interfaces are completely blind to these session flags, neutralizing Cross-Site Scripting (XSS) token theft and Cross-Site Request Forgery (CSRF).

---

## 📂 Project Repository Layout

Obscura Vault is structured as a **Monorepo Architecture**, separating frontend UI components from backend transactional routines into dedicated subdirectories to preserve clean development perimeters:

```text
obscura-project/
│
├── obscura/                         # FastAPI Backend Modular Microservice
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # System Orchestrator (CORS & Router Linking)
│   │   ├── database.py              # AppSettings parsing & Engine Pool initialization
│   │   │
│   │   ├── user/                    # User Identity & Session Module
│   │   │   ├── __init__.py
│   │   │   ├── models.py            # UserModel schema (SQLAlchemy Base)
│   │   │   ├── schemas.py           # Data structure validation contracts (Pydantic)
│   │   │   ├── repositories.py      # Encapsulated transactional DB queries
│   │   │   └── routers.py           # RS256 token signer & cookie managers
│   │   │
│   │   └── vault/                   # Secure Vault Operations Module
│   │       ├── __init__.py
│   │       ├── models.py            # VaultItemModel schema
│   │       ├── schemas.py           # Vault Entry data transfer objects
│   │       └── routers.py           # Protected data endpoints & Route guards
│   ├── .env                         # Backend server environment configurations
│   └── requirements.txt             # Python runtime system dependencies
│
└── obscura-frontend/                # Next.js Client User Interface
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx           # Global view engine layout (Injects Context state)
    │   │   ├── page.tsx             # Public landing gate (Theme responsive)
    │   │   ├── login/page.tsx       # Inline fetch session gate
    │   │   ├── register/page.tsx    # Secure client-side sign-up layout
    │   │   └── dashboard/page.tsx   # Authenticated decryption panel controller
    │   │
    │   ├── components/
    │   │   ├── AddSecretModal.tsx   # Client encryption overlay modal form
    │   │   ├── ThemeToggle.tsx      # Fast-switching layout mode button
    │   │   └── VaultTable.tsx       # Individual row toggle rendering matrix
    │   │
    │   ├── context/
    │   │   └── vaultcontext.tsx     # Global React Context tracking non-extractable keys
    │   │
    │   └── utils/
    │       └── crypto.ts            # Client Web Crypto API pipeline (AES-GCM/PBKDF2)
    │
    ├── .env.local                   # Client environment endpoints
    ├── globals.css                  # Tailwind CSS v4 unified styling directives
    └── next.config.js               # Next.js Server reverse proxy rewrites router
```

---

## 🎨 Theme & Visual Engineering

The Obscura User Interface features a premium, responsive **Midnight Purple and Obsidian Black** aesthetic optimized for high-fidelity dark styling. 

### Tailwind CSS v4 Dynamic Tokens
Because Obscura relies on the **Tailwind v4 pipeline**, style configurations are handled inside `src/app/globals.css` using custom `@theme` variables. This eliminates heavy, fragmented runtime utility classes and prevents page layout flashes when flipping modes. 

Components rely on the custom semantic `--color-fortress-*` variable spectrum, which changes its underlying hex properties instantly when the `.dark` class is attached to or stripped from the root HTML element:

*   `fortress-bg`: Shifts from a light-lavender canvas background to a deep obsidian black vault space.
*   `fortress-card`: Transitions sharp container boundaries from absolute white to rich midnight purple blocks.
*   `fortress-text` / `fortress-muted`: Adapts font legibility profiles instantly to optimize reading contrast ratios across any display interface.

---

## 🚀 Execution & Environment Orchestration

### Prerequisites
*   Python 3.10+
*   Node.js 18+
*   PostgreSQL server instance running locally or in the cloud (e.g., Neon Tech)

### 1. Database Layer Initialization
Before spinning up the backend, initialize your target database container. Create a blank database named **`obscura_db`** within your PostgreSQL environment (using DBeaver or an equivalent interface tool). SQLAlchemy's bind engine will automatically create the required database tables on server startup.

### 2. Backend API Setup
Change directory into your backend module workspace:
```bash
cd obscura
```
Activate your virtual environment and install your dependencies:
```bash
# Mac/Linux activation
source .venv/bin/activate

# Windows Command Prompt activation
.venv\Scripts\activate.bat

# Install package dependencies
pip install -r requirements.txt
```

Create your backend configuration environment file (`obscura/.env`):
```text
DATABASE_URL=postgresql://postgres:securepassword@localhost:5432/obscura_db
DB_POOL_SIZE=15
DB_MAX_OVERFLOW=5
DB_POOL_TIMEOUT=20
ALGORITHM=RS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Insert your RSA 2048-bit single line cryptographic string keys here
PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhki...\n-----END PRIVATE KEY-----"
PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0B...\n-----END PUBLIC KEY-----"
```

Boot up the development api cluster using the FastAPI manager script:
```bash
fastapi dev main.py
```
 Your API documentation swagger panel will be live on `http://localhost:8000/docs`.

### 3. Frontend Next.js Setup
Open a separate terminal window and change directory into your frontend folder:
```bash
cd obscura-frontend
npm install
```

Create your environment file (`obscura-frontend/.env.local`). To follow the **Secure by Design URL Concealment** convention, you must register your backend destination on this hidden server-side token:
```text
# Next.js server proxies browser requests here safely in the background
BACKEND_API_URL=http://localhost:8000
```

Launch the client-side Next.js development server:
```bash
npm run dev
```
Open your browser to `http://localhost:3000` to interact with your secure architecture environment.

---

## 🌐 Production Cloud Deployment Strategy

To deploy this monorepo project architecture into production for free, map your single unified GitHub repository across two dedicated platforms:

### 1. Backend Server Deployment (Render or Koyeb)
*   Connect your GitHub repository to **Render** or **Koyeb** and select a **Web Service** deployment path.
*   Set the **Root Directory** field explicitly to **`obscura`**. This prompts the build machine to ignore frontend files completely.
*   Set your build command parameters to `pip install -r requirements.txt` and start execution boundaries via `uvicorn main:app --host 0.0.0.0 --port $PORT`.
*   Paste your `.env` parameters directly inside their secure **Environment Variables** dashboard tab.

### 2. Frontend Interface Deployment (Vercel)
*   Import the same repository into **Vercel**.
*   In the project settings configurations, set your **Root Directory** selection field to **`obscura-frontend`**.


* Under the Environment Variables section, register a single key: BACKEND_API_URL, and paste the live production URL generated by your backend host (e.g., https://onrender.com).
* Vercel handles the structural code tracking loops, spins up your global content delivery network boundaries, and hidden Next.js proxy rewrites forward your network data packets perfectly.




