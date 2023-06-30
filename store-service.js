/*********************************************************************************

WEB322 – Assignment 04
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Asim Kafle
Student ID: 152035218
Date: 2023/06/30
Cyclic Web App URL: https://funny-erin-puffer.cyclic.app/
GitHub Repository URL: https://github.com/AsimKafle/web322-app

********************************************************************************/
const fs=require("fs");
let items=[];
let categories=[];


initialize=function(){
    return new Promise((resolve,reject)=>{
        fs.readFile('./data/items.json', 'utf8', (err, itemsdata) => {
            if (err) {
              reject('Unable to read items.json file');
            } else {
              try {
                const itemsrray = JSON.parse(itemsdata);
                items = itemsrray;
                fs.readFile('./data/categories.json','utf8',(err,data)=>
                {
                    if(err){
                        reject('Unable to read categories.json file');
                    }else{
                        try{
                            const categArray=JSON.parse(data);
                            categories=categArray;
                            resolve();
                        }
                        catch(parseError){
                            reject('Error parsing categories.json file');
                        }
                    }
                });
              } catch (parseError) {
                reject('Error parsing items.json file');
              }
            } 
    })
    });
}

getAllitems=function(){
    return new Promise((resolve,reject)=>{
        if(items.length===0){
            reject('No results returned');
        }
        else{
            resolve(items);
        }
    });
}

getPublishedItems=function(){
    return new Promise((resolve,reject)=>{
        const pItems=items.filter(item=>item.published===true);
        if(pItems.length===0){
            reject('No results returned');
        }
        else{
            
            resolve(pItems);
        }
    });
}

getCategories=function(){
    return new Promise((resolve,reject)=>{
        if(categories.length===0){
            reject('No results returned');
        } else{
            resolve(categories);
        }
        });
    }
addItem = function(itemData){
            return new Promise((resolve, reject) => {
                if (itemData.published === undefined) {
                    itemData.published = false;
                } else {
                    itemData.published = true;
                }
                itemData.id = items.length + 1;
                items.push(itemData);
                resolve(itemData);
            });
        } 
        
getItemsByMinDate = function(minDateStr){
            return new Promise((resolve, reject) => {
                const filteredItems = items.filter(item => new Date(item.postDate) >= new Date(minDateStr));
        
                if (filteredItems.length > 0) {
                    resolve(filteredItems);
                } else {
                    reject("no results returned");
                }
            });
        }

getItemsByCategory = function (category) {
            return new Promise((resolve, reject) => {
                const filteredItems = items.filter(item => item.category == category);
        
                if (filteredItems.length > 0) {
                    resolve(filteredItems);
                } else {
                    reject("no results returned");
                }
            })
        }

getItemById = function (id) {
            return new Promise((resolve, reject) => {
                const filteredItems = items.filter(item => item.id == id);
                
        
                if (filteredItems) {
                    resolve(filteredItems);
                }
                else {
                    reject("no result returned");
                }
            })
        }   
        
         getPublishedItemsByCategory = function(category) {
            return new Promise((resolve, reject) => {
                const filteredItems = items.filter(item => item.category == category && item.published === true);
        
                if (filteredItems.length > 0) {
                    resolve(filteredItems);
                } else {
                    reject("no results returned");
                }
            })
        }

module.exports={
    initialize,
    getAllitems,
    getPublishedItems,
    getCategories,
    addItem,
    getItemsByMinDate,
    getItemsByCategory,
    getItemById,
    getPublishedItemsByCategory
}