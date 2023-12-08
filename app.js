//jshint esversion:6
import express from 'express';
const app = express();
import bodyParser from 'body-parser';
import ejs from 'ejs';
import mongoose from 'mongoose';
// import encrypt from "mongoose-encryption";
// import md5 from 'md5';
import bcrypt from 'bcrypt';
import 'dotenv/config'


const saltRounds = 10;
const port = 3000;

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://ankur07:Ankur123@cluster0.66v6zsa.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const UserSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true, // You can add validation options if needed
    },
    password: {
      type: String,
      required: true,
    }
  });
//   UserSchema.plugin(encrypt, { secret: process.env.SECRET ,encryptedFields: ["password"]});
  
  const User = mongoose.model("User", UserSchema);
  




app.get("/",(req,res)=>{
    res.render("home.ejs")
})
app.get("/login",(req,res)=>{
    res.render("login.ejs")
})
app.get("/register",(req,res)=>{
    res.render("register.ejs")
})
app.get('/reset', (req, res) => {
  res.render('foregt');
});

// for md5 password: md5(req.body.password)
app.post("/register",  (req, res) => {
    // bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        
        const newUser = new User({
            email: req.body.username,
            password : hash
            
          });
        
          try {
             newUser.save();
            res.render("home");
            
          } catch (err) {
            console.log(err);
          }
    });
// });
    
  });
//for md5 const password = md5(req.body.password);
  app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    
    try {
        const foundUser = await User.findOne({ email: username});
        
        // if (foundUser && foundUser.password === password) {
        //   res.render("secrets");
        // }
        if(foundUser){
            const pass = await bcrypt.compare(password,foundUser.password);
            // bcrypt.compare(password, foundUser.password, function(err, result) {

                if(pass===true){
                    res.render("secrets");
                }
                else{
                    console.log("error");
                }

            // });
        }

      } catch (err) {
        console.log(err);
      }

});

// app.post('/reset-password', (req, res) => {
//   const { email, newPassword } = req.body;

//   // Find the user by email (this would usually be done by querying a database)
//   const user = User.find(user => user.email === email);

//   if (!user) {
//     return res.status(404).json({ message: 'User not found' });
//   }

//   // In a real scenario, you would hash the new password before saving it
//   user.password = newPassword;

//   return res.status(200).json({ message: 'Password reset successfully' });
// });
app.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;

    await user.save();

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});








app.listen(port,function(){
    console.log('server is running on port '+port);
})
