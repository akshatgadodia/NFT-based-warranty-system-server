const express = require('express'); 
const Cors = require('cors');
const axios = require('axios');
const config = require('./pinata')
const burn = require('./burn')
const transporter = require('./mail')
const fs = require('fs');
const schedule = require('node-schedule');

const app = express(); 
const port = process.env.PORT || 5000;

app.use(express.json())
app.use(Cors());

const burnNFT = async () => {
    burn.burn();
}

app.listen(port, async () => {
    console.log(`Listening on port ${port}`)
    schedule.scheduleJob('00 00 02 * * *',()=>{burnNFT()})

});

const saveDataOnIFPS = async (NFTData) =>{
    var data = JSON.stringify({"pinataOptions": {"cidVersion": 1},"pinataMetadata": {
        "name": "Warranty Card Data","keyvalues": {"customKey": "customValue","customKey2": "customValue2"}},
        "pinataContent": NFTData});
    const res = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS',data,config);
    return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`
}

app.post('/getIfpsUrl',async (req, res) => { 
    const data = await saveDataOnIFPS(req.body.data)
    res.send({ link : data });
});

app.post('/sendMail',async (req, res) => { 
    try{
    const data = req.body;
    let sendResult = await transporter.sendMail({
        from : 'Drunken Bytes <bytes.drunken@hotmail.com>',
        to  : data.email,
        subject : 'Congralutations on receiving NFT Warranty Card',
        text : `Hello ${data.name}, Congratulations on your purchase of ${data.brand} ${data.productName} with id ${data.productId} from 
                ${data.seller}. You have also received the Warranty Card NFT with id ${data.tokenId} with your purchase.
                You can view this NFT on OpenSea and it will automatically be burned after ${data.expireDate}. Regards,The Drunken Bytes Team`,
        html :`Hello <b>${data.name},</b>
              <p>Congratulations on your purchase of <b>${data.brand} ${data.productName}</b> with product id <b>${data.productId}</b> from 
              <b>${data.seller}</b>.<br/>You have also received the Warranty Card NFT with id <b>${data.tokenID}</b> with your purchase.<br/>
              You can view this NFT on OpenSea and it will automatically be burned after <b>${data.warrantyExpireDate}</b>.
              <br/><br/>Regards,<br/>The Drunken Bytes Team</p>`
      });
      console.log(sendResult);
    }
    catch(err){
        console.log(err);
    }
    res.send({ message : "Mail send successfully" });
});


app.post('/storeData',async (req, res) => { 
    const receivedData = req.body.data;
    const data = require("./data");
    data.push({
        tokenID : receivedData.tokenID,
        expireDate : receivedData.warrantyExpireDate 
    });
    fs.writeFileSync("data.json", JSON.stringify(data), err => {
        if (err) throw err; 
    });
    res.send({ tokenID : receivedData.tokenID });
});
