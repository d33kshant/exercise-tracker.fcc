const express = require('express')
const mongoose = require('mongoose')

const User = require('./models/User.js')
const Exercise = require('./models/Exercise.js')

const app = express()

const PORT = 5000

app.use(express.urlencoded())

//Route to form
app.get('/', (req, res)=>{
  res.sendFile(__dirname+'/index.html')
})

//Route to create user
app.post('/api/users',async (req, res)=>{
  const username = req.body.username
  const newUser = new User({ username })
  const result = await newUser.save()
  res.json(result)
})

//Route to get users
app.get('/api/users', async (req, res)=>{
  const users = await User.find({})
  res.json(users)
})

//Route to add exercise
app.post('/api/users/:_id/exercises',async (req, res)=>{
  const id = req.params._id
  const description = req.body.description
  const duration = req.body.duration
  const date = req.body.date ? (new Date(req.body.date)).getTime() : (new Date()).getTime()

  if(!description){
    res.send('Path `description` is required.')
    return
  }

  if(!duration){
    res.send('Path `duration` is required.')
    return
  }

  const user = await User.findById(id)

  if(user){
    const exercise = new Exercise({ description, duration, date, username: user._doc.username })
    const result = await exercise.save()
    res.json({
      username: user._doc.username,
      _id: user._doc._id,
      description: result._doc.description,
      duration: result._doc.duration,
      date: (new Date(result._doc.date)).toDateString(),
    })
  }else{
    res.send('not found')
  }
})

//Route to get logs 
app.get('/api/users/:_id/logs', async (req, res)=>{
  const id = req.params._id
  const user = await User.findById(id)

  // console.log(id, req.query)

  const from_ = req.query.from || 0
  const to = req.query.to || (new Date()).toISOString()
  const limit = req.query.limit || 5

  if(user){
    let exercises
    Exercise.find({ username: user._doc.username}, (err, data)=>{
      if(err){
        exercises = []
      }else{
        exercises = data.map(exercise=>{
          if(exercise.date >= (new Date(from_)).getTime() && exercise.date <= (new Date(to)).getTime())
          return exercise
        })
      }

      exercises = exercises.filter(exercise=>exercise)
      exercises = exercises.slice(0, limit)
      res.json({
        ...user._doc,
        log: exercises.map(exercise=>{
          return {
            ...exercise._doc,
            date: (new Date(exercise._doc.date)).toDateString()
          }
        }),
        count: exercises.length
      })
    })
  }else{
    res.send('not found')
  }
})

mongoose.connect('mongodb uri')
.then((res)=>{
    console.log('Database Connected.');
    app.listen(PORT, ()=>console.log('Server started at port:', PORT))
}).catch(error=>{
    console.log('Something went wrong');
})
