const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery',false)
mongoose.connect(url, { family: 4 })
  .then(result => console.log('connected to MongoDB'))
  .catch(error => console.log('error connecting to MongoDB:', error.message))

const phonebookSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'User name required'],
    },
    number: {
      type: String,
      minLength: [9, 'Minimum phone number length is 8'],
      required: [true, 'User phone number required'],
      validate: {
        validator: (v) => {
          return /[0-9][0-9][0-9]?-[0-9]*/.test(v);
        },
        message: "Not a valid phone number"
      }
    },
})
phonebookSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Contact', phonebookSchema)