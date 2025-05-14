# 🚆 Railway Management System

A full-stack web application for managing and viewing railway-related data. This project is divided into two main parts:

- `frontend/` — Built with React.js for a responsive and dynamic user interface.
- `backend/` — Built with Node.js and Express.js for handling APIs and database interactions.

---

## 📁 Project Structure

```
Railway/
│
├── backend/     # RESTful API with Node.js & Express
└── frontend/    # React.js frontend for users/admin interface
```
## 🔧 Features

### 🛠️ Admin Features
- Add new trains to the system
- Update train details (timings, route, etc.)
- Delete trains
- Manage train schedules

### 👤 User Features
- View available trains
- Book train tickets
- View booking status

---

## 🌐 Station Data Source

For fetching the list of Indian railway stations, this project uses:

📎 **[https://api-allwin.github.io/Indian_Railway_Stations/Railway_stations.json](https://api-allwin.github.io/Indian_Railway_Stations/Railway_stations.json)**

This static API contains station codes and names used for train creation and ticket booking forms.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB or your preferred database
- npm or yarn

---

### 🔙 Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file and add your environment variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_uri
   ```

4. Run the server:
   ```bash
   npm start
   ```

---

### 🎨 Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React app:
   ```bash
   npm start
   ```

4. Open your browser and go to `http://localhost:3000`

---

## 🗃️ Tech Stack

- **Frontend:** React.js, CSS / Bootstrap
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (or any database you've used)
- **Version Control:** Git & GitHub

---

## 📌 Future Enhancements

- Ticket booking & cancellation
- Admin has access to add , edit, delete Trains

---

## 🤝 Contributors

- Allwin – Full-Stack Developer

---

## 📄 License

This project is licensed under the MIT License.

---

```
