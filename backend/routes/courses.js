const express=require('express')
const router=express.Router()
//Placeholder(dummy but use for future)

router.get('/',(req,res)=>{
    res.json({msg:"Courses Route  Working"})
})

module.exports=router;