import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as tfd from '@tensorflow/tfjs-data'
import {ControllerDataset} from './controller_dataset';
import { Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import * as cpn from './component' ;
import './App.css';


// 待解决:
// 1.capture闪屏
// 2.isloading 组件状态更新（最好把组件提取出来）

const controllerDataset = new ControllerDataset(4);
function App() {
  //opencamera() ;
  let truncatedMobileNet ;
  let model = null ;
  const isPredicting = useRef(false) ;
  const childRef = useRef() ;
  useEffect(()=>{
    console.log("重新渲染");
    console.log(model) ;
    init();
  })
  const handleStart = () => {
    console.log("gogogo") ;
    localStorage.setItem("start", "yes") ;
    isPredicting.current = true ;
    predict() ;
  }
  async function init() {
    let webcam ;
    
    try {
      webcam = await tfd.webcam(document.getElementById('camera'));
    } catch (e) {
      console.log(e);
      //document.getElementById('no-webcam').style.display = 'block';
    }
    truncatedMobileNet = await loadTruncatedMobileNet();
  
    //ui.init();
  
    // Warm up the model. This uploads weights to the GPU and compiles the WebGL
    // programs so the first time we collect data from the webcam it will be
    // quick.
    const screenShot = await webcam.capture();
    truncatedMobileNet.predict(screenShot.expandDims(0));
    screenShot.dispose();
  }
  
  //在建立模型之前，我们需要将一个预训练的MobileNet加载到网页中。
  //从这个模型中，我们将构建一个新模型，它从MobileNet输出一个内部激活。
  async function loadTruncatedMobileNet() {
    const mobilenet = await tf.loadLayersModel(
        'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
  
    //通过调用getLayer（'conv_pw_13_relu'），我们得到了预训练的MobileNet模型的内部层，
    //并构建了一个新模型，其中输入与MobileNet的相同，但输出的是MobileNet中间层，名为conv_pw_13_relu。
    const layer = mobilenet.getLayer('conv_pw_13_relu');
    return tf.model({inputs: mobilenet.inputs, outputs: layer.output});
  }


  //导入数据训练
  async function train() {
    const u = document.getElementById('batch').value ;
    console.log(u) ;
    if (controllerDataset.xs == null) {
      throw new Error('Add some examples before training!');
    }
    truncatedMobileNet = await loadTruncatedMobileNet();
    // Creates a 2-layer fully connected model. By creating a separate model,
    // rather than adding layers to the mobilenet model, we "freeze" the weights
    // of the mobilenet model, and only train weights from the new model.
    model = tf.sequential({
      layers: [
        // Flattens the input to a vector so we can use it in a dense layer. While
        // technically a layer, this only performs a reshape (and has no training
        // parameters).
        tf.layers.flatten(
            {inputShape: truncatedMobileNet.outputs[0].shape.slice(1)}),
        // Layer 1.
        tf.layers.dense({
          units: Number(document.getElementById('units').value),//获取hidden unit
          activation: 'relu',
          kernelInitializer: 'varianceScaling',
          useBias: true
        }),
        // Layer 2. The number of units of the last layer should correspond
        // to the number of classes we want to predict.
        tf.layers.dense({
          units: 4,
          kernelInitializer: 'varianceScaling',
          useBias: false,
          activation: 'softmax'
        })
      ]
    });
  
    // Creates the optimizers which drives training of the model.
    const optimizer = tf.train.adam(Number(document.getElementById('lr').value));//获取学习速率
    // We use categoricalCrossentropy which is the loss function we use for
    // categorical classification which measures the error between our predicted
    // probability distribution over classes (probability that an input is of each
    // class), versus the label (100% probability in the true class)>
    model.compile({optimizer: optimizer, loss: 'categoricalCrossentropy'});
  
    // We parameterize batch size as a fraction of the entire dataset because the
    // number of examples that are collected depends on how many examples the user
    // collects. This allows us to have a flexible batch size.
    const batchSize =
        Math.floor(controllerDataset.xs.shape[0] * document.getElementById('batch').value);//获取batchsize,batchsize要大于0.4
    if (!(batchSize > 0)) {
      throw new Error(
          `Batch size is 0 or NaN. Please choose a non-zero fraction.`);
    }
  
    // Train the model! Model.fit() will shuffle xs & ys so we don't have to.
    model.fit(controllerDataset.xs, controllerDataset.ys, {
      batchSize,
      epochs: Number(document.getElementById('epochs').value),
      callbacks: {
        onBatchEnd: async (batch, logs) => {
          document.getElementById('loss').innerHTML=`Loss: ${logs.loss.toFixed(5)}` ;
        }
      }
    });
    childRef.current.handleLoad() ;
    predict() ;
  }

  //预测函数
  async function predict() {
    
    //ui.isPredicting();
    while (isPredicting) {
      // Capture the frame from the webcam.
      const img = await getImage();
  
      // Make a prediction through mobilenet, getting the internal activation of
      // the mobilenet model, i.e., "embeddings" of the input images.
      const embeddings = truncatedMobileNet.predict(img);
  
      // Make a prediction through our newly-trained model using the embeddings
      // from mobilenet as input.
      
      const predictions = model.predict(embeddings);
  
      // Returns the index with the maximum probability. This number corresponds
      // to the class the model thinks is the most probable given the input.
      const predictedClass = predictions.as1D().argMax();
      const classId = (await predictedClass.data())[0];
     // console.log(classId) ;
      img.dispose();
      
      postMsg(classId) ;
      //ui.predictClass(classId);
      await tf.nextFrame();
    }
    //ui.donePredicting();
  }

  async function getDraw(idd) {
    console.log('onclick');
    let img = await getImage();
    let canvas = document.getElementById(idd);
    let label ;
    if(idd==='speed-up'){
      label = 0 ;
    }else if(idd ==='slow-down'){
      label = 1 ;
    }else if(idd ==='turn-left'){
      label = 2 ;
    }else if(idd === "turn-right"){
      label = 3 ;
    }
    console.log(idd) ;
    controllerDataset.addExample(truncatedMobileNet.predict(img),label);//0,1,2,3
    draw(img,canvas);
    
  }

    
  //获取图片（拍照）
  async function getImage() {
    let webcam =  await tfd.webcam(document.getElementById('camera')) ;
    const img = await webcam.capture();
    const processedImg =
        tf.tidy(() => img.expandDims(0).toFloat().div(127).sub(1));
    img.dispose();
    return processedImg;
  }
  //回显图片

  function draw(image, canvas) {
    const [width, height] = [224,224];
    const ctx = canvas.getContext('2d');
    const imageData = new ImageData(width, height);
    const data = image.dataSync();
    for (let i = 0; i < height * width; ++i) {
      const j = i * 4;
      imageData.data[j + 0] = (data[i * 3 + 0] + 1) * 127;
      imageData.data[j + 1] = (data[i * 3 + 1] + 1) * 127;
      imageData.data[j + 2] = (data[i * 3 + 2] + 1) * 127;
      imageData.data[j + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  const postMsg = (msg) => {
    //console.log(msg)
    localStorage.setItem("temp", msg) ;
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>A shooting plane game using AR by <b>Ant_ony</b></p>
      </header>
      <div className='container'>
        <div className='upper-container'>
          <div className='game-container'>
            <iframe src='../game/4.0/index.html' id='iframe'></iframe>
          </div>
          <div className='information-container'>
            <div id="camera-outer">
              <div id="camera-inner">
                <video id="camera" width='224px' height='224px' autoPlay={true} muted={true} playsInline={true} ></video>
                {/* <canvas id="canvas" ></canvas> */}
              </div>
            </div>
            <div className='train-start'>
              <LoadingButton train={train} ref={childRef}></LoadingButton>
              <p id='loss'>Loss :</p>
              <div className='training-option'>
                <div><span><b>Learning Rate</b></span><select id='lr'>
                  <option value='0.00001'>0.00001</option>
                  <option value='0.0001'>0.0001</option>
                  <option value='0.001'>0.001</option>
                  <option value='0.003'>0.003</option>
                </select></div>
                <div><span><b>Batch Size</b></span><select id='batch'>
                  <option value='0.4'>0.4</option>
                  <option value='0.1'>0.1</option>
                  <option value='0.05'>0.05</option>
                  <option value='1.0'>1.0</option>
                </select></div>
                <div><span><b>Epochs</b></span><select id='epochs'>
                  <option value='20'>20</option>
                  <option value='10'>10</option>
                  <option value='40'>40</option>
                </select></div>
                <div><span><b>Hidden Units</b></span><select id='units'>
                <option value='100'>100</option>
                <option value='10'>10</option>
                <option value='200'>200</option>
                </select></div>
              </div>
            </div>
              
          </div>
        </div>
        <div id='note'><p>· Click to add examples to actions respectively</p></div>
        <div className='camera-container'>
          <div><Buttonm idd="speed-up" name="up" className='speed-up' getDraw={getDraw}/></div>
          <div><Buttonm idd="slow-down" name="down" getDraw={getDraw}/></div>
          <div><Buttonm idd="turn-left" name="left" getDraw={getDraw}/></div>
          <div><Buttonm idd="turn-right" name="right" getDraw={getDraw}/></div>
        </div>
        
      </div>
      
    </div>
  );
}

 //按钮组件
 function Buttonm(props) {
  const[count, setCount] = useState(0) ;
  return(
  <div className={props.name}>
    <div className='thumb-box-outer'>
      <div className='thumb-box-inner'>
        <canvas className='thumb' id={props.idd} height='224px' width='224px'></canvas>
      </div>
      <button className='record-button' id={props.idd + 'button'} width='120px' onClick={()=>{props.getDraw(props.idd);setCount(count+1)}} >
          <span>{props.name}</span>
      </button>
      <div><p>{count} examples</p></div>
    </div>
  </div>);
}

//loading按钮
function LoadingButton(props,ref) {
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoading) {//如果正在Loading,两秒钟之后设置false
      simulateNetworkRequest().then(() => {
        setLoading(false);
      });
    }
  }, [isLoading]);

  useImperativeHandle(ref, ()=>({
    handleLoad : () => {
      setLoading(false) ;  
    }
  }))
  

  const handleClick = () => {//点击之后设置loading为true
      setLoading(true);
      props.train() ;
  };

  return (
    <Button
      variant="primary"
      disabled={isLoading}
      onClick={!isLoading ? handleClick : null}
    >
      {isLoading ? 'Loading…' : 'Click to train'}
    </Button>
  );
}
LoadingButton = forwardRef(LoadingButton) ;

function simulateNetworkRequest() {
  return new Promise((resolve) => setTimeout(resolve, 10000));
}



//导入数据训练
//train主函数

export default App;
