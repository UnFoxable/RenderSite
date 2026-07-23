const morgan = require('morgan')
const express = require('express')
const cors = require('cors')

const app = express()

morgan.token('body', function (req, res) {
  if(req.body) {
    return `{ "name":${req.body.name}, "number":${req.body.number} }`
  } else {
    return null
  }
})

app
  .use(express.json())
  .use(cors())
  .use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let phonebook = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get("/", (req, res) => {
  res.send(`
    <ul>
      <li><a href="/api/persons">/api/persons</a></li>
      <li><a href="/info">/info</a></li>
    <ul>
  `)
})


app.get("/api/persons/", (req, res) => {
  res.json(phonebook)
})

app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id
  const person = phonebook.find(x => x.id === id)
  const personindex = phonebook.indexOf(person)

  if(person) {
    delete phonebook[personindex]
    res.status(204).end()
  } else {
    res.status(404).end()
  }
})

app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id
  const person = phonebook.find(x => x.id === id)

  if(person) {
    res.json(person)
  } else {
    res.statusMessage = "Person couldn't be found"
    res.status(404).end()
  }
})

app.post("/api/persons", (req, res) => {
  const person = req.body

  if(!person.name || !person.number || person.id) {
    res.status(400)
    res.json({error : "bad format"}).end()

  } else if(phonebook.find(x => x.name === person.name)) {
    res.status(400)
    res.json({error : "name must be unique"}).end()
  }

  const id = Math.floor(Math.random() * 1000)
  person["id"] = String(id)

  phonebook.push(person)
  res.status(200).end()
})


app.get("/info", (req, res) => {
  const datenow = new Date()
  res.send(`
    Phonebook has info for ${phonebook.length} people<br>
    ${datenow}
  `)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})