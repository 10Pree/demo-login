const express = require('express')
const bcrypt = require('bcrypt')
const mysql = require('mysql2/promise')
const jwt = require('jsonwebtoken')
const cookieParser = require("cookie-parser");
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors({
  origin: "http://127.0.0.1:5500", // ระบุ URL หน้าเว็บไคลเอ็นต์
  credentials: true // อนุญาตให้ส่งคุกกี้ข้ามโดเมน
}))
app.use(cookieParser())

const port = 8000;
var privateKey = "myprivateKey";



let conn = null;
const connectMySQL =  async () => {
  conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "tutorial",
  });
};



app.get("/api/hello1", async (req, res) => {
  res.json({
    message: "Hello"
  })
});



app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [results] = await conn.query("SELECT * FROM users WHERE email = ?", [email] );
    const userDate = results[0];
    const match = await bcrypt.compare(password, userDate.password)
    if(!match){
      res.status(400).json({
        message: "login fail wrong email pass"
      })
      return false
    }
    // JWT Token
    const token = jwt.sign({email, role: "admin"}, privateKey,{expiresIn: "1h"})
    // ตั้งค่า cookie ก่อนส่ง response
    res.cookie("token", token, {
      maxAge: 3600000,      // 1 ชั่วโมง (ms)
      secure: true,  
      httpOnly: true,
      sameSite: "none",
    });

    res.status(200).json({
      message: "Login Success"
    })
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

app.get("/api/users", async(req,res) =>{
  try{
    // const authHeader = req.headers.authorization
    const authToken = req.cookies.token
    // let authToken = ""
    // if(authHeader){
    //   authToken = authHeader.split(" ")[1]
    // }
    console.log(authToken)
    const user = jwt.verify(authToken, privateKey)
    console.log(user)

    const [checkResults] = await conn.query("SELECT * FROM users WHERE email = ?", user.email)
    if(!checkResults[0]){
      throw { message: "user not found"}
    }

    const [results] = await conn.query("SELECT * from users")
    res.status(200).json({
      results
    })
  } catch(error){
    console.log("Error", error)
    res.status(403).json({
      message: "access to the requested resource is forbidden",
      error
    })
  }
})



app.listen(port, async () =>{
  await connectMySQL()
  console.log(`Sever Start on Post ${port}`)
})