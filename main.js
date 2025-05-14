const express = require('express')
const mysql = require('mysql2/promise')
const bcrypt = require('bcrypt')
// const cors = require('cors')


const app = express()
const port = 8000;
let conn = null;


const connectMySQL =  async () => {
  conn = await mysql.createConnection({
    host: "db",
    user: "root",
    password: "root",
    database: "tutorial",
  });
};


app.use(express.json())
// app.use(cors({
//   credentials: true,
//   origin: ["http://localhost:8888"],
// }))


app.get('/api/user/:id' , async(req, res) =>{
  const id = parseInt(req.params.id)
  const [results] = await conn.query('SELECT * form users WHERE id = ?', [id])
  if(results.length === 0){
    return res.status(404).json({
      message: "User Not Found"
    })
  }
  res.json({
    results
  })
})

app.post('/api/register', async(req, res) => {
  const {email, password} = req.body

  const hash = await bcrypt.hash(password, 10)
    // 10 = salt (การสุ่มค่าเพื่อเพิ่มความซับซ้อนในการเข้ารหัส)
  // และมันจะถูกนำมาใช้ตอน compare

  const userDate = {
    email, // emali : email
    password: hash// password : password
  }

  const [results] = await conn.query('INSERT INTO users SET ?', userDate)
  res.json({
    message: 'insert ok',
    results
  })
})

app.post('/api/login', (req, res) =>{

} )

app.listen(port, async () =>{
  await connectMySQL()
  console.log(`Sever Start on Post ${port}`)
})