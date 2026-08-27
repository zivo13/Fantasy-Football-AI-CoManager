# 🐘 GoDaddy PHP 8.3 + MySQL Setup Guide for SuperMacho.app

Follow these 4 simple steps to deploy your **PHP 8.3 + MySQL Database Backend** on GoDaddy cPanel hosting with 100% permanent data storage across all devices, browsers, and sessions!

---

## 🗄️ Step 1: Create Your MySQL Database in GoDaddy cPanel

1. Log into your **GoDaddy cPanel Account**.
2. Click **MySQL Database Wizard**.
3. Create a new database name: `supermacho_nfl_db`.
4. Create a database user (e.g. `supermacho_user`) and password (e.g. `YourPassword123!`).
5. Check **ALL PRIVILEGES** and click **Make Changes**.

---

## 📋 Step 2: Import `schema.sql` into phpMyAdmin

1. In cPanel, click **phpMyAdmin**.
2. Click on `supermacho_nfl_db` in the left sidebar.
3. Click the **Import** tab at the top menu.
4. Choose file: [`php_backend/schema.sql`](file:///c:/Users/Usuario/Dropbox/htdocs/htdocs_nfl_fantasy/SaaS/php_backend/schema.sql).
5. Click **Go** at the bottom.
6. **Done!** The `users`, `leagues`, and `draft_queue` tables are created with default Admin credentials.

---

## ⚙️ Step 3: Configure `php_backend/db.php`

Open [`php_backend/db.php`](file:///c:/Users/Usuario/Dropbox/htdocs/htdocs_nfl_fantasy/SaaS/php_backend/db.php) and update lines 18-20 with your GoDaddy database credentials:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'supermacho_nfl_db'); // GoDaddy database name
define('DB_USER', 'supermacho_user');   // GoDaddy database username
define('DB_PASS', 'YourPassword123!');   // GoDaddy database password
```

---

## 🚀 Step 4: Upload `php_backend/` Folder to GoDaddy

Upload the entire `php_backend` folder to your `public_html` directory on GoDaddy:

```text
public_html/
├── api/
│   ├── db.php
│   ├── auth.php
│   ├── save_league.php
│   ├── save_draft_queue.php
│   └── get_user_data.php
```

---

## 🎯 PHP 8.3 REST API Endpoints Created:

1. **`POST /api/auth.php`**: Login & Signup (returns user, leagues, and draft queue).
2. **`POST /api/save_league.php`**: Saves ESPN/Sleeper League parameters directly into MySQL `leagues` table.
3. **`POST /api/save_draft_queue.php`**: Saves locked draft targets directly into MySQL `draft_queue` table.
4. **`GET /api/get_user_data.php?email=user@email.com`**: Retrieves complete user state in 1 fast query.
