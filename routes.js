const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jimp = require('jimp');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine","ejs")

mongoose.connect('mongodb://127.0.0.1:27017/agri');
const Schema = mongoose.Schema;
const maladesses = mongoose.model('maladesses', new Schema({ 
    name_malade:String,
    description_m:String,
    image_malade:String,
    malade:String,
    produit:String,
    description_p:String,
    image_produit:String
 }));

app.get("/ajouter",async(req,res)=>{
    const malades = await maladesses.find();
        res.render("ajouter", {
            resultat: {},
            malades : malades
        });
})
// app.get("/ali",async(req,res)=>{res.render("ali",{title:"ali"});})


app.get("/",async(req,res)=>{
    const malades = await maladesses.find();
    res.render("index",{
        title:"malades",
        malades : malades
        
    });
    
})

const urlToBuffer = async (url) => {
    return new Promise(async (resolve, reject) => {
        await jimp.read(url, async (err, image) => {
            if (err) {
                console.log(`error reading image in jimp: ${err}`);
                reject(err);
            }
            image.resize(400, 400);
            return image.getBuffer(jimp.MIME_PNG, (err, buffer) => {
                if (err) {
                    console.log(`error converting image url to buffer: ${err}`);
                    reject(err);
                }
                resolve(buffer);
            });
        });
    });
};
const compareImage = async (
    twitterProfilePicURL,
    assetCDNURL
) => {
    try {
        console.log('> Started comparing two images');
        const img1Buffer = await urlToBuffer(twitterProfilePicURL);
        const img2Buffer = await urlToBuffer(assetCDNURL);
        const img1 = PNG.sync.read(img1Buffer);
        const img2 = PNG.sync.read(img2Buffer);
        const { width, height } = img1;
        const diff = new PNG({ width, height });

        const difference = pixelmatch(
            img1.data,
            img2.data,
            diff.data,
            width,
            height,
            {
                threshold: 0.1,
            }
        ); 
        
        const compatibility = 100 - (difference * 100) / (width * height);
        // console.log(`${difference} pixels differences`);
        // console.log(`Compatibility: ${compatibility}%`);
        // console.log('< Completed comparing two images');
        console.log(compatibility);

        return compatibility;
        
    } catch (error) {
        console.log(`error comparing images: ${error}`);
        throw error;
    }
};
app.post('/create', async (req, res) => {
    const {image1} = req.body;
    const malades = await maladesses.find();
    // var md = "";
    // malades.forEach( async (e) => {
    //     const y = Number(100)
    //     const x = await compareImage(image1, e.image_malade);
    //     if (x == y) {
    //         md = e.name_malade
    //     }
    //     console.log(typeof x)
    //     console.log(typeof y)
    //     console.log(md)
    //     res.render("ajouter",{
    //         title: md,
    //         resultat: await maladesses.find({ name_malade:"carpocaps"})
    //     });
    // });
    if (image1) {
        let md = null;
        for (const e of malades) {
            const y = Number(100);
            const x = await compareImage(image1, e.image_malade); 
            if (x === y) {
                md = e.name_malade;
            }
            console.log(typeof x);
            console.log(typeof y);
            console.log(md);
            
            if (md !== null) {
                res.render("ajouter", {
                    resultat: await maladesses.find({ name_malade: md }),
                });
                break
            }
        }
       

    } else {
        const malades = await maladesses.find();
        res.render("ajouter", {
            resultat: {},
            malades : malades
        });
    }
    
    
});

app.listen(3000,()=>{
    console.log("http://localhost:3000");
})