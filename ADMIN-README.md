# 🌌 HirePerfect Admin: "Midnight & Neon" Command Center

The Administrative side of HirePerfect is a mission-control interface designed for high-precision management of candidates, assessments, and platform integrity. It features a premium cinematic HUD aesthetic, advanced telemetry, and robust security.

## 🔐 Security & Access Control

### Admin Signup Secret
To prevent unauthorized administrative access, the platform uses a "Secret Handshake" protocol for account creation.
- **Environment Variable**: `ADMIN_SIGNUP_SECRET`
- **Mechanism**: When registering an account with the `admin` role, the request must include an `adminSecret` that matches the server's private key.

### Role-Based Protection
- **Backend**: Every admin API route is protected by `authMiddleware` and checks for the `admin` role.
- **Frontend**: Navigation to `/admin/*` routes is client-side guarded, redirecting non-admins back to the standard dashboard.

---

## 📊 Telemetry (Dashboard)
Located at `/admin/dashboard`, this is the visual heartbeat of the platform.

- **Gross Extraction**: Real-time revenue tracking.
- **Active Deployments**: Monitoring of current assessment starts.
- **Accuracy Mean**: Global candidate performance statistics.
- **Protocol Breaches**: Tally of GuardEye AI alerts for assessment violations.
- **Live Operations Feed**: A real-time table of active operatives and their current status.
- **Node Monitor**: Visual status indicators for the Kernel (Server), Dataplumb (Database), GuardEye (AI Security), and Telemetry (Data) subsystems.

---

## 👥 Operative Registry (User Management)
Located at `/admin/users`, provides total control over the platform's population.

- **Search & Filter**: Find operatives by name, email, or role.
- **Role Alignment**: Dynamically upgrade or downgrade users between `candidate` and `admin`.
- **Termination**: Securely delete operative entries from the system.

---

## 📜 Mission Command (Assessment Management)
Located at `/admin/assessments`, allows for the design and deployment of evaluation matrices.

- **Assessment Catalog**: CRUD operations for technical assessments, including pricing, timing, and difficulty levels.
- **Question Design**: A specialized sub-interface (`/admin/assessments/[id]/questions`) for managing the actual content:
    - **MCQ Support**: Multi-choice question generator with correct answer tracking.
    - **Scenario & Coding**: Templates for advanced evaluation types.
    - **Points Allocation**: Granular control over weighting for each question.

---

## 🛡️ Root Logs & Monitoring
Accessible via the **"Access Root Logs"** conduit in the Dashboard.

- **Centralized Audit Trail**: Every critical action (admin login, user deletion, system error) is logged in the `AuditLog` model.
- **Cinematic Log Viewer**: A terminal-style HUD overlay for real-time system event analysis.
- **Auto-Purge**: Logs are automatically purged after 30 days via a TTL (Time-To-Live) index to maintain optimal performance.

---

## 🛠️ Configuration
Ensure the following variables are set in your `.env.local`:

```env
# Admin Security
ADMIN_SIGNUP_SECRET=your_super_secret_key_here
```

---

## 🎨 Theme Guidelines
The Admin side strictly adheres to the **"Midnight & Neon"** design system:
- **Background**: `#020205` (Midnight Black)
- **Primary Accent**: `#00f2ff` (Electric Cyan)
- **Secondary Accent**: `#8b5cf6` (Neon Purple)
- **UI Elements**: Glassmorphism with `glass-cyan` and `glass` utility classes.
- **Animations**: HUD Scan-lines, glowing pulses, and cinematic blurs.
