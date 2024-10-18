## About Scaffold
It is a node js backend scaffold. Here I use express js, mongo with mongoose ODM. You can see package.json for reference. Here I also use swagger for API tester. Its start with http://localhost:port/api-docs. Here has a example module which has basic crud operation. You can copy and paste module, rename it and add route into routes folder index file. You will get the API route into swagger. Please do necessary action with swagger part like change API route name and other things.

## How to start

- git clone repo
- npm install
- go to path with console
- run "npm run data:import"
- start with "npm run dev"


## How to use this scaffold
- for login authentication here has 2 model (role, user)
- when run migrate and seed, we will get a admin user. (admin@mail.com/admin)
- default register role is user
- if you need to change user criteria for user model, please follow user migration and user model before run the migration
- it is also check user status. default is 1 if 0 can not login with this id
- if need new module, please copy example module and change it for your work criteria
- it has integrated nodemailer setup in global section for send mail

## mongo shell command ##
===================

**step-1: showing database**
```
show dbs
```

**step-2: database create**
```
use dbname
```

**step-3: it will show previous dbs** 
```
show dbs
```

**step-4: it will switch and show current db** 
```
db
```

**stepp-5: create table and insert one data where collection_name will be table name**
```
db.collection_name.insertOne({name: 'xyz', age: '24', mobile: '+8801711000000'});
```

**step-6: show all collection_name table data**
```
db.collection_name.find()
```

**step-7: it will show as better format json data**
```
db.collection_name.find().pretty()
```

**setp-8: multiple data insert in same time**
```
db.collection_name.insertMany({}, {})
```

**setp-9: find specific data, it will be single or multiple. you can add pretty() in last. but findOne has not pretty function. so don't use findOne({}).pretty()**
```
db.collection_name.find({key:'value'})
```

**step-10: find specific data without some key:value, this is called projection. if we want those key show it will 1 or hide it will be 0**
```
db.collection_name.find({key:'value'}, {key: '0/1'}).pretty()
```

**step-11: if we want single data pass value to limit() function**
```
db.collection_name.find({key:'value'}).pretty().limit(1)
```

**step-12: if we want second single data pass value to limit() then skip() function**
```
db.collection_name.find({key:'value'}).pretty().limit(1).skip(1)
```

**setp-13: if you want to update a record use db.collection_name.uppdateOne({key: 'value'}, {$set: {key:'value'}})**
```
db.collection_name.uppdateOne({key: 'value'}, {$set: {key:'value'}})
```

**step-14: if you want to update many record use db.collection_name.uppdateMany({}, {$set: {key:'value'}}). don't any key value into first object if all key:value set uppdate**
```
db.collection_name.uppdateMany({}, {$set: {key:'value'}})
```

**step-15: if you want to delete one use db.collection_name.deleteOne({key:'value'})**
```
db.collection_name.deleteOne({key:'value'})
```

**step-15:if you want to delete many use db.collection_name.deleteMany({key:'value'})**
```
db.collection_name.deleteMany({key:'value'})
```