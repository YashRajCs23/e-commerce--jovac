🛍️ Clothing E-Commerce Website
A simple and functional e-commerce web application built with Node.js, Express, MongoDB, and EJS. It features user registration & login (with bcrypt), product listing, cart, orders, admin dashboard, and review management.

🚀 Features
👤 User
Register and login using email & password (bcrypt-based)

Add products to cart (max 5 quantity per item)

Checkout via Cash on Delivery

View order history

Add/edit/delete product reviews

🛒 Product
List all products with images, description, and reviews

View detailed product page

Review system with rating and comment

🛠️ Admin
View all users and their orders

Add, edit, and delete products

View and manage all orders

Delete users

🔧 Tech Stack
Tech	Usage
Node.js	Backend runtime
Express.js	Web framework
MongoDB	Database
Mongoose	ODM for MongoDB
EJS	Templating engine
bcryptjs	Password hashing
express-session	Session management
connect-flash	Flash messaging
Multer	File/image uploads


project/
│
├── models/             # Mongoose models (User, Product, Order, Review)
├── routes/             # Express routes (auth, product, user, admin, orders)
├── middlewares/        # Custom middlewares (isLoggedIn, isAdmin, etc.)
├── views/              # EJS templates
│   ├── products/
│   ├── user/
│   ├── admin/
│   └── authentication/
├── public/             # Static assets (CSS, JS)
├── uploads/            # Uploaded images (users, products)
├── .env                # Environment variables
├── app.js              # Entry point
└── README.md
