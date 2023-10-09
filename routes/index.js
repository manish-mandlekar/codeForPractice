var express = require('express');
var router = express.Router();
var userModel = require('./users')
const passport = require("passport");
const localStrategy = require('passport-local');
const postModel = require('./post')
const multer = require('multer')
const path = require('path')
const commentModel = require("./comment")
const mailer = require("../nodemailer")
const crypto = require("crypto")


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname)
    cb(null, uniqueSuffix)
  }
})

const upload = multer({ storage: storage })

passport.use(new localStrategy(userModel.authenticate()));
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/forgot', function(req, res, next) {
  res.render('forgot');
});

router.post('/reset/:userid', async function(req, res, next) {
  try {
    const user = await userModel.findOne({ _id: req.params.userid });

    if (!user) {
      return res.status(404).send("User not found");
    }

    await user.setPassword(req.body.password);
    user.key = "";
    await user.save();
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).send("Error while logging in");
      }
      res.redirect("/profile");
    });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send("An error occurred");
  }
});


router.get('/forgot/:userid/:key', async function(req, res, next) {
  let user = await userModel.findOne({ _id: req.params.userid})
  if(user.key === req.params.key){
    res.render("reset",{user})
  } else {
    res.send("session expired")
  }
  
});

router.post('/forgot',async function(req, res, next) {
  var user = await userModel.findOne({email : req.body.email})
  if(!user){
    res.send("we've send a mail,if mail exists.")
  }else{
    //user k lie key bnani h yha with the help of crypto
    crypto.randomBytes(80,async (err,buff)=>{
      let key = buff.toString("hex");
      user.key = key
      await user.save();
      mailer(req.body.email,user._id,key).then((err)=>{
        console.log(err)
        res.send("mail sent")
      })

    })
  }
});

router.post('/cmnt/:id',function(req, res, next) {
  userModel.findOne({
    username:req.session.passport.user
  }).then((founduser)=>{
    postModel.findOne({
     _id : req.params.id
    }).then((foundpost)=>{
      commentModel.create({
        comment : req.body.comment,
        founduser : founduser._id
      }).then((cmntcreated)=>{
        foundpost.comments.push(cmntcreated._id)
        foundpost.save().then(()=>{
          res.redirect(`/comment/${req.params.id}`)
        })
      })
    })
  })
});
router.get('/comment/:id',isLoggedIn ,function(req, res, next) {
   userModel.findOne({
    username : req.session.passport.user
   }).then((founduser)=>{
      postModel.findOne({
        _id : req.params.id
      }).populate([
        {
          path : "user",
          model : "user"
        },
        {
          path : "comments",
          model : "comment",
          populate : {
            path : "user",
            model : "user"
          }
        }
      ]).then((userpost)=>{
        console.log(founduser);
        console.log(userpost);
        res.render('comment',{founduser , userpost})
      })
   })
  
});
router.get('/edit/:id',isLoggedIn ,function(req, res, next) {
  userModel.findOne({
    _id : req.params.id
  }).then((user)=>{
    
      //  console.log(user);
      res.render('edit',{user});
    
  })
});
router.get('/check/:username', function(req, res, next) {
 userModel.findOne({
  username : req.params.username
 }).then((user)=>{
  // console.log(user);
  if(user){
    res.json(true)
  } else {
      res.json(false)
    }
  })
  
 })
 router.post('/updated',isLoggedIn ,function(req, res, next) {
  userModel.findOneAndUpdate({
    username : req.session.passport.user
  },{
    username : req.body.username
  } , {new : true}).then((updated)=>{
    req.login(updated , function(err){
      if(err){ return next(err)}
      return res.redirect("/profile")
    })
  })
  
});

router.post('/uploadpic',upload.single('file') ,function(req, res, next) {
  userModel.findOneAndUpdate({
    username : req.session.passport.user
  },{
    img : req.file.filename
  }).then((user)=>{
   res.redirect("/profile")
  })
});


router.get('/feed', isLoggedIn ,  function(req, res, next) {
  userModel.findOne({
    username: req.session.passport.user
  }).then((user) => {
    // user.findOne().populate("user").then(() => {
      // console.log(user);
       postModel.find().populate("user").then((allpost)=>{

        
         res.render('file', { user, allpost});
       })
    })
  })
// })
router.get('/singup', function(req, res, next) {
  res.render('singup', { title: 'Express' });
});
router.post('/postcomment', function(req, res, next) {
  userModel.findOne({username: req.session.passport.user}).then((founduser)=>{
    
    postModel.create({
      post : req.body.post,
      user:founduser._id
    }).then((postcreated)=>{
      founduser.posts.push(postcreated._id)
      founduser.save().then(()=>{

        res.redirect('/profile');
      })
    })
  });
  })

router.get('/dltcmnt/:id', function(req, res, next) {
  postModel.findByIdAndDelete({
   _id:req.params.id
  }).then((dltpost)=>{
    res.redirect('/profile');

  })
});
router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});
router.get('/profile', isLoggedIn, function (req, res, next) {
  userModel.findOne({
    username: req.session.passport.user

  }).populate("posts").then((user) => {
    postModel.find().populate("user").then((tolo)=>{
      // console.log(user ," ha ha ha " , tolo);
      res.render('profile', { user, posts:user.posts , tolo});
    })
    })
    // user.find().populate("user").then(() => {
      // res.send(user)
      
  
  })
// })
router.post('/register', function (req, res) {
  userModel.findOne({username : req.body.username}).then((founduser)=>{
    if(founduser){
  res.send("username already exist!!")
    } else {
      var newUser = new userModel({
        username : req.body.username,
        age: req.body.age,
        email : req.body.email,
        contact : req.body.contact
      })
      userModel.register(newUser, req.body.password)
      .then(function (u) {
        passport.authenticate('local')(req, res, function () {
          res.redirect('/profile');
        })
      })
    }
  })
  
});
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "profile",
    failureRedirect: "/",
  }),
  function (req, res, next) {}
);
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/');
  }
}
router.get('/likes/:id', function (req, res, next) {
  postModel.findOne({
    _id: req.params.id 
  }).then((foundPost)=>{
    // console.log("sdfghjkl ",req.user.id);
    if(foundPost.likes.includes(req.user.id)){
      var index = foundPost.likes.indexOf(req.user.id);
    foundPost.likes.splice(index, 1);
    }else{

      foundPost.likes.push(req.user.id)
    }
  foundPost.save().then(()=>{

    res.redirect('back');
  })
  })
});
module.exports = router;
