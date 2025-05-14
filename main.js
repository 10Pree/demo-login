const express = require('express')
const app = express()
const post = 8000

const books = [
  { id: 1, title: 'Book 1', author: 'Author 1' },
  { id: 2, title: 'Book 2', author: 'Author 2' },
  { id: 3, title: 'Book 3', author: 'Author 3' },
]

app.get('/hello' , (req, res) =>{
    res.json(books)
})

app.listen(post, () =>{
    console.log(`Sever Start on Post ${post}`)
})