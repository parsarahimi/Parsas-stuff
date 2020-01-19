console.log("Is this shit working?")
var image = new Image();
var image_resized = new Image();
function resize() {
    // create an off-screen canvas
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');
    // set its dimension to target size
    var width = 28
    var height = 28
    canvas.width = width;
    canvas.height = height;
    // draw source image into the off-screen canvas:
    ctx.drawImage(this, 0, 0, width, height);
    // encode image to data-uri with base64 version of compressed image
    image_resized.src = canvas.toDataURL()
    //return image;
    //return canvas.toDataURL();
}
document.onpaste = function(event){
  var items = (event.clipboardData || event.originalEvent.clipboardData).items;
  console.log(JSON.stringify(items)); // will give you the mime types
  for (index in items) {
    var item = items[index];
    if (item.kind === 'file') {
      var blob = item.getAsFile();
      var reader = new FileReader();
      reader.onload = function(event){
        image.src=event.target.result}; // data url!
      reader.readAsDataURL(blob);
    }
  }
}

image.onload=resize
image_resized.onload=drawImage
var reds = [];
var reds_t;
const normalize = tf.scalar(1/255.0)
function drawImage() {
            var canvas = document.getElementById('myCanvas');
            var context = canvas.getContext('2d');
            //var imageX = 0;
            //var imageY = 0;
            var imageWidth = this.width;
            var imageHeight = this.height;
            console.log("width",imageWidth,"and height",imageHeight)
            context.webkitImageSmoothingEnabled = false;
            context.mozImageSmoothingEnabled = false;
            context.imageSmoothingEnabled = false;
            context.drawImage(this, 0,0,this.width,this.height,0,0,28,28);//.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
            //context.drawImage(this,0,0)
            let imageData = context.getImageData(0, 0, imageWidth, imageHeight);
            context.drawImage(this, 0,0,this.width,this.height,0,0,280,280)
            //context.putImageData(imageData, 28, 0);
            console.log(imageData)
            console.log(imageData.data.length)
            reds = []
            for (i = 0; i < imageData.data.length/4; i++) {
                reds.push(imageData.data[i*4+1]);}
            reds = makethematrix(reds)
            reds_t = tf.sub(tf.ones([1,28,28]),tf.mul(normalize,tf.tensor(reds,dtype=tf.float32).reshape([1,28,28])))
            init(reds_t);
        }

//tensor flow stuff
//tf.reshape(
//const inputData = tf.tensor2d([[4.8, 3.0, 1.4, 0.1]], [1, 4]);
//var latest_ans;
//const inputData = tf.reshape(reds,(28,28))
async function init(inputData){
                const model = await tf.loadLayersModel('https://raw.githubusercontent.com/parsarahimi/Parsas-stuff/master/model.json');
                //const inputData = tf.const([tf.reshape(reds,[28,28])])
                //console.log(reds_t.shape)
                tf.print(inputData)
                let result = model.predict(inputData);
                //let i = result.indexOf(Math.max(result));
                const values = result.flatten().dataSync();
                //console.log(values)
                const arr = Array.from(values);
                console.log(arr)
                //let i = arr.indexOf(Math.max(arr));
                let biggy = indexOfMax(arr)
                console.log(biggy)
                document.getElementById("p1").innerHTML = ("Prediction: "+String(biggy));
                //console.log("Prediction:",i)
                //latest_ans = model.predict(inputData);
                //console.log(result)
                return;
                //const handler = "C:/Users/Hamid Rahimi/Documents/1websitepractice/Ai in browser/model/model.json";
                //const model = await tf.loadLayersModel(handler);

            }

//Math and grabge
function makethematrix(numbers)
{
    var mat = []
    var side_len = parseInt(Math.sqrt(numbers.length))
    for (i = 0; i < side_len; i++) {
        mat.push(numbers.slice(i*side_len,(i+1)*side_len))
    }
    return mat;
}
function rotateMatrix(mat) 
    { 
        // Consider all squares one by one
        N=mat.length
        for (x = 0; x < N / 2; x++) 
        { 
            // Consider elements in group of 4 in  
            // current square 
            for (y = x; y < N-x-1; y++) 
            { 
                // store current cell in temp variable 
                var temp = mat[x][y]; 
                // move values from right to top 
                mat[x][y] = mat[y][N-1-x]; 
                // move values from bottom to right 
                mat[y][N-1-x] = mat[N-1-x][N-1-y]; 
                // move values from left to bottom 
                mat[N-1-x][N-1-y] = mat[N-1-y][x];
                // assign temp to left 
                mat[N-1-y][x] = temp;
            } 
        }
        return mat; 
    } 


function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}