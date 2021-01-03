const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
//bscrypt로 암호화할때 필요
const saltRounds=10
const jwt=require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name:{
        type: String,
        maxlength:50
    },
    email:{
        type:String,
        trim: true,
        // 공백제거
        unique:1
    },
    password:{
        type:String,
        minlength:5
    },
    lastname:{
        type:String,
        maxlength:50
    },
    role:{
        type: Number,
        default: 0
    },
    image:String,
    token:{
        type:String
    },
    tokenExp:{
        type:Number
    }
})

//save하기전에 저 함수를 실행시켜 암호화 시킨다
userSchema.pre('save',function(next){
    var user=this;
    //비밀번호를 암호화 시킨다
    if(user.isModified('password')){
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err) return next(err)
    
            bcrypt.hash(user.password,salt,function(err,hash){
                if(err) return next(err)
                user.password=hash
                next()
            })
        })
    }
    else{
        next()
    }
})

userSchema.methods.comparePassword=function(plainPassword,cb){
    //plainPassword 1234567 암호화된비번: 2b$10$pPnyw.boeAv/SivNGzAQTOS1hIH4LFBWLMDboxLN22l8x6xeERHcG
    bcrypt.compare(plainPassword, this.password, function(err,isMatch){
        if(err) return cb(err);
        cb(null,isMatch)
    })
}

userSchema.methods.generateToken=function(cb){
    // jsonwebtoken을 이용해서 token을 생성하자
    var user=this;
    var token=jwt.sign(user._id.toHexString(),'secretToken')
    user.token=token
    user.save(function(err,user){
        if(err) return cb(err)
        cb(null,user)
    })
}

userSchema.statics.findByToken=function(token,cb){
    var user=this;
    //토큰을 decode 한다
    jwt.verify(token,'secretToken',function(err,decoded){
        //유저아이디를 이용해서 유저를 찾은 다음에
        //클라이언트에서 가져온 토큰과 디비에 보관된 토큰이 일치하는지 확인
        user.findOne({"_id":decoded,"token":token},function(err,user){
            if(err) return cb(err)
            cb(null,user)
        })
    })
}
const User=mongoose.model('User',userSchema)
module.exports={User}