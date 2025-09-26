# React example of minikit

Apart from a frontend, you'll need a backend, this template contains an example of that as well

## To run, install:

- deps, `cd frontend;pnpm i;cd -;cd backend;pnpm i`
- ngrok - Create a free ngrok account, follow the official [docs](https://ngrok.com/docs/getting-started/)
- nginx - use you favorite package manager :)

### nginx setup

To serve multiple localhost applications through a single ngrok tunnel (only one available for free-tier users), you can use nginx as a reverse proxy. Follow the steps below to set it up:

### Run nginx

Use the config provided in the root of this repo
`sudo nginx -c full/path/to/this/repo/nginx.conf`
or, if you run the command from the root dir
`sudo nginx -c $(pwd)/nginx.conf`

To stop nginx run `sudo nginx -s stop`

### Tunnel through Ngrok

`ngrok http 8080`
The port doesn't matter, make sure it's the `listen` one from nginx config

---

# Worldcoin MiniKit React Template (Vite Version)

This project is a template for building a React-based mini-app for the Worldcoin ecosystem using Vite. It includes a frontend application and a backend server to handle verification logic.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) and `pnpm`
- [nginx](https://nginx.org/en/docs/install.html)
- [ngrok](https://ngrok.com/download)
- [OpenSSL](https://www.openssl.org/) (usually pre-installed on macOS/Linux)

You will also need an App ID and Client Secret from the [Worldcoin Developer Portal](https://developer.worldcoin.org/).

## Getting Started

1.  **Install Dependencies:**
    Run `pnpm i` in both the `frontend` and `backend` directories.

2.  **Configure Backend Environment:**
    - Navigate to the `backend` directory and copy the example environment file: `cp .env.example .env`
    - Generate a secure `AUTH_SECRET` by running `openssl rand -base64 32` in your terminal.
    - Open the new `.env` file and add your `WLD_CLIENT_ID`, `WLD_CLIENT_SECRET`, and the generated `AUTH_SECRET`.

3.  **Configure Frontend Environment:**
    - Open the file `frontend/src/minikit-provider.tsx` (and/or `frontend/src/components/minikit-provider.tsx`).
    - Find the `MiniKit.install()` function and add your App ID in the correct format: `MiniKit.install({ app_id: "app_YOUR_ID_HERE" })`.

## Running the Application

You need to run four processes in separate terminals:

1.  **Start the Frontend:**
    ```bash
    cd frontend
    pnpm dev
    ```

2.  **Start the Backend:**
    ```bash
    cd backend
    pnpm dev
    ```

3.  **Start Nginx:**
    Use the provided configuration file with its absolute path.
    ```bash
    sudo nginx -c /path/to/your/project/nginx.conf
    ```

4.  **Start Ngrok:**
    Create a public tunnel to your nginx server (port 8080).
    ```bash
    ngrok http 8080 --request-header-add "ngrok-skip-browser-warning: true"
    ```

## Testing in the Simulator

- Take the `https` URL provided by ngrok.
- Open the [World App Simulator](https://simulator.worldcoin.org/).
- Load your app using the direct URL method: `https://simulator.worldcoin.org/?url=YOUR_NGROK_URL`
- You can now test the verification flow.
