/*********************************************************************************

WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Asim Kafle
Student ID: 152035218
Date: 2023/06/02
Cyclic Web App URL: https://funny-erin-puffer.cyclic.app/
GitHub Repository URL: https://github.com/AsimKafle/web322-app

********************************************************************************/ 

var express = require("express");
var app = express();
var path = require("path");
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const storeService = require('./store-service');
var HTTP_PORT = process.env.PORT || 8080;

// configure cloudinary 

cloudinary.config({
    cloud_name: 'dc4rdm3mh',
    api_key: '194927594363366',
    api_secret: 'sC6NBkLTNOhLLAp2VSeczGcIWF0',
    secure: true
  });

const upload = multer();

app.use(express.static('public'));

app.get("/items/add", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "addItem.html"));
  })

  app.post("/items/add", upload.single("featureImage"), (req, res) => {
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processItem(uploaded.url);
        });
    }else{
        processItem("");
    }
     
    function processItem(imageUrl){
        req.body.featureImage = imageUrl;

    storeService.addItem(req.body).then(()=>{
        res.redirect("/Items")
    })  ;
    } });


//shop
app.get("/shop",(req,res)=>{
    storeService.getPublishedItems().then((itemsData)=>{
        res.json(itemsData);
    }).catch((error)=>{
        res.status(500).json({message:err});
    });
});

//items
app.get("/items", (req, res) => {
    if(req.query.category){
      storeService.getItemsByCategory(req.query.category)
      .then((data) => {
        res.send(data);
      })
      // Error Handler
      .catch((err) => {
        res.send(err);
      });
    }
    else if(req.query.minDate){
      storeService.getItemsByMinDate(req.query.minDate)
      .then((data) => {
        res.send(data);
      })
      // Error Handler
      .catch((err) => {
        res.send(err);
      });
    }
    else{
      storeService.getAllitems()
        .then((data) => {
          res.send(data)
        })
        .catch((err) => {
          res.send(err);
    });
}
});
app.get("/item/:value", (req, res) => {
    storeService.getItemById(req.params.value)
    .then((data) => {
      res.json(data);
    })
    // Error Handler
    .catch((err) => {
      res.send(err);
    });
  }) ; 

//categories
app.get("/categories",(req,res)=>{
    storeService.getCategories().then((categoriesData)=>{
        res.json(categoriesData);
    }).catch((error)=>{
        res.status(500).json({message:err});
    });
});

// Redirect the root URL ("/") to the "/about" route
app.get("/", (req, res) => {
    res.redirect("/about");
});

// Return the about.html file from the 'views' folder
app.get("/about", (req, res) => {
    res.sendFile(__dirname + "/views/about.html");
});

app.use((req,res)=>{
    res.status(404).send('Page Not FOund');
});
// Start the server and listen on the specified port

storeService.initialize().then(()=>{
    app.listen(HTTP_PORT, () => {
        console.log("Express http server listening on " + HTTP_PORT);
    });
    
}).catch((error)=>{
    console.error('Error in initializing Store Service');
});