const express = require('express');
const bodyParser = require('body-parser');
const multer  = require('multer')
const app = express();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '../images ali')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniqueSuffix + '.png')
    }
})

const upload = multer({ storage: storage })
app.set('view engine', 'ejs')
app.use(express.static('images'))
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine","ejs")

app.get("/",async(req,res)=>{res.render("index")});
app.post('/create' , upload.single('image1'), async (req, res) => {
    res.render('index');
    console.log(req.file.filename);
    console.log('image saved'); 
});

app.listen(11235,()=>{
    console.log("http://localhost:11235");
    console.log("http://192.168.0.110:11235");
})