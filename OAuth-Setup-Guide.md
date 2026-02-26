    # OAuth 2.0 Credentials Setup Guide

Follow these steps to obtain the necessary credentials for Google and GitHub authentication.

## 1. Google Setup (Google Cloud Console)

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a **New Project** (or select an existing one).
3.  Navigate to **APIs & Services > OAuth consent screen**.
    *   Select **External**.
    *   Fill in the required App Information (App name, support email, developer contact).
    *   Add the scope: `.../auth/userinfo.email`, `.../auth/userinfo.profile`, and `openid`.
4.  Navigate to **APIs & Services > Credentials**.
    *   Click **+ CREATE CREDENTIALS** and select **OAuth client ID**.
    *   Application type: **Web application**.
    *   **Authorized JavaScript origins**: `http://localhost:3000`
    *   **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
5.  Copy the **Client ID** and **Client Secret**.

---

## 2. GitHub Setup (GitHub Developer Settings)

1.  Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers).
2.  Click **New OAuth App**.
    *   **Application name**: HirePerfect (or your choice).
    *   **Homepage URL**: `http://localhost:3000`
    *   **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3.  Click **Register application**.
4.  Copy the **Client ID**.
5.  Click **Generate a new client secret** and copy it.

---

## 3. Configure .env.local

Open your `.env.local` file and paste the copied values into the following fields:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_a_random_string_here

# Google Provider
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# GitHub Provider
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

> [!TIP]
> You can generate a secure `NEXTAUTH_SECRET` by running:
> `openssl rand -base64 32` in your terminal.

---

## 4. Run the Application

Once the `.env.local` is updated, restart your development server:

```bash
npm run dev
```

You can now use social login buttons in your application!
