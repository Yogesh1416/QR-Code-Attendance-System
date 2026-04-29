const mongoose=require('mongoose')

const sessionSchema= new mongoose.Schema({
    subject:{type:String,required:true},
    createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    qrToken:{type:String,required:true},
    expiresAt:{type:Date,required:true},
    isActive:{type:Boolean,default:true}},
    {timestamps:true}
)

module.exports=mongoose.model('Session',sessionSchema)