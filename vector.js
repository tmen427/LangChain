

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


const StoredVector= async(search) => {
//load the document 
const loader = new CSVLoader("./speech.txt");
//const loader = new CSVLoader("./half.csv");
const docs = await loader.load();


let llm = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY1,
});

 //llm = new ChatOpenAI({ modelName: "gpt-3.5-turbo" });  

// const embeddings = new CohereEmbeddings({
//   apiKey: process.env.COHERE_API_KEY, // In Node.js defaults to process.env.COHERE_API_KEY
//   batchSize: 96, // Default value if omitted is 48. Max value is 96
// });

//the batchSize is immportant, if the batchsize is smaller then size of the document the you will get errors
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY1, // In Node.js defaults to process.env.OPENAI_API_KEY
  batchSize: 512, // Default value if omitted is 512. Max is 2048
});

//stored as a vector file
 const vectorStore = await MemoryVectorStore.fromDocuments(
   docs,
   embeddings
 );

  const chain = await RetrievalQAChain.fromLLM(llm, vectorStore.asRetriever());
  const response = await chain.call({
  query: search
});
    return response; 
 }






  app.use(cors())

  app.get('/', function (req, res) {
  res.send("hello world")
  })
  
  
  app.get('/api/:id', async (req, res) => {
    //res.send(req.params.id)
    try {
      console.log(req.params.id)
    let response = await StoredVector(req.params.id); 
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