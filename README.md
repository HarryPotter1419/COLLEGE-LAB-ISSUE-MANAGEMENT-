# 🔬 Lab Issue Reporting System

A web-based application designed to simplify reporting and management of computer lab issues in educational institutions. The system allows students to report problems, while admins and technicians manage and resolve them efficiently.

---

## 🚀 Features

### 👨‍🎓 Student
- Register and login
- Report lab issues with image upload
- View submitted issues
- Track issue status (Pending / In Progress / Resolved)

### 👨‍💼 Admin (HOD)
- View all reported issues
- Assign issues to technicians
- Update issue status
- Add remarks and manage reports

### 🛠️ Technician
- View assigned issues
- Update issue status
- Add repair notes
- Mark issues as resolved

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (Mongoose)  
- **Deployment:** Render (Backend) & MongoDB Atlas (Database)

---

## ⚙️ System Architecture

Frontend → API → Backend (Express) → Mongoose → MongoDB  
⬅️ Response returned to frontend

---

## 📂 Project Structure


lab-issue-system/
├── backend/
│ ├── routes/
│ ├── models/
│ ├── server.js
│ ├── .env
│
├── frontend/
│ ├── index.html
│ ├── styles.css
│ ├── script.js
│
├── README.md



---

## 🔐 Environment Variables

Create a `.env` file inside the backend folder and add:
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key



---

## ▶️ How to Run Locally

1. Clone the repository  
git clone https://github.com/your-username/lab-issue-system.git


2. Navigate to backend  
cd backend


3. Install dependencies  
npm install


4. Start server  
npm run dev


5. Open frontend in browser  

---

## 🌐 Deployment

The application can be deployed using:
- **Render** for backend hosting  
- **MongoDB Atlas** for cloud database  

---

## 🎯 Future Enhancements

- Email notifications for issue updates  
- Real-time updates using WebSockets  
- Mobile app version  
- Advanced analytics dashboard  

---

## 👨‍💻 Author

**HarryPotter1419**

---

## 📌 Conclusion

This project demonstrates a real-world issue tracking system using a 3-tier architecture with efficient communication between frontend, backend, and database.