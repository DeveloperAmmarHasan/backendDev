# gdrive-clone

## Introduction

**gdrive-clone** is a backend service designed to replicate Google Drive–style file management.
It provides user authentication, folder and file organization, file sharing with role-based permissions, and storage management using [Supabase](https://supabase.com/) as the backend service.

## Table of Contents

* [Features](#features)
* [Tech Stack](#tech-stack)
* [Installation](#installation)
* [Configuration](#configuration)
* [Database Schema](#database-schema)
* [Usage](#usage)
* [Development](#development)
* [License](#license)

---

## Features

* **User authentication** — email/password or Google ID support.
* **Folder management** — nested folder hierarchy with parent-child relationships.
* **File uploads** — store files with metadata such as size, type, and storage path.
* **File sharing** — token-based sharing with viewer/editor roles and optional expiration.
* **Supabase integration** — Postgres database, authentication, and storage.
* **Secure API** — JWT-based authentication and bcrypt password hashing.
* **CORS & cookie parsing** for cross-origin compatibility.

---

## Tech Stack

* **Runtime**: Node.js (ES Modules)
* **Framework**: Express.js
* **Database**: PostgreSQL (via Supabase)
* **Authentication**: JWT
* **File Upload**: Multer
* **Security**: bcrypt, dotenv
* **Code Quality**: Biome.js (linting & formatting)

---

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/gdrive-clone.git
cd gdrive-clone

# Install dependencies
npm install
```

---

## Configuration

Create a `.env` file based on `.env.sample`:

```env
SUPABASE_URL=your_supabase_project_url
A_NON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
PORT=5000
```

---

## Database Schema

The `index.sql` file defines the database schema:

* **users** — stores account info (`email`, `password_hash`, `fullname`, `google_id`).
* **folders** — hierarchical folder structure, linked to an `owner_id`.
* **files** — uploaded file metadata (`name`, `size`, `mime_type`, `storage_path`, `is_deleted`).
* **shares** — token-based sharing with roles (`viewer` / `editor`) and expiration dates.

To initialize:

```bash
psql -h your_host -U your_user -d your_db -f index.sql
```

---

## Usage

Start the server:

```bash
npm run start
```

Development mode with auto-reload:

```bash
npm run dev
```

---

## Development

### Lint and format:

```bash
npm run lint
npm run format
```

### Check for issues:

```bash
npm run check
```

---

## License

This project is licensed under the ISC License — see the [LICENSE](LICENSE) file for details.

---

Do you want me to extend this README with **API endpoint documentation** based on the likely structure of your backend? That would make it more complete for developers integrating with it.
