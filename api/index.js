const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const User = require('./models/User.js');
const Place = require('./models/Place.js');
const Booking = require('./models/Booking.js');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs'); //const { resolve } = require('path');
const mime = require('mime-types');
const os = require('os');

require('dotenv').config();
const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'fasefraw4r5r3wq45wdfgw34twdfg';

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname+'/uploads'));
app.use(cors({
    origin: 'http://localhost:5173', // Allow your frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  }));

// mongoose.connect(process.env.MONGO_URL); connecting to Atlas , not sure its necessery i need to connect in every endpoint, instead of when the server starts //

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  const photosMiddleware = multer({ dest: os.tmpdir() });

  async function uploadToCloudinary(path, originalFilename, mimetype) {
    try {
      // Upload the file to Cloudinary
      const result = await cloudinary.uploader.upload(path, {
        public_id: `${Date.now()}-${originalFilename}`, // Generate a unique filename
        resource_type: "auto", // Automatically detect the resource type
        folder: "booking-app", // Optional: specify a folder in your Cloudinary account
      });
  
      // Delete the temporary file
      fs.unlinkSync(path);
  
      // Return the Cloudinary URL
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('Failed to upload file to Cloudinary');
    }
  }

function getUserDataFromReq(req) {
    return new Promise((resolve, reject) => {
        jwt.verify(req.cookies.token, jwtSecret, {}, async(err, userData) => {
            if (err) throw err;
            resolve(userData);
        });   
    });
}

app.get('/test', (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    res.json('test ok');
});

app.post('/register', async (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {name,email,password} = req.body;

    try {
        const userDoc = await User.create({
            name,
            email,
            password:bcrypt.hashSync(password, bcryptSalt),
        });
        res.json({userDoc});
    }   catch (e) {
        res.status(422).json(e);
    }
     
});

app.post('/login', async (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {email,password} = req.body;
    const userDoc = await User.findOne({email});
    if (userDoc) {
        const passOk = bcrypt.compareSync(password, userDoc.password)
        if (passOk) {
            jwt.sign({
                email:userDoc.email,
                 id:userDoc._id,
                }, jwtSecret, {}, (err,token) => {
                if (err) throw err;
                res.cookie('token', token).json(userDoc);
            });
        } else {
            res.status(422).json('pass not ok');
        }
    } else {
        res.json('not found');
    }
});

app.get('/profile', (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {token} = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, async(err, userData) => {
            if (err) throw err;
            const {name,email,_id} = await User.findById(userData.id);
            res.json({name,email,_id});
        });
    } else {
        res.json(null);
    }
})

app.post('/logout', (req,res) => {
    res.cookie('token', '').json(true);
})


app.post('/upload-by-link', async (req, res) => {
    const { link } = req.body;
    const newName = 'photo' + Date.now() + '.jpg';
    const destPath = os.tmpdir() + '/' + newName; // Use os.tmpdir() for temporary file storage

    try {
        // Download the image
        await imageDownloader.image({
            url: link,
            dest: destPath,
        });

        // Upload the image to Cloudinary
        const cloudinaryUrl = await uploadToCloudinary(destPath, newName, mime.lookup(destPath));
        
        res.json(cloudinaryUrl); // Return the Cloudinary URL
    } catch (error) {
        console.error('Error during upload by link process:', error);
        res.status(500).json({ message: 'Failed to upload file by link' });
    }
});

// Route for handling file uploads
app.post('/upload', photosMiddleware.array('photos', 100), async (req, res) => {
    try {
      const uploadedFiles = [];
  
      for (let i = 0; i < req.files.length; i++) {
        const { path, originalname } = req.files[i];
        const cloudinaryUrl = await uploadToCloudinary(path, originalname);
        uploadedFiles.push(cloudinaryUrl);
      }
  
      res.json(uploadedFiles);
    } catch (error) {
      console.error('Error during upload process:', error);
      res.status(500).json({ message: 'Failed to upload files' });
    }
  });

app.post('/places', (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {token} = req.cookies;
    const {
        title,address,addedPhotos,description,price,
        perks,extraInfo,checkIn,checkOut,maxGuests,
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async(err, userData) => {
        if (err) throw err;
        const placeDoc = await Place.create({
            owner:userData.id,price,
            title,address,photos:addedPhotos,description,
            perks,extraInfo,checkIn,checkOut,maxGuests,
        });
        res.json(placeDoc);
    });
})

app.get('/user-places', (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {token} = req.cookies;
    jwt.verify(token, jwtSecret, {}, async(err, userData) => {
        const {id} = userData;
        res.json( await Place.find({owner:id}) );
    });
});

app.get('/places/:id', async (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {id} = req.params;
    res.json(await Place.findById(id));
});

app.put('/places', async (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {token} = req.cookies;
    const {
        id, title,address,addedPhotos,description,
        perks,extraInfo,checkIn,checkOut,maxGuests,price,
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async(err, userData) => {
        if (err) throw err;
        const placeDoc = await Place.findById(id);
        if (userData.id === placeDoc.owner.toString()) {
            placeDoc.set({
                title,address,photos:addedPhotos,description,
                perks,extraInfo,checkIn,checkOut,maxGuests,price,
            });
            await placeDoc.save();
            res.json('ok');
        }
    });
});

app.get('/places', async (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    res.json( await Place.find() );
})

app.post('/bookings', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    const userData = await getUserDataFromReq(req);
    const {
        place,checkIn,checkOut,numberOfGuests,name,phone,price,
    } = req.body;
    Booking.create({
        place,checkIn,checkOut,numberOfGuests,name,phone,price,
        user:userData.id,
    }).then((doc) => {
        res.json(doc);
    }).catch((err) => {
        throw err;
    });
});



app.get('/bookings', async (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    const userData = await getUserDataFromReq(req);
    res.json( await Booking.find({user:userData.id}).populate('place') );
});

app.listen(4000);