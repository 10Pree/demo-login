const express = require('express')
const bcrypt = require('bcrypt')
const mysql = require('mysql2/promise')
// const cors = require('cors')

const app = express()
const port = 8000;
let conn = null;



const connectMySQL =  async () => {
  conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "tutorial",
  });
};


app.use(express.json())

app.get("/api/hello1", async (req, res) => {
  res.json({
    message: "Hello"
  })
});



app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [results] = await conn.query("SELECT * from users WHERE email = ?", email );
    const userDate = results[0];
    const match = await bcrypt.compare(password, userDate.password)
    if(!match){
      res.status(400).json({
        message: "login fail wrong email pass"
      })
      return false
    }
    res.status(201).json({
      message: "Login",
      userDate,
    });
  } catch (error) {
    console.log("Error", error);
    res.json({
      message: "Login fail",
      Error: error,
    });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const hash = await bcrypt.hash(password, 10);
    // 10 = salt (การสุ่มค่าเพื่อเพิ่มความซับซ้อนในการเข้ารหัส)
    // และมันจะถูกนำมาใช้ตอน compare

    const userDate = {
      email, // emali : email
      password: hash, // password : password
    };

    const [results] = await conn.query("INSERT INTO users SET ?", userDate);
    res.status(201).json({
      message: "create User success",
      results,
    });
  } catch (error) {
    console.log("Error", error);

    res.status(409).json({
      message: "Email นี้ถูกใช้ไปแล้ว",
    });
  }
});



app.listen(port, async () =>{
  await connectMySQL()
  console.log(`Sever Start on Post ${port}`)
})