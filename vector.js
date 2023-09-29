import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";

import express from "express";
const app = express()
import cors from "cors"; 


app.use(cors())

const ChatGP = async(search)=> {
//loading the document 
const loader = new CSVLoader("./toptwenty.csv");
const docs = await loader.load();


//stored as a vector file
const vectorStore = await MemoryVectorStore.fromDocuments(
    docs,
    new OpenAIEmbeddings()
  );
  
//get a response from chatgpt
  const model = new ChatOpenAI({ modelName: "gpt-3.5-turbo" });
  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
  
  const response = await chain.call({
    query: search
  });

  return response; 
}


  app.get('/', function (req, res) {
    res.send('Hello World')
  })
  
  
  app.get('/api/:id', async (req, res) => {
    //res.send(req.params.id)
    try {
    let response = await ChatGP(req.params.id); 
    res.send(response.text);
    }
    catch(error) {
      res.send(error.error.message)
      console.log(error)
    }
  })


  var port = process.env.PORT || 3000;

  app.listen(port, function () {
    console.log('App listening on port ' + port + '!');
  });