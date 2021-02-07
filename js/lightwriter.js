

class LightWriterCanvas
{
    brush = null;
    useSpeedScale = true;
    blurAmount = 4;
    
    _brushX = -1;
    _brushY = -1;
    _speedScale = 1;
    _canvas = null;
    _ctx = null;

    _bufferCanvas = null;
    _bufferCtx = null;

    _brush = null;

    constructor(brushUri)
    {
        this._canvas = document.createElement('canvas');;
        this._ctx = this._canvas.getContext('2d');

        this._bufferCanvas = document.createElement('canvas');;
        this._bufferCtx = this._bufferCanvas.getContext('2d');

        this._brush = new Image();
        this._brush.src = brushUri;
        
    }

    get canvas() {
        return this._canvas;
    }

    get context() {
        return this._ctx;
    }


    moveTo(x, y) {
        this._brushX = x;
        this._brushY = y;
    }

    lineTo(x,y) {
        // skip the first pos
        if (this._brushX == -1 || this._brushY == -1)
        {
            this.moveTo(x,y);
            return;
        }

        // get the delta
        let dirX = x - this._brushX;
        let dirY = y - this._brushY;
        // distance and steps to draw
        const len = Math.sqrt(Math.pow(dirX,2) + Math.pow(dirY,2));
        const steps = Math.ceil(len);
        // normalize the delta to get a direction vector
        dirX /= len;
        dirY /= len;

        // calc the speed perc
        let speedPerc = this.useSpeedScale 
            ? Math.min(Math.max(1 - ((len / 10) / 20), 0.01), 0.5)
            : 1;

        //
        let drawX = this._brushX + dirX;
        let drawY = this._brushY + dirY;

        for (let i = 0; i < steps; i++)
        {
            drawX += dirX;
            drawY += dirY;
            if (i == steps -1)
            {
                drawX = x;
                drawY = y;
            }
            this._drawBrushAtPoint(drawX, drawY, speedPerc);
        }

        // make this the new pos
        this._brushX = x;
        this._brushY = y;
    }


    _drawBrushAtPoint(x,y, targetScale = 1)
    {
        if (!(this._brush.complete || this._brush.width<=0))
        {
            return;
        }

        let {width, height} = this._brush;

        if (this.useSpeedScale)
        {
            this._speedScale += (targetScale - this._speedScale) * 0.4;
            width *= this._speedScale;
            height *= this._speedScale;

            if (width < 4) width = 4;
            if (height < 4) height = 4;
        } 



        this._ctx.drawImage(
            this._brush,
            Math.round(x - width / 2),
            Math.round(y - height / 2),
            width,
            height
        );
    
        

    }

    stepFade() {

        let {width, height} = this._canvas;

        // keep them the same size
        this._bufferCanvas.width = this._canvas.width;
        this._bufferCanvas.height = this._canvas.height;


        // put the image into the buffer
        //this._bufferCtx.putImageData(this._ctx.getImageData(0,0,width,height), 0, 0);
        this._bufferCtx.clearRect(0,0,width,height);
        this._bufferCtx.filter = `blur(${this.blurAmount}px)`;
       // this._bufferCtx.globalAlpha = 0.93;
        this._bufferCtx.drawImage(this._canvas, 0, 0);

        // hack to get rid of the lingering alphas - where rounding is not getting to 0
        var imageData = this._bufferCtx.getImageData(0,0,width,height);
        for (var i = 3; i < imageData.data.length; i+= 4)
        {
            if (imageData.data[i] <= 1)
                imageData.data[i] = 0;
        }
        this._bufferCtx.putImageData(imageData, 0, 0);
        

        this._ctx.clearRect(0,0, width, height);
        this._ctx.globalAlpha = 0.93;
        this._ctx.drawImage(this._bufferCanvas, 0, 0);

        this._ctx.globalAlpha = 1;

        
    }

}


class LightWriterDemo
{
    _container = null;
    
    _finalCanvas = null;
    _finalCtx = null;

    _layers = []; 
    _mouseX = -1;
    _mouseY = -1;


    constructor(container) {

        // container to control the size of everything
        this._container = container || document;
        this._container.classList.add('lwcontainer')
        
        // canvas to hold the final composite
        this._finalCanvas = document.createElement('canvas');
        this._container.appendChild(this._finalCanvas);
        this._finalCanvas.classList.add('lwcanvas');

        this._finalCanvas.addEventListener('mousemove', (evt) => this._onCanvasMouseMove(evt));


        // get the context
        this._finalCtx = this._finalCanvas.getContext('2d');


        let lw = new LightWriterCanvas('./images/WhiteSoft.png');
        lw.blurAmount = 6;
        this._layers.push(lw);


        lw = new LightWriterCanvas('./images/WhiteInner.png');
        lw.blurAmount = 2;
        this._layers.push(lw);       

        // resize listeners
        this._updateCanvasSize();
        window.addEventListener('resize', (evt) => this._updateCanvasSize() );

        window.requestAnimationFrame(() => this._redrawCanvas());
    }

    _onCanvasMouseMove(evt) 
    {
        let rect = this._finalCanvas.getBoundingClientRect();
        this._mouseX = evt.x - rect.left;
        this._mouseY = evt.y - rect.top;
    }


    _updateCanvasSize()
    {
        this._finalCanvas.width = this._finalCanvas.clientWidth;
        this._finalCanvas.height = this._finalCanvas.clientHeight;
        
        for (let layer of this._layers)
        {
            layer.canvas.width = this._finalCanvas.width;
            layer.canvas.height = this._finalCanvas.height;
        }
    }

    _redrawCanvas()
    {
        this._finalCtx.clearRect(0,0, this._finalCanvas.width, this._finalCanvas.height);

        

        for (let layer of this._layers)
        {
            // update the position
            layer.stepFade();
            layer.lineTo(this._mouseX, this._mouseY);
            this._finalCtx.drawImage(layer.canvas, 0, 0);
        }
    
        window.requestAnimationFrame(() => this._redrawCanvas());
    }

}