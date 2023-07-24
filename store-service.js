/*********************************************************************************

WEB322 – Assignment 05
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Asim Kafle
Student ID: 152035218
Date: 2023/07/21
Cyclic Web App URL: https://funny-erin-puffer.cyclic.app/
GitHub Repository URL: https://github.com/AsimKafle/web322-app

********************************************************************************/
const Sequelize = require('sequelize');
var sequelize = new Sequelize('uakxkhtd', 'uakxkhtd', '7g_0KMLc1NN_dAgxUB04lN5aqr2q_R7k', {
    host: 'mahmud.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});
sequelize
    .authenticate()
    .then(function () {
        console.log('Connection has been established successfully.');
    })
    .catch(function (err) {
        console.log('Unable to connect to the database:', err);
    });

    var Item = sequelize.define('Item', {
        body: Sequelize.TEXT,
        title: Sequelize.STRING,
        postDate: Sequelize.DATE,
        featureImage:Sequelize.STRING,
        published:Sequelize.BOOLEAN,
        price:Sequelize.DOUBLE
    });

    
    var Category = sequelize.define('Category', {
        category:Sequelize.STRING
    });

    Item.belongsTo(Category, {foreignKey: 'category'});
    

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                console.log('Database synced successfully!');
                resolve();
            })
            .catch((err) => {
                console.error('Unable to sync the database:', err);
                reject("unable to sync the database");
            });
    });
}


module.exports.getItemById = function(id){
    return new Promise((resolve,reject)=>{
        Item.findAll({
            where: {
                id: id
            }
        })
            .then((items) => {
                if (items.length > 0) {
                    resolve(items[0]);
                } else {
                    reject('no results returned');
                }
            })
            .catch((err) => {
                console.error('Error while fetching item by id:', err);
                reject('no results returned');
            });
    });
}

module.exports.getPublishedItems = function(){
    return new Promise((resolve,reject)=>{
        Item.findAll({
            where: {
                published: true
            }
        })
            .then((items) => {
                if (items.length > 0) {
                    resolve(items);
                } else {
                    reject('no results returned');
                }
            })
            .catch((err) => {
                console.error('Error while fetching published items:', err);
                reject('no results returned');
            });
    });
}

module.exports.getAllItems = function(){
    return new Promise((resolve,reject)=>{
        Item.findAll()
            .then((items) => {
                if (items.length > 0) {
                    resolve(items);
                } else {
                    reject('no results returned');
                }
            })
            .catch((err) => {
                console.error('Error while fetching items:', err);
                reject('no results returned');
            });
    });
}

module.exports.addItem = function(itemData){
    return new Promise((resolve, reject) => {
        itemData.published = (itemData.published) ? true : false;

        for (let idx in itemData) {
            if (itemData[idx] === "") {
                itemData[idx] = null;
            }
        }

        itemData.postDate = new Date();

        Item.create(itemData)
            .then(() => {
                resolve();
            })
            .catch((err) => {
                console.error('Error while adding item:', err);
                reject('unable to create post');
            });
    });
}

module.exports.getCategories = function(){
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then((categories) => {
                if (categories.length > 0) {
                    resolve(categories);
                } else {
                    reject('no results returned');
                }
            })
            .catch((err) => {
                console.error('Error while fetching categories:', err);
                reject('no results returned');
            });
    });
}



module.exports.getItemsByCategory = function(category1){
    return new Promise((resolve,reject)=>{
        Item.findAll({
            where: {
                category: category1
            }
        })
            .then((items) => {
                if (items.length > 0) {
                    resolve(items);
                } else {
                    reject('no results returned');
                }
            })
            .catch((err) => {
                console.error('Error while fetching items by category:', err);
                reject('no results returned');
            });
    });
}
const {gte}=Sequelize.Op;


module.exports.getItemsByMinDate = function(minDateStr) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        })
            .then((items) => {
                if (items.length > 0) {
                    resolve(items);
                } else {
                    reject('no results returned');
                }
            })
            .catch((err) => {
                console.error('Unable to fetch items by min date:', err);
                reject('no results returned');
            });
    });
}

module.exports.getPublishedItemsByCategory = function(category){
    return new Promise((resolve,reject)=>{
        Item.findAll({
            where: {
                published: true,
                category: category
            }
        })
            .then((items) => {
                if (items.length > 0) {
                    resolve(items);
                } else {
                    reject('no results returned');
                }
            })
            .catch((err) => {
                console.error('Unable to fetch published items by category:', err);
                reject('no results returned');
            });
    });
}
module.exports.addCategory=function(categoryData){
    return new Promise((resolve, reject) => {
        for (let idx in categoryData) {
            if (categoryData[idx] === "") {
                categoryData[idx] = null;
            }
        }
    
        Category.create(categoryData)
          .then(() => {
            resolve();
          })
          .catch((err) => {
            console.error("Error while creating category:", err);
            reject("unable to create category");
          });
      });
}
 module.exports.deletePostById = function (id) {
    return new Promise((resolve, reject) => {
      Item.destroy({
        where: {
          id: id,
        },
      })
        .then((rowsDeleted) => {
          if (rowsDeleted > 0) {
            resolve();
          } else {
            reject("item not found");
          }
        })
        .catch((err) => {
          console.error("Error while deleting item:", err);
          reject("unable to delete item");
        });
    });
  };
module.exports.deleteCategoryById = function (id) {
    return new Promise((resolve, reject) => {
      Category.destroy({
        where: {
          id: id,
        },
      })
        .then((rowsDeleted) => {
          if (rowsDeleted > 0) {
            resolve();
          } else {
            reject("category not found");
          }
        })
        .catch((err) => {
          console.error("Error while deleting category:", err);
          reject("unable to delete category");
        });
    });
  };

  