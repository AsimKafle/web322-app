/*********************************************************************************

WEB322 – Assignment 04
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Asim Kafle
Student ID: 152035218
Date: 2023/06/30
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
const exphbs = require("express-handlebars");
var HTTP_PORT = process.env.PORT || 8081;

// configure cloudinary 

cloudinary.config({
    cloud_name: 'dc4rdm3mh',
    api_key: '194927594363366',
    api_secret: 'sC6NBkLTNOhLLAp2VSeczGcIWF0',
    secure: true
  });

const upload = multer();

app.use(express.static('public'));
// This will add the property "activeRoute" to "app.locals" whenever the route changes
app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

// Register handlebars as the rendering engine for views
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    // Handlebars custom helper to create active navigation links
    // Usage: {{#navLink "/about"}}About{{/navLink}}
    helpers: {
      navLink: function (url, options) {
        return (
          '<li class="nav-item"><a ' +
          (url == app.locals.activeRoute ? ' class="nav-link active" ' : 'class="nav-link"') +
          ' href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      // Handlebars custom helper to check for equality
      // Usage: {{#equal value1 value2}}...{{/equal}}
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
    },
  })
);
app.set("view engine", ".hbs");

app.get("/items/add", (req, res) => {
    res.render("addItem");
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
app.get("/shop", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let items = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      items = await storeService.getPublishedItemsByCategory(req.query.category);
    } else {
      // Obtain the published "items"
      items = await storeService.getPublishedItems();
    }

    // sort the published items by postDate
    items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest post from the front of the list (element 0)
    let post = items[0];

    // store the "items" and "post" data in the viewData object (to be passed to the view)
    viewData.items = items;
    viewData.item = item;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await storeService.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", { data: viewData });
});

//ii
app.get('/shop/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "item" objects
      let items = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          items = await storService.getPublishedItemsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          items = await storeService.getPublishedItems();
      }

      // sort the published items by postDate
      items.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // store the "items" and "item" data in the viewData object (to be passed to the view)
     storeService.items = items;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the item by "id"
      viewData.item = await storeService.getItemById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await storeService.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", {data: viewData})
});

//items
app.get("/items", (req, res) => {
    if(req.query.category){
      storeService.getItemsByCategory(req.query.category)
      .then((data) => {
        res.render("items", { items: data });
      })
      // Error Handler
      .catch((err) => {
        res.render("items", { message: "no results" });
      });
    }
    else if(req.query.minDate){
      storeService.getItemsByMinDate(req.query.minDate)
      .then((data) => {
        res.render("items", { items: data });
      })
      // Error Handler
      .catch((err) => {
        res.render("items", { message: "no results" });
      });
    }
    else{
      storeService.getAllitems()
        .then((data) => {
          res.render("items", { items: data });
        })
        .catch((err) => {
          res.render("items", { message: "no results" });
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
      res.render("categories", { categories: categoriesData });
    }).catch((error)=>{
      res.render("categories", { message: "no results" });
    });
});

// Redirect the root URL ("/") to the "/about" route
app.get("/", (req, res) => {
    res.redirect("/shop");
});

// Return the about.html file from the 'views' folder
app.get("/about", (req, res) => {
    res.render("about");
});

app.use((req,res)=>{
    res.status(404).render('404');
});
// Start the server and listen on the specified port

storeService.initialize().then(()=>{
    app.listen(HTTP_PORT, () => {
        console.log("Express http server listening on " + HTTP_PORT);
    });
    
}).catch((error)=>{
    console.error('Error in initializing Store Service');
});