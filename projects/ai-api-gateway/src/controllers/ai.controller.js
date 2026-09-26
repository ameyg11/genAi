import {generateText} from "../services/ai.service.js"

export async function generate(req, res){
    try{
        const {model, input} = req.body;

        const result = await generateText({
            model,
            input,
        });
        res.json(result);
    }catch(err){
        console.log(err);
        res.status(500).json({
            error: "Failed to generate response",
        })
    }
}