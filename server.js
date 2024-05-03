
import Express from "express";
import bodyParser from "body-parser";
import cors from "cors"
import Replicate from "replicate";
import mongoose from "mongoose";
import axios from "axios";
const app = Express()
app.use(cors())
app.use(bodyParser.json())

mongoose.connect("mongodb+srv://aiproject:9L3PJ3WnAplsWTjw@cluster0.pbkf96c.mongodb.net/AI_images?retryWrites=true&w=majority")
    .then(() => console.log("mongo atlas connected"))
    .catch(() => console.log(err))

// mongoose.connect("mongodb://localhost/newform")
// .then(()=>console.log("mongo connected"))
// .catch(()=>console.log(err))

const datachema = new mongoose.Schema({
    image_data: String,
    iname: String
})

const mon = mongoose.model('textimage', datachema)

const texttoimg = async (req, res, next) => {
    const { question } = req.body
    console.log(question)
    const replicate = new Replicate({
        auth: "r8_Sg7YJKmROQ2gS7hznNx9Wtr0FbDL7dd3OiV8i",
    });

    const output = await replicate.run(
        "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
        {
            input: {
                width: 600,
                height: 600,
                prompt: question,
                scheduler: "K_EULER_ANCESTRAL",
                guidance_scale: 3,
                apply_watermark: false,
                negative_prompt: "",
                num_inference_steps: 50
            }
        }
    );
    console.log(output);
    req.textvalue = output
    next()
}
app.post('/saveimage', texttoimg, async (req, res) => {
    const textval = req.textvalue
    const { question } = req.body
    await axios.get(textval[0], { responseType: "arraybuffer" }).then(async response => {
        const bufferdata = response.data
        const base64data = bufferdata.toString("base64")
        const savedata_url = "data:image/jpeg;base64," + base64data
        const sdata = new mon({ image_data: savedata_url, iname: question })
        await sdata.save()
        res.send(textval)
    })
})

app.get('/images', async (req, res) => {
    const sdata = await mon.find()
    // console.log(sdata)
    res.json(sdata)
})


app.listen(5000, () => { console.log("server started") })