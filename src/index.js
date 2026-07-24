require('dotenv').config()
const morgan = require('morgan')
const express = require('express')

const contact = require('./model-contact')
const app = express()

morgan.token('body', function (req, res) {
  if(req.body) {
    return `{ "name":${req.body.name}, "number":${req.body.number} }`
  } else {
    return null
  }
})

app
  .use(express.static('dist'))
  .use(express.json())
  .use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// Main page
app.get("/", (req, res) => {
  res.send(`
    <ul>
      <li><a href="/api/persons">/api/persons</a></li>
      <li><a href="/info">/info</a></li>
    <ul>
  `)
})

// GetAll
app.get("/api/persons/", (req, res) => {
  contact
    .find({})
    .then(contacts => { res.json(contacts) })
})

// Get single contact
app.get("/api/persons/:id", (req, res, next) => {
  const id = req.params.id
  contact
    .findById(id)
    .then(x => {
      if(x) { res.json(x) }
      else { res.status(404).end() }
    })
    .catch(error => next(error))
})

app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id
  contact
    .findByIdAndDelete(id)
    .then(x => {
      if(x) { res.status(204).end() }
      else { res.status(404).end() }
    })
    .catch(error => next(error))
})

// Create contact
app.post("/api/persons", (req, res) => {
  const person = req.body

  if(!person.name || !person.number || person.id)
    { res.status(400).send({error : "bad format"}).end() }
  // else if(contact.find(x => {x.id === person.id})) {
  //   res.status(400).send({error : "name must be unique"}).end()
  // }

  const newPerson = new contact({
    "name":person.name,
    "number":person.number,
  })
  newPerson
    .save()
    .then(newContact => { res.status(200).json(newContact) })

})

// Update name
app.patch("/api/persons/:id", (req, res, next) => {
  const id = req.params.id
  const { name, number } = req.body

  contact
    .findByIdAndDelete(id)
    .then(x => {
      if(!x) { res.status(404).end() }
      else {
        const newPerson = new contact({
          "name":name,
          "number":number,
        })
        newPerson
          .save()
          .then(newContact => { res.json(newContact) })
      }
    })
    .catch(error => next(error))

})

app.get("/info", (req, res, next) => {
  const datenow = new Date()
  contact
    .find({})
    .then(contacts => {
      res.send(`
        Phonebook has info for ${contacts.length} people<br>
        ${datenow}
      `)
    })
    .catch(error => next(error))
})

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError')
    { return res.status(400).send({ error: 'malformatted id' }) }
  else { return res.status(400).send({ error: 'undefined error' }) }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})