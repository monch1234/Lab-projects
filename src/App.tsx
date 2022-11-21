import React, { useState, useRef } from 'react'
import './App.css'
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from 'react-image-crop'
// import { canvasPreview } from './canvasPreview.ts';
import { imgPreview } from './imgPreview.ts';
import { useDebounceEffect } from './useDebounceEffect.ts';

import 'react-image-crop/dist/ReactCrop.css'

// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function App() {  
  const [imgSrc, setImgSrc] = useState('')
  const previewCanvasRef = useRef<HTMLImageElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [aspect, setAspect] = useState<number | undefined>(16 / 9)
  const [result, setResult] = useState<any>('');
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  



  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined) // Makes crop preview update between images.
      const reader = new FileReader()
      reader.addEventListener('load', () =>
        setImgSrc(reader.result.toString() || ''),
      )
      reader.readAsDataURL(e.target.files[0])
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspect))
    }

  }

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
        
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        const wid = completedCrop.width;
        const heig = completedCrop.height;
        setWidth(wid)
        setWidth(heig)
        imgPreview(imgRef.current, completedCrop, scale, ).then((result) =>
          setResult(result),
        )
      }

    },
    100,
    [completedCrop, scale, rotate],
  )

  function handleToggleAspectClick() {
    if (aspect) {
      setAspect(undefined)
    } else if (imgRef.current) {
      const { width, height } = imgRef.current
      
      setAspect(16 / 9)
      //setCrop(centerAspectCrop(width, height, 16 / 9))
    }
  }

  return (
    <div className="App">
      <div className='input'>
        <input type="file" accept="image/*" onChange={onSelectFile} />
        <div>
          <label htmlFor="rotate-input">Width: </label>
          <input
            type="number"
            value={width}
            onChange={(e) =>
              setWidth(width)
            }
          />
        </div>

        <div>
          <label htmlFor="rotate-input">Height: </label>
          <input
            type="number"
            value={width}
            onChange={(e) =>
              setHeight(height)
            }
          />
        </div>
        <div>
          <button onClick={handleToggleAspectClick}>
            Toggle aspect {aspect ? 'off' : 'on'}
          </button>
        </div>
      </div>
      {Boolean(imgSrc) && (
        <ReactCrop
        className='cropImg'
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspect}
        >
          <img
            ref={imgRef}
            alt="Crop me"
            src={imgSrc}
            style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
            onLoad={onImageLoad}
          />
        </ReactCrop>
      )}
      <div>
        <img
          ref={previewCanvasRef}
          src={result}
          alt=""
          style={{
            border: '1px solid black',
            objectFit: 'contain',
            width: completedCrop?.width,
            height: completedCrop?.height,
          }}
        />
        <a href={result} download className='download'>Download</a>
      </div>
    </div>
  )
}