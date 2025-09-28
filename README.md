# CloneOps  

CloneOps is a web-based platform that provides a **complete agent-based framework** for automating and testing social interactions in a safe, controlled environment. It allows users to create, customize, and monitor multiple agents that simulate real-world communication and engagement on a mock social media platform.  

## 🚀 Features  

### 🧩 Modular Agent Framework  
- **DM Responder** – Handles private messages based on user-defined rules.  
- **Content Poster** – Creates and schedules posts with caption assistance.  
- **Engagement Agent** – Likes, comments, and interacts with followers.  
- Agents run independently but are coordinated through a **central dashboard**.  

### 📬 Intelligent Communication Management  
- Automatic message categorization: **Spam**, **Fan Mail**, **Regular**, and **Urgent**.  
- Urgent messages are **pinned and flagged** for immediate user attention.  
- Routine inquiries are **automatically managed** according to user preferences.  
- Users receive **summaries and notifications** of all agent activity.  

### 📱 Mock Social Media Platform  
- Realistic home feed with posts, likes, comments, and shares.  
- Caption-assist & content ideas powered by AI:  
  - Provide a prompt for auto-captioning.  
  - Upload images + short description for creative suggestions.  

### 👥 Host & Guest Model  
- Invite **guests** with customizable permissions (post, comment, respond to DMs).  
- Revoke access anytime.  
- **Audit trail** logs all guest actions for accountability.  

### 🔒 Security & Control  
- Sensitive interactions flagged for manual review.  
- Rules to block certain information from ever being shared.   
- **Global “Kill Switch”** to instantly shut down agent activity.  

---

## 🛠️ Tech Stack  
- **Frontend:** Next.js / React, TailwindCSS  
- **Backend:** Rust (Actix Web or Axum)  
- **Database:** SQLite (lightweight, file-based storage)  
- **Auth & Security:** control user permissions
- **AI/Agents:** Custom LLM integrations & rule-based logic  

---

## 📖 Getting Started  

### Prerequisites  
- Node.js >= 18  
- Rust >= 1.80 (stable toolchain via [rustup](https://rustup.rs))  
- SQLite (already included with most OS installs)  

### Installation  
```bash
# Clone the repository
git clone https://github.com/yourusername/cloneops.git
cd cloneops
```

**Frontend setup**  
```bash
cd client
#you have to downgrade a bit for it to work with next js
npm uninstall react-dom
npm install react@18.2.0 react-dom@18.2.0
npm install   
```

**Backend setup**  
```bash
cd server
cargo build
```

---

### Database Setup (SQLite)  

CloneOps uses **SQLite** for persistence. By default, a `cloneops.db` file is created in the project root.  

If using [SQLx](https://github.com/launchbadge/sqlx) migrations:  
```bash
cd server
sqlx database create
sqlx migrate run
```

Inspect the DB manually:  
```bash
sqlite3 cloneops.db
```

---

### Running the App  

**Backend (Rust)**  
```bash
cd server
cargo run
# -> http://localhost:8000
```

**Frontend (Next.js)**  
```bash
cd client
npm run dev
# -> http://localhost:3000
```

**Access:**  
- Dashboard: `http://localhost:3000`  
- API Docs (like swaggerui): `http://localhost:6969/docs`  

---


## 📌 Roadmap  
- [ ] Multi-platform integration (Twitter, Instagram, Discord).  
- [ ] Advanced analytics & sentiment tracking.  
- [ ] Mobile app interface.  
- [ ] Marketplace for user-created agent personas.  

---

## 🤝 Contributing  
Contributions are welcome! Please fork the repo and submit a pull request.  

---

## 📜 License  
This project is licensed under the MIT License.  
