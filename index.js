const express = require("express");
const fs = require("fs");
const users = require("./MOCK_DATA.json");
const app = express();
const PORT = 8000;

//Middleware
app.use(express.urlencoded({ extended: false }));

// app.use((req, res, next) => {
//   console.log("hello from the middleware 1!");
//   req.myName = "Kislay Raj"
//   next();
// });

// app.use((req, res, next) => {
//   console.log("hello from the middleware 2!" , req.myName);
//   // return res.json({msg: "This is a message from the middleware"})
// next()
// });

// log requests

app.use((req, res, next) => {
  fs.appendFile(
    "log.txt",
    `${Date.now()} : ${req.method}, ${req.path}\n`,
    (err, data) => {
      if (err) console.log(err);
      else console.log("Log file updated");
      next();
    }
  );
});

//Routes

// //render html
// app.get("/users",(req,res)=>{
//     const html =
//     ` <ul>
//     ${users.map(user=> `<li>${user.first_name}</li>`).join("")}  //map through users array and generate li for each user name. join("") combines all li elements into a string.

//     </ul>`
//     return res.send(html)
// })

//REST APIs

//GET
app.get("/api/users", (req, res) => {
  res.setHeader("X-My-Name", "Kislay Raj");
  // console.log(req.headers)
  //multiple headers
  // res.set({
  //   "myName": "Kislay Raj",
  //   "program": "Backend",
  //   "project": "1",
  //   "X-Server-Name": "MyExpressServer",
  //   "X-Request-Time": new Date().toISOString()
  // });
  return res.json(users);
});

// //GET one user by ID
// app.get("/api/users/:id", (req, res) => {
//   const id = Number(req.params.id);
//   const user = users.find((user) => user.id === id);
//   if(user){
//       return res.json(user);

//   }else{
//     return res.status(404).json({message: "User not found"})
//   }
// });

// POST

app.post("/api/users", (req, res) => {
  const body = req.body;
  // console.log("Body : ", body);
  if (
    !body ||
    !body.first_name ||
    !body.last_name ||
    !body.email ||
    !body.gender ||
    !body.job_title
  ) {
    return res
      .status(400)
      .json({ message: "Missing required fields. All fields are required" });
  }
  users.push({ id: users.length + 1, ...body });
  fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, result) => {
    if (err) return res.status(500).json({ message: "Error writing to file" });
    else return res.status(201).json({ status: "success", id: users.length });
  });
});

// //PATCH
// app.patch("/api/users/:id",(req,res)=>{
//         // TODO : edit the user with id

//     return res.json({status : "pending"})
// })

// //DELETE
// app.delete("/api/users/:id",(req,res)=>{
//     // TODO : delete the user with id

// return res.json({status : "pending"})
// })

// app.post("/api/users/",(req,res)=>{
//     return res.json({status : "pending"})
// })

// chaining id they have same "route"

app
  .route("/api/users/:id")
  .get((req, res) => {
    const id = Number(req.params.id);
    const user = users.find((user) => user.id === id);
    if (user) {
      return res.json(user);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  })
  .patch((req, res) => {
    const id = Number(req.params.id);
    const user = users.find((user) => user.id === id);

    if (user) {
      const body = req.body;
      const updatedUser = { ...user, ...body };
      users[users.indexOf(user)] = updatedUser;
      fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, data) => {
        //JSON.stringify(users, null, 2), null = no filter is applied and 2, formate with 2 space for neat look
        if (err) {
          return res
            .status(500)
            .json({ status: "error", message: "Failed to write to file" });
        }
        return res.status(202).json({ status: "success", updatedUser });
      });
    } else {
      return res.json({ status: "error" });
    }
  })
  .delete((req, res) => {
    const id = Number(req.params.id);
    const user = users.find((user) => user.id === id);
    if (user) {
      users.splice(users.indexOf(user), 1);
      fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, result) => {
        return res.status(200).json({
          status: "success",
          deletedId: id,
          totalLeft: users.length,
        });
      });
    } else {
      return res.status(404).json({ message: "User Not Found" });
    }
  }).put((req, res) => {
    return res.status(501).json({ status: "Not Implemented"})
  })
  ;

app.listen(PORT, () => {
  console.log("Server has started at Port : " + PORT);
});
