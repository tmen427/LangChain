

import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { CohereEmbeddings} from "langchain/embeddings/cohere"; 
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAI } from "langchain/llms/openai";
import 'dotenv/config';
import express from "express";
const app = express()
import cors from "cors"; 



const ChatGP = async(search)=> {
//loading the document 
const loader = new CSVLoader("./toptwenty.csv");
const docs = await loader.load();

console.log("this is your api key")
console.log(process.env.OPENAI_API_KEY1)
console.log(process.env.COHERE_API_KEY)

let llm = new OpenAI({
     openAIApiKey: process.env.OPENAI_API_KEY1,
   });

//get a response from chatgpt
 // llm = new ChatOpenAI({ modelName: "gpt-3.5-turbo" });

const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERE_API_KEY, // In Node.js defaults to process.env.COHERE_API_KEY
  batchSize: 48, // Default value if omitted is 48. Max value is 96
});

//stored as a vector file
 const vectorStore = await MemoryVectorStore.fromDocuments(
   docs,
   embeddings
 );

 const chain = RetrievalQAChain.fromLLM(llm, vectorStore.asRetriever());
  
   const response = await chain.call({
    query: search
  });

  return response; 
}



  app.use(cors())

  app.get('/', function (req, res) {
   // res.send('Hello World')
    res.send(process.env.openapi_key)

  })
  
  
  app.get('/api/:id', async (req, res) => {
    //res.send(req.params.id)
    try {
      console.log(req.params.id)
    let response = await ChatGP(req.params.id); 
    res.send(response.text);
    }
    catch(error) {
      res.send(error.message)
      console.log(error)
    }
  })


  var port = process.env.PORT || 3000;

  app.listen(port, function () {
    console.log('App listening on port ' + port + '!');
  });