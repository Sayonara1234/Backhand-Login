<!-- install untuk inisialisasi project node js -->
npm init -y

<!-- install dependensi -->
npm install express body-parser mysql2 dotenv

<!-- install alat pengembangan -->
npm install nodemon --save-dev

<!-- pastikan terdapat nodemon di package.json -->
"scripts": {
  "start": "nodemon index.js"
}

<!-- cara testing di postman -->
Endpoint: /signup
Metode: POST
URL: http://localhost:3000/signup

{
  "username": "testuser",
  "email": "testuser@example.com",
  "password": "TestPassword123",
  "confirmPassword": "TestPassword123"
}

Endpoint: /signin
Metode: POST
URL: http://localhost:3000/signin

{
  "username": "testuser",
  "password": "TestPassword123"
}

Endpoint: /reset-email
Metode : PUT
http://localhost:3000/reset-email

{
  "username": "testuser",
  "newEmail": "newemail@example.com"
}

Endpoint: /reset-password
Metode: PUT
URL: http://localhost:3000/reset-password

{
  "username": "testuser",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}

Endpoint: /delete/:id
Metode: DELETE
URL: http://localhost:3000/delete/1

Endpoint: /users
Metode: GET
URL: http://localhost:3000/users

<!-- cara menjalankan -->
npm run start