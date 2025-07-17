# 🌐 Log Manager | Real-time SSH Log Viewer | Tail Logs Dashboard

**Log Manager** is a web application for centralized real-time monitoring of log files on remote servers.  
A simple and easy-to-use tool for developers, DevOps engineers, and system administrators.

---

## 🎯 Project Goal

To simplify the process of accessing logs without the need to manually connect to each server.  
The application allows you to:
- view logs from multiple servers in a centralized way,
- see real-time log output (`tail -f`),
- easily add new servers and log file paths,
- use a simple web interface with user authentication.

---

## 🚀 Key Features

- 🔐 User registration and authentication (JWT)
- 🖥️ Server management (add, edit, delete)
- 📁 Add and manage log files for each server
- 📡 Real-time log viewing (via WebSocket, `tail -f`)
- 🛡️ Secure storage of SSH connection data
- ⚙️ Simple REST API for interaction

---

## 🛠️ Tech Stack

| Component      | Technology       |
|----------------|------------------|
| Backend        | Node.js, Express.js |
| SSH Connection | ssh2             |
| WebSocket      | socket.io        |
| Frontend       | React.js         |
| Database       | SQLite           |
| Authentication | JWT              |

---

## ⚙️ Installation & Running

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Database migrations

```bash
cd backend && npm run migrate
```

### 3. Run in development mode

```bash
npm run dev
```

### 🐳 Docker (optional)

```bash
docker-compose up -d
```

🌐 Web interface: http://localhost:3000  
⚙️ API: http://localhost:3001

---

### 💬 Feedback & Support

If this project was helpful — please support its development 🙌

### 💳 Donation via Monobank

Card number: `4441 1111 2600 6190`  
Or simply scan the QR code below:

![Monobank QR](monobank_qr.png)

---

### 🔍 SEO Keywords
log manager, real-time log viewer, ssh log viewer, tail logs web,  
log streaming dashboard, nodejs ssh log, react log viewer,  
log monitoring open source, server log viewer, log manager, log dashboard

---

### 📄 License
This project is licensed under the MIT License.  
Free to use, modify, and distribute.

---

### 🇺🇦 Made with love in Ukraine
