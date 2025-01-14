const userDB = require('../models/user')
const moment = require('moment')
const bcrypt = require('bcrypt')
const flash = require('connect-flash')
const { append } = require('express/lib/response')
const router = require('../routes/app')
const user = require('../models/user')

/*
Admin = 10
Managers = 11
Finance = 12
User = 13
*/

/*
Zalora = 100
FMX = 101
MOH = 200
JPMC = 201
Panaga = 202
Local = 300
Thermomix = 301
Runner = 400
personal = 401
Misc = 500
*/

const roles = [10,11,12,13]
const services = [100,101,200,201,202,300,301,400,401,500]

const insertUser = ((req,res)=>{
    let date = moment().format('DD/MM/YYYY')
    let data = req.body
    let name = data.name
    let uid = data.uid
    console.log(data)
    let user = new userDB({
        name: name,
        uid: uid,
        password: data.password,
        access: data.access,
        email: data.email,
        contact: data.contact,
        role: data.roles,
        service: data.services,
        firsttime: 'true',
        dateCreate: date
    })
    user.save((err) =>{
        if(err) {
            if (err.name === "MongoError" && err.code === 11000){
                console.log(err)
                res.render('error', {
                    title: '11000',
                    response: 'DB Error',
                    message: 'No worries~ database detected duplication entry.'
                })
            }
            else{
                console.log(err)
                res.render('error', {
                    title: '406',
                    response: 'Not Acceptable',
                    message: `Entry didn't meet the requirements.`
                })
            }
        }
       else{
            res.status(200).render ('success', {
                title: 'success',
                response: 'Account Created',
                message: `Account for user ${name} successfuly created. Login ID ${uid}.`,
            })
       }
    })
})

let currentUser = []
const grantAccess = ((req,res)=>{
    let data = req.body
    let uid = data.uid
    let password = data.password
    //console.log(req.body)
    userDB.authenticate(uid, password, (err,user) =>{
        //console.log(req.session.authenticated)
        if (req.session.authenticated){
            //console.log(req.session.authenticated)
        }
        else{
            if (user) {
                console.log(req.sessionID)
                req.session.authenticated = true
                req.session.user = user
                let firsttime = user.firsttime
                if (firsttime === "true") {
                    res.status(200).render('login', {
                        uid,
                        title: 'Change Password',
                        partials: './partials/user/changepassword'
                    })
                }
                else if (firsttime === "false") {
                    res.status(200).render('dashboard',{
                        title: 'Dashboard',
                        id: user._id,
                        user,
                    })
                    tempUser = user
                    currentUser.push(tempUser)
                }
                else{
                    console.log("Failed to detect user status [firsttimer == undefined]")
                    res.status(404).render('error',{
                        title: '404',
                        response: 'Not Found',
                        message: 'No such user ID exists.'
                    })
                }
            }
            else {
                console.log(err)
                res.status(404).render('error',{
                    title: '401',
                    response: 'Not authorized',
                    message: 'You are not authorized.'
                })
            }

            //req.flash('error', `Please check your credentials.`)
            //console.log('User credentials error')
            //res.redirect('/')
            //res.status(401)
        }
    })
})

const updatePassword = (req,res) =>{
    let data = req.body
    let filter = data.uid
    let password = data.password
    console.log(req.body)
    bcrypt.hash(password,10,(err,hash)=>{
        if(err) return console.log (err)
        data.password = hash
        let update = {password: hash, firsttime: 'false'}
        let option = {upsert: false, new:false}
        userDB.findOneAndUpdate(filter,update,option,(err,result)=>{
            if (err) return console.log (err)
            console.log(result)
            res.render('success',{
                title: '',
                response: '',
                message: '',
            })
        })
    })
}

const readUser = ((req,res) => {
    userDB.find().then(
        (documents)=>{
            res.render('success',{
                title: 'Success',
                response: `Password Changed`,
                message: `Your password has been changed`,
                link: '/',
            })
        },
        (err)=>{
            res.render('error', {
                title: '401',
                response: '',
                message: '',
                link: '/',
            })
        }
    )
})

const updateUser = ((req,res) => {
    let data = req.body
    let filter = {uid: data.uid}
    let option = {upsert: false, new: false}
    let update = {}
    userDB.findOneAndUpdate(filter, update, option, (err,docs) => {
        if (err){
            console.log(err)
            res.render('error')
        }
        else{
            res.render('success')
        }
    })
})

const readLogin = ((req,res) => {
    res.render('login', {
        title: "Login",
        moment: moment,
    })
})

const deleteUser = ((req,res) => {
    let data = req.body
    let filter = {uid: data.uid}
    userDB.findOneAndDelete(filter, (err,docs) => {
        if (err){
            console.log(err)
            res.render('error')
        }
        else{
            res.render('success')
        }
    })
})

module.exports = {
    insertUser,
    updatePassword,
    grantAccess,
    currentUser,

    readUser,
    updateUser,
    deleteUser,
    //loginUser,
    readLogin,
}