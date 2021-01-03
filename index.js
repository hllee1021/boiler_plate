const express = require('express')
const config=require('./config/key')
const {User}=require("./models/User")
const {auth}=require("./middleware/auth")
const bodyParser=require('body-parser')
const cookieParser=require('cookie-parser');
const app = express()
const port = 3000


//body_Parser로 아래의 형식들을 받을 수 있게 해줌
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
//cooKie 다루기 가능
app.use(cookieParser());

//로컬 몽고디비 연결
//config에서 가져오면 개발환경, 호스팅 환경에 따라 다르게 작동하도록함
const mongoose=require('mongoose')
mongoose.connect(config.mongoURI,{
    useNewUrlParser: true, useUnifiedTopology:true, useCreateIndex:true, useFindAndModify:false
}).then(()=>console.log('Mongodb success~'))
.catch(err=>console.log(err))

//기본 라우터
app.get('/', (req, res) => {
  res.send('Hello World! gogogo')
})

//User 정보 받는 라우터
app.post('/api/users/register',(req,res)=>{
    
    const user=new User(req.body)

    user.save((err,userInfo) => {
        if(err) return res.json({success:false,err})
        return res.status(200).json({
            success:true
        })
    })
})

app.post('/api/users/login',(req,res)=>{
  //요청된 이메일을 db에 있는지 찾는다
  User.findOne({email:req.body.email},(err,user)=>{
    if(!user){
      return res.json({
        loginSuccess: false,
        messeage: "제공된 이메일에 해당하는 유저가 없습니다"
      })
    }
    //요청된 이메일이 db에 있다면 비밀번호가 맞는지 확인
    user.comparePassword(req.body.password,(err,isMatch)=>{
      if(!isMatch)
        return res.json({loginSuccess:false, messege:"비밀번호가 틀렸습니다"})

      //비밀번호까지 맞다면 토큰을 생성하기
      user.generateToken((err,user)=>{
        if(err) return res.status(400).send(err);
        //토큰을 저장한다. 어디에? 쿠키, 로컬스토리지 등등 가능
          res.cookie("x_auth",user.token)
          .status(200)
          .json({loginSuccess:true, userId:user._id})
      })
    })
  })
})


app.get('/api/users/auth',auth,(req,res)=>{
  //여기까지 미들웨어를 통과했다는 얘기는 Authentication이 True라는말
  res.status(200).json({
    _id:req.user._id,
    isAdmin:req.user.role===0?false:true,
    isAuth:true,
    email:req.user.email,
    name:req.user.name,
    lastname:req.user.lastname,
    role:req.user.role,
    image:req_user.image
  })
})

app.get('/api/users/logout',auth,(req,res)=>{
  User.findOneAndUpdate({_id:req.user._id}),
  {token:""}
  ,(err,user)=>{
    if(err) return res.json({success:false,err});
    return res.status(200).send({
      success:true
    })
  }
})
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})