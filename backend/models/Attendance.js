const mongoose=require('mongoose')

const attendanceSchema=new mongoose.Schema({
  session:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'Session'},
  student:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'User'},
  markedAt:{type:Date,default:Date.now()},
  status:{type:String,default:'present'}
  
})
module.exports=mongoose.model('Attendance',attendanceSchema)