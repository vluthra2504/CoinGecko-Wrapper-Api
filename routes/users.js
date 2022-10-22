const router = require('express').Router()
const User = require('@models/User')
const Refresh = require('@models/Refresh')
const Joi = require('@hapi/joi')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const auth = require('@middlewares/auth')


router.get('/', auth, (req, res) => {
    console.log(req.user)
    User.findOne({ email: req.user.email}).select('-password').exec(
        (err, user) => {
        if(err) {
            throw err
        }
        res.send(user)
    })
})

router.post('/register', (req, res) => {
    // Authorize the request 

    // validate email 
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email(),
        password: Joi.string()
        .required()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    })

    const { error, value } = schema.validate(req.body);
    if(error) {
        return res.status(422).json({ error: error.details[0].message})
    }
    // check if user exist 
    User.exists({ email: req.body.email }, async (err, result) => {
        if(result) {
            return res.status(422).json({ error: 'User with this email already exist!'});     
        }
        // Hash the password 
     const hashedPassword = await bcrypt.hash(req.body.password, 10)
     const user = new User({
         name: req.body.name,
         email: req.body.email,
         password: hashedPassword
     })
     user.save().then(response => {  
         const accessToken = jwt.sign({ 
             name: response.name, email: response.email
            }, 
            process.env.JWT_SECRET, {expiresIn : process.env.JWT_EXPIRY_TIME});

   // Later  ===========================
    const refreshToken = jwt.sign({ 
        name: response.name, email: response.email
        }, 
        process.env.JWT_REFRESH_SECRET);

           // Save refresh token in database 
            const refreshTokenDocument = new Refresh({
                token: refreshToken
            }).save().then(doc => {
                return res.send({
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    type: 'Bearer'
                })
            }).catch(err => {
                throw err
            })
        
     }).catch(err => {
         return res.status(500).send({ error: 'Something went wrong'});
     })
     
    })
})

router.post('/login', (req, res) => {
    // validate email 
    const schema = Joi.object({
        email: Joi.string().email(),
        password: Joi.string()
        .required()
    })

    const { error, value } = schema.validate(req.body);
    if(error) {
        return res.status(422).json({ error: error.details[0].message})
    }
    // check if user exist 
    User.findOne({ email: req.body.email }, async (err, result) => {
        if(err) {
            throw err;
        }
        if(result) {
            // all good 
            bcrypt.compare(req.body.password, result.password).then(function(match) {
                if(match) {
                    const accessToken = jwt.sign({ 
                        name: result.name, email: result.email
                       }, 
                       process.env.JWT_SECRET, {expiresIn : process.env.JWT_EXPIRY_TIME});
                        // LATER ====================
                        const refreshToken = jwt.sign({ 
                        name: result.name, email: result.email
                        }, 
                        process.env.JWT_REFRESH_SECRET);

                        // Save refresh token in database 
                        const refreshTokenDocument = new Refresh({
                            token: refreshToken
                        }).save().then(doc => {
                           
                        }).catch(err => {
                            throw err
                        })
                        return res.send({
                            accessToken: accessToken,
                            refreshToken: refreshToken,
                            type: 'Bearer'
                        })
                }
                // 401 unauthorised 
                return res.status(401).json({ error: 'Username or password is wrong!'})
            });
        } else {
            return res.status(401).json({ error: 'Username or password is wrong!'})
        }
    })
})

router.post('/refresh', (req, res) =>{
    // check if token exits in db 
    if(!req.body.token) {
        return res.status(401).json({ error: 'Not valid token'}) 
    }
    Refresh.findOne({ token: req.body.token }).then(document => {
        if(document) {
            jwt.verify(req.body.token, process.env.JWT_REFRESH_SECRET, (err, user) => {
                if(err) {
                    // 403 Forbidden
                    return res.sendStatus(403)
                }
                const accessToken = jwt.sign({ 
                    name: user.name, 
                    email: user.email
                   }, 
                   process.env.JWT_SECRET, {expiresIn : '30s'});
                   return res.json({ accessToken: accessToken })
            })
        } else {
            // 401 Unauthorised
            return res.status(401).json({ error: 'Not valid token'})
        }
    }).catch(err => {
        throw err   
    })
})

router.delete('/logout', (req, res) => {
    Refresh.deleteOne({ token: req.body.token }).then(() => {
        return res.sendStatus(200)
    }).catch(err => {
        throw err
    })
})


module.exports = router