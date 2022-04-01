import React, { useRef, useEffect } from "react";
import * as cocossd from "@tensorflow-models/coco-ssd";
import  * as faceapi  from 'face-api.js';
import "./App.css";
import { drawRect } from "./utilities";
import axios from 'axios';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

toast.configure()

function App() {
 // const webcamRef = useRef(null);
  const canvasRef = useRef(null);

let employeename=[];
//  let images=['https://scontent-del1-2.xx.fbcdn.net/v/t1.6435-9/170770156_2913735242175877_7948503081294322597_n.jpg?_nc_cat=110&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=cGxoypr1ZGAAX-TQ61C&_nc_ht=scontent-del1-2.xx&oh=00_AT8b1kniRKweLFs1eCCIMiq7DbrJZ_G4m3pACYybjECO3g&oe=626251BC'
//   ,'https://scontent-del1-2.xx.fbcdn.net/v/t1.6435-9/151779013_2841874956028204_3420401339684533469_n.jpg?stp=dst-jpg_s851x315&_nc_cat=106&ccb=1-5&_nc_sid=da31f3&_nc_ohc=8DSE1Yy0t30AX-99K6d&tn=1RVHvI9QokO1Il2Y&_nc_ht=scontent-del1-2.xx&oh=00_AT8NSHqTjJn_g4PmvOyD6hVtqr0lpkl_vseNrc4S2bHqcw&oe=62635CC0']

let images=[];

  useEffect(()=>{
    const model_url = './models';
 
        Promise.all([
            faceapi.nets.faceRecognitionNet.loadFromUri(model_url),
            faceapi.nets.faceLandmark68Net.loadFromUri(model_url),
            faceapi.nets.ssdMobilenetv1.loadFromUri(model_url),
            faceapi.nets.tinyFaceDetector.loadFromUri(model_url),
          
            //calling api here to get employee name and images
            axios.get("http://localhost:9002/employees/22").then((res)=>{

              let employee= res.data ;
              employeename.push(employee.e_name)
              
              images.push(employee.e_email)
                  
              })
            
        ]).then(start);
    
  },[]);

  // Main function
  const runCoco = async () => {
    const video = document.getElementById('videoInput');
    const net = await cocossd.load();

    //  Loop and detect hands
    video.addEventListener('play', async () => {
      setInterval(() => {
        detect(net);
      }, 5000);
    })
  };

  const detect = async (net) => {
      const video = document.getElementById('videoInput');
      // Set canvas height and width
      canvasRef.current.width = video.width;
      canvasRef.current.height = video.height;
      // Make Detections
      const obj = await net.detect(video);
   
   console.log(obj);
  // console.log(obj[0].class);
 //  console.log(obj[1]);
 let count=0;
   obj.map(myobj=>{
   
    if(myobj.class==='cell phone'){
      toast.warning('Cell phone detected ',
      {position: toast.POSITION.TOP_CENTER})
    } 

    if(myobj.class==='person'){
     count++;
    }

    if(count>=2){
      toast.warning('another persion available during assessment',
      {position: toast.POSITION.TOP_CENTER})
     
    }

    })

    // if(obj.length===2)
    // {
    //    alert("another persion available during assessment")
    // }

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawRect(obj, ctx); 
    // }
  };

  const faceRecognition = async (video) => {
   
    const labeledDescriptors = await loadLabeledImages();
  //  console.log(labeledDescriptors)
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors,0.6);
  //  console.log(faceMatcher)
    // video.addEventListener('play', async () => {
        const canvas = faceapi.createCanvasFromMedia(video);
       // const canvas = faceapi.createCanvas(video);
       
        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
           
           // console.log("detection"+detections)
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            console.log("resized detection"+resizedDetections)
           canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
          
            const results = resizedDetections.map(d => 
           //   console.log(d.descriptor)
                 faceMatcher.findBestMatch(d.descriptor)
               
            )
            
            console.log(results)
            results.forEach((result, i) => {
                const box = resizedDetections[i].detection.box;
                const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
                drawBox.draw(canvas);

         
           console.log(result.label)
           

      // if(result.label !=='mohit')
      // {
      //   alert("someone other giving exam")
      // }
            })
        }, 5000)
    // })
}

// const loadLabeledImages = () => {
//    const labels = ['mohit','Md Anwar'] // for WebCam

//   return Promise.all(
//         labels.map(async (label) => {
//             const descriptions = []
//             for (let i = 1; i <= 3; i++) {
//                const img = await faceapi.fetchImage(`./labeled_images/${label}/${i}.jpg`);
//                // const img = await faceapi.fetchImage(image);
//                 const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
//                 descriptions.push(detections.descriptor)
//               //  console.log("image"+img)
//               //  console.log(detections)
//             }
//             console.log(label)
//             return new faceapi.LabeledFaceDescriptors(label, descriptions);
//         })
//     )
// }

const loadLabeledImages = () => {
 // const labels = ['Mohit','Pradeep','Md Anwar'] // for WebCam
  return Promise.all(

    employeename.map(async (label) => {
            const descriptions = []
          
            for (let i = 1; i <= 4; i++) {
              //abhiraj pic 
             // const img = await faceapi.fetchImage("https://scontent-del1-2.xx.fbcdn.net/v/t1.6435-9/170770156_2913735242175877_7948503081294322597_n.jpg?_nc_cat=110&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=cGxoypr1ZGAAX-TQ61C&_nc_ht=scontent-del1-2.xx&oh=00_AT8b1kniRKweLFs1eCCIMiq7DbrJZ_G4m3pACYybjECO3g&oe=626251BC");
          // const img = await faceapi.fetchImage(images[0]);
               
               const img = await faceapi.fetchImage(`./labeled_images/${label}/${i}.jpg`);
            //   const img = await faceapi.fetchImage('http://localhost:9002/1.jpg');
           // const img = await faceapi.fetchImage('https://storage.googleapis.com/studentmediaupload/user_profile/5/profile-photo');
               const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                descriptions.push(detections.descriptor);
           //     console.log(detections)

        
            }
           
            return new faceapi.LabeledFaceDescriptors(label, descriptions);
        })
    )
}


  const start = () => {
 
  const video = document.getElementById('videoInput');
      //  document.body.append('Models Loaded');

        navigator.getUserMedia(
            { video: {width: 720, height: 550} },
            stream => video.srcObject = stream,
            err => console.error(err)
        );
        //video.src = '../videos/speech.mp4'
      //  console.log('video added');
        faceRecognition(video);
        runCoco(video);
  }
  

  return (
    <div className="App">
      <header className="App-header">
        {/* <Webcam
          ref={webcamRef}
          muted={true} 
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        /> */}
        <video id="videoInput" width={"720"} height={"550"} muted  autoPlay/>

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 8,
             width: 640,
            //  width: 420,
             height: 480,
              //  height: 250,
          }}
        />
      </header>
    </div>
  );
}

export default App;
