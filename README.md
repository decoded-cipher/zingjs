# ZingJS 🚀

### The Lightweight, Event-Driven Node.js Backend Framework

ZingJS is a **fast, file-based, middleware-friendly** Node.js framework designed for **simplicity, performance, and flexibility**. It combines the best features of Express, Fastify, and Hono while keeping things **minimal and dependency-free**. Yes, you heard it right—**zero dependencies**!

---

## ✨ Features

✅ **Zero Dependencies** – No unnecessary bloat, just pure performance.  
✅ **File-Based Routing** – Organize routes effortlessly with a folder structure.  
✅ **Middleware Support** – Use custom middleware, just like Express.  
✅ **Event-Driven Architecture** – Efficient and modular event-based system.  
✅ **Auto API Documentation** – Extracts route information directly from comments.  
✅ **Static File Serving** – Easily serve assets like HTML, CSS, and images.  
✅ **Customizable Logging & Rate Limiting** – Full control over request logs & throttling.  

---

## 🚀 Installation

```sh
npm install zingjs
```

Since ZingJS has **zero dependencies**, installation is blazing fast. 

---

## 📌 Quick Start

### **1️⃣ Create a New Project**
```sh
mkdir my-zing-app && cd my-zing-app
npm init -y
npm install zingjs
```

### **2️⃣ Create an Entry File** (`index.js`)
```javascript
import ZingJS from "zingjs";

const app = new ZingJS({ enableDocs: true });

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
```

### **3️⃣ Define Routes Using File-Based Structure**

📁 **Folder Structure**
```
/routes
   ├── index.js      → GET /
   ├── user.js      → GET /user
   ├── users/[id].js → GET /users/:id
```

📄 **`routes/users/[id].js`**
```javascript
/**
 * @route   GET /users/:id
 * @desc    Fetch user details
 * @params  id - User ID
 * @return  { userId, name }
 **/
export default {
  GET: async (req) => {
    return { userId: req.params.id, name: "John Doe" };
  }
};
```

### **4️⃣ Start the Server**
```sh
node index.js
```
Your API is now live at [`http://localhost:3000`](http://localhost:3000)!

---

## 📄 API Documentation
ZingJS automatically generates API documentation from **inline comments**.  

**View API Docs at:** [`http://localhost:3000/docs`](http://localhost:3000/docs)

Example:
```json
{
  "/users/:id": {
    "get": {
      "description": "Fetch user details",
      "params": ["id - User ID"],
      "return": "{ userId, name }",
      "responses": {
        "200": { "description": "Successful response" }
      }
    }
  }
}
```

---

## 🔥 Advanced Features

### **✔ Middleware Support**
```javascript
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});
```

### **✔ Static File Serving**
```javascript
const app = new ZingJS({ serveStatic: true });
```
Place your static files inside `public/`, and access them at `/`.

### **✔ Event System**
```javascript
app.on("userCreated", (data) => {
  console.log("New user added:", data);
});
```

---

## 🔗 Contributing
We welcome contributions! Feel free to **fork** the repository and submit a **pull request**.

---

## 📜 License
**ZingJS** is released under the **MIT License**.

---

## ⭐ Why ZingJS?
🚀 **Fast & Lightweight** – Zero dependencies ensure minimal footprint.  
📝 **Easy to Use** – Simple API design with file-based routing.  
🔧 **Flexible & Extensible** – Customize everything as per your needs.  
🎯 **Designed for Performance** – Event-driven, optimized for speed.  

Start building amazing APIs with **ZingJS** today! 🚀