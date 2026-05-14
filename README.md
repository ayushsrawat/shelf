# Shelf: On-the-fly articles

A fast, lightweight application to store and organize articles, links, and resources you want to read later.

## Visit: [Shelf](https://ayushsrawat.github.io/shelf/)

---

## Quick Start (Local Development)

### 1. Start the Backend

```bash
cd service

# Copy the environment template and fill in your secrets
cp .env.example .env

go mod tidy
go run .
```

*Note: You will need a MongoDB Atlas URI and a GitHub Personal Access Token for the backend to fully function.*

### 2. Start the Frontend

```bash
cd ui

npm install

npm run dev
```

> The app will be available at `http://localhost:5173`. You can access the Admin Dashboard at `http://localhost:5173/#/admin`.
