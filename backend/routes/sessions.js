const express=require('express')
const router=express.Router()
const {v4:uuidv4}=require('uuid')
const auth=require('../middleware/authMiddleware')
const Session=require('../models/Session')

//create a new session (teacher only)

router.post('/create',auth,async(req,res)=>{
    try{
        const qrToken=uuidv4()
        const expiresAt=new Date(Date.now()+10*60*1000)
        const session= await Session.create({
            subject:req.body.subject,
            createdBy:req.user.id,
            qrToken,
            expiresAt
        })
        const qrData=`${process.env.CLIENT_URL}/scan/${qrToken}`
        res.json({session,qrData})
    }
    catch(err){
        console.error(err)
        res.status(500).json({msg:"Server Error"})
    }
})

//get all sessions

router.get('/',auth,async (req,res)=>{
    try{
        const sessions= await Session.find()
        .populate('createdBy','name')
        .sort({'createdAt':-1});
        res.json(sessions)
    }
    catch(err){
        res.status(500).json({msg:"Server Error"})

    }
})

module.exports=router;