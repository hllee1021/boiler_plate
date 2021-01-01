const express = require('express')
const app = express()
const port = 3000

const mongoose=require('mongoose')
mongoose.connect('mongodb://localhost:27017',{
    useNewUrlParser: true, useUnifiedTopology:true, useCreateIndex:true, useFindAndModify:false
}).then(()=>console.log('Mongodb success~'))
.catch(err=>console.log(err))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})