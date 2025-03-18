# **Task Management API**

A robust backend API for handling task management workflows, providing features for task creation, assignment, prioritization, and user authentication.

## **🚀 Features**

* **User Authentication:** Secure registration and login using JWT and bcrypt.  
* **Task Management:** Create, read, update, and delete tasks.  
* **Task Assignment:** Assign tasks to specific users.  
* **Task Prioritization:** Manage task urgency with priority queues.  
* **Real-Time Communication:** Implement Redis for notifications.  
* **Error Handling & Validation:** Ensures proper input handling.

## **🏗️ Tech Stack**

* **Backend:** Node.js, Express.js  
* **Database:** MongoDB Atlas  
* **Authentication:** JWT, bcrypt.js  
* **Queue Management:** @datastructures-js/priority-queue  
* **Real-Time Communication:** Redis  
* **Testing:** Jest

## **⚙️ Installation**

1. Clone the repository: git clone [https://github.com/shubhamprasad318/task\_management\_api.git](https://github.com/shubhamprasad318/task_management_api.git)  
   cd task\_management\_api  
2. Install dependencies: npm install

     3\.   Run the server:

node app.js

## **📋 API Endpoints**

* **User Authentication:**  
  * POST `/auth/register`: Register a new user.  
  * POST `/auth/login`: Authenticate and obtain a token.  
* **Task Management:**  
  * POST `/tasks`: Create a new task.  
  * GET `/tasks`: Fetch all tasks.  
  * GET `/tasks/:id`: Get task by ID.  
  * PUT `/tasks/:id`: Update a task.  
  * DELETE `/tasks/:id`: Delete a task.

---

