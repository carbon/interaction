module Carbon { 
  export class Interaction {
     
    hasData = false;
    enableDraw = false;
    maxPoints = 100;
    
    started = 0;
    elapsed = 0;
      
    width: number;
    height: number;
      
    observers = [ ];
    
    drawer: CanvasDrawer;
   
    path = [ ];
    clicks = [ ];
    keystrokes = [ ];  
     
    constructor() { }
  
    start() {
      this.started =  (new Date() - 0);
      
      this.observers.push(Carbon.observe(document.body, 'click', this.onClick.bind(this)));
      this.observers.push(Carbon.observe(document.body, 'keypress', this.onKeyPress.bind(this)));
      this.observers.push(Carbon.observe(document.body, 'mousemove', this.onMouseMove.bind(this).throttle(100)));

      this.width = window.innerWidth;
      this.height = window.innerHeight;
    }
  
    stop() {
      while (this.observers.length > 0) {
        var observer = this.observers.pop();
        
        observer.stop();
      }
    }
  
    onMouseMove(e) {
      if (this.path.length > this.maxPoints) {
        this.path.shift();
      }
  
      this.path.push([ e.pageX, e.pageY, new Date() - this.started ]);
  
      this.onUpdate();
    }
  
    onKeyPress(e) {
      var position = $(e.target).offset();
  
      if (e.target.value) {
        position.left = position.left + e.target.value.length * 6;
      }
  
      this.keystrokes.push([ parseInt(position.left), parseInt(position.top), new Date() - this.started ]);
  
      this.onUpdate();
    }
  
    onClick(e) {
      this.clicks.push([ e.pageX, e.pageY, new Date() - this.started ]);
      
      this.onUpdate();
    }
  
    onUpdate() {
      this.hasData = true;
      
      this.elapsed = new Date() - this.started;
  
      if (this.enableDraw) {
        
        if (!this.drawer) this.drawer = new CanvasDrawer();
        
        this.drawer.draw(this);
      }
    }
  
    getData() {
      return { 
        elapsed    : this.elapsed,
        width      : this.width,
        height     : this.height,
        clicks     : this.clicks,
        path      : this.path,
        keystrokes : this.keystrokes
      };
    }
  
    ease(t, b, c, d) : number {
      // // t: current time, b: begInnIng value, c: change In value, d: duration
      // http://www.timotheegroleau.com/Flash/experiments/easing_function_generator.htm
  
      // cubic
  
      var tc = (t /= d) * t* t;
  
      return b + c * (tc);
    }
  
    getValue(point) {
      let value = point[2] / this.elapsed;
  
      return this.ease(value, 0, 1, 1);
    }
  }
  
  export class CanvasDrawer {
     element: HTMLCanvasElement;
     cxt: CanvasRenderingContext2D;
     
     scale = 1;
     
     constructor() { 
       
     }
     
     draw (interaction: Interaction) {
      if (!this.cxt) {      
        let element = document.createElement('canvas');
       
        element.width = interaction.width * this.scale;
        element.height = interaction.height * this.scale;
        
        element.style.position = 'fixed';
        element.style.top = '0';
        element.style.left = '0';
        element.style.pointerEvents = 'none';
        element.style.zIndex = '1000';
  
        document.body.appendChild(element);

        var ctx = element.getContext('2d');
  
        // ctx.fillRect(25,25,100,100);
  
        ctx.canvas.width  = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
  
        this.cxt = ctx;
      }
  
      var ctx = this.cxt;
      
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
      var last;
  
      for (var a of interaction.path) {
        let value = interaction.getValue(a);
  
        ctx.strokeStyle = 'rgba(255, 255, 255,' +  value + ')';
      
        if (last) {
          ctx.beginPath();
  
          ctx.moveTo(last[0], last[1]);
        }
  
        ctx.lineWidth = (value * 2) + 1;
  
        ctx.lineTo(a[0], a[1]);
  
        ctx.stroke();
  
        ctx.closePath();
  
        last = a;
      }
    
      for (var a of interaction.keystrokes) {
        let value = interaction.getValue(a);
        let size = (value * 5) + 3;
        let color = '#65cf80';
  
        ctx.fillStyle = 'rgba(0, 255, 0,' +  value + ')' ;
  
        ctx.beginPath();
        ctx.arc(a[0], a[1], size, 0, Math.PI * 2, true); 
        ctx.closePath();
        ctx.fill();
      }
  
      for (var a of interaction.clicks) {
        let value = interaction.getValue(a);
        let size = (value * 10) + 5;
        
        ctx.beginPath();
        ctx.arc(a[0], a[1], size, 0, Math.PI * 2, true); 
        ctx.closePath();
  
        ctx.fillStyle = 'rgba(255, 0, 0,' +  value + ')' ;      
        ctx.fill();
      }
    }
  }
}
