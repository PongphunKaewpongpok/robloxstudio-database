import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userController = {
  getAllUsers: async (req, res) => {
    try{
      const users = await userService.getAllUsers()
      res.status(200).json(users)
    } catch(err) {
      res.status(500).json(err)
    }
  },
  getUserById: async (req, res) => {
    try {
      const id = req.params.id
      const user = await userService.getUserById(id)
      res.status(200).json(user)
    } catch(err) {
      res.status(500).json(err)
    }
    
  },
  register: async (req, res) => {
    try{
      const { name, password } = req.body
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await userService.create(name, hashedPassword)
      res.status(201).json(user)
    } catch(err){
      res.status(500).json(err)
    }
  },
  login: async (req, res) => {
    const { name, password } = req.body
    const user = await userService.getByUsername(name);
    if(!user){
      res.user(401).json({
        message: "Username or Password incorrect"
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      res.user(401).json({
        message: "Username or Password incorrect"
      });
    }
    
    const jwt_secret = process.env.JWT_SECRET;
    const payload = { name: user.name, userId: user.id }
    const token = jwt.sign(payload, jwt_secret, { expiresIn: "3d" });
    res.status(200).json({
      token: token
    })
  }
}

export default userController