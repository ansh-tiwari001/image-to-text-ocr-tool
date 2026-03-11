const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const extractBtn = document.getElementById("extractBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const output = document.getElementById("output");
const loader = document.getElementById("loader");
const dropArea = document.getElementById("dropArea");
const toggleTheme = document.getElementById("toggleTheme");

let selectedFile = null;


// IMAGE SELECT
imageInput.addEventListener("change", function () {

selectedFile = this.files[0];

if(selectedFile){
preview.src = URL.createObjectURL(selectedFile);
preview.style.display = "block";
}

});


// DRAG & DROP
dropArea.addEventListener("dragover", function(e){
e.preventDefault();
});

dropArea.addEventListener("drop", function(e){

e.preventDefault();

selectedFile = e.dataTransfer.files[0];

if(selectedFile){
preview.src = URL.createObjectURL(selectedFile);
preview.style.display = "block";
}

});


// OCR PROCESS
extractBtn.addEventListener("click", async function(){

if(!selectedFile){
alert("Please upload an image first");
return;
}

loader.style.display="block";
loader.innerText="Preparing image...";
output.value="";

try{

const img = new Image();
img.src = URL.createObjectURL(selectedFile);

img.onload = async function(){

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

canvas.width = img.width;
canvas.height = img.height;

ctx.drawImage(img,0,0);

// IMAGE PREPROCESSING (GRAYSCALE)
let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
let data = imageData.data;

for(let i=0;i<data.length;i+=4){

let gray = data[i]*0.3 + data[i+1]*0.59 + data[i+2]*0.11;

data[i] = gray;
data[i+1] = gray;
data[i+2] = gray;

}

ctx.putImageData(imageData,0,0);

// OCR
const result = await Tesseract.recognize(
canvas,
"eng",
{
logger: m => {

if(m.status){
loader.innerText = m.status + "...";
}

}
}
);

output.value = result.data.text;

loader.style.display="none";

}

}catch(err){

console.error(err);
alert("OCR failed");
loader.style.display="none";

}

});


// COPY TEXT
copyBtn.addEventListener("click", function(){

if(!output.value){
alert("No text to copy");
return;
}

navigator.clipboard.writeText(output.value);

alert("Text copied");

});


// DOWNLOAD TEXT
downloadBtn.addEventListener("click", function(){

if(!output.value){
alert("No text to download");
return;
}

let blob = new Blob([output.value],{type:"text/plain"});

let link = document.createElement("a");

link.href = URL.createObjectURL(blob);

link.download="extracted-text.txt";

link.click();

});


// DARK MODE
toggleTheme.addEventListener("click", function(){

document.body.classList.toggle("dark");

});