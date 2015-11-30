var Carbon;
(function (Carbon) {
    var Interaction = (function () {
        function Interaction() {
            this.hasData = false;
            this.enableDraw = false;
            this.maxPoints = 100;
            this.started = 0;
            this.elapsed = 0;
            this.observers = [];
            this.path = [];
            this.clicks = [];
            this.keystrokes = [];
        }
        Interaction.prototype.start = function () {
            this.started = (new Date() - 0);
            this.observers.push(Carbon.observe(document.body, 'click', this.onClick.bind(this)));
            this.observers.push(Carbon.observe(document.body, 'keypress', this.onKeyPress.bind(this)));
            this.observers.push(Carbon.observe(document.body, 'mousemove', this.onMouseMove.bind(this).throttle(100)));
            this.width = window.innerWidth;
            this.height = window.innerHeight;
        };
        Interaction.prototype.stop = function () {
            while (this.observers.length > 0) {
                var observer = this.observers.pop();
                observer.stop();
            }
        };
        Interaction.prototype.onMouseMove = function (e) {
            if (this.path.length > this.maxPoints) {
                this.path.shift();
            }
            this.path.push([e.pageX, e.pageY, new Date() - this.started]);
            this.onUpdate();
        };
        Interaction.prototype.onKeyPress = function (e) {
            var position = $(e.target).offset();
            if (e.target.value) {
                position.left = position.left + e.target.value.length * 6;
            }
            this.keystrokes.push([parseInt(position.left), parseInt(position.top), new Date() - this.started]);
            this.onUpdate();
        };
        Interaction.prototype.onClick = function (e) {
            this.clicks.push([e.pageX, e.pageY, new Date() - this.started]);
            this.onUpdate();
        };
        Interaction.prototype.onUpdate = function () {
            this.hasData = true;
            this.elapsed = new Date() - this.started;
            if (this.enableDraw) {
                if (!this.drawer)
                    this.drawer = new CanvasDrawer();
                this.drawer.draw(this);
            }
        };
        Interaction.prototype.getData = function () {
            return {
                elapsed: this.elapsed,
                width: this.width,
                height: this.height,
                clicks: this.clicks,
                path: this.path,
                keystrokes: this.keystrokes
            };
        };
        Interaction.prototype.ease = function (t, b, c, d) {
            // // t: current time, b: begInnIng value, c: change In value, d: duration
            // http://www.timotheegroleau.com/Flash/experiments/easing_function_generator.htm
            var tc = (t /= d) * t * t;
            return b + c * (tc);
        };
        Interaction.prototype.getValue = function (point) {
            var value = point[2] / this.elapsed;
            return this.ease(value, 0, 1, 1);
        };
        return Interaction;
    })();
    Carbon.Interaction = Interaction;
    var InteractionDrawer = (function () {
        function InteractionDrawer(element) {
            this.scale = 1;
            if (element === undefined) {
                element = document.createElement('canvas');
                element.width = 100;
                element.height = 100;
                element.style.position = 'fixed';
                element.style.top = '0';
                element.style.left = '0';
                element.style.pointerEvents = 'none';
                element.style.zIndex = '1000';
                document.body.appendChild(element);
            }
            this.cxt = element.getContext('2d');
            this.element = element;
        }
        InteractionDrawer.prototype.draw = function (interaction) {
            var ctx = this.cxt;
            this.element.width = interaction.width * this.scale;
            this.element.height = interaction.height * this.scale;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            var last;
            for (var _i = 0, _a = interaction.path; _i < _a.length; _i++) {
                var a = _a[_i];
                var value = interaction.getValue(a);
                ctx.strokeStyle = 'rgba(255, 255, 255,' + value + ')';
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
            var color = '#65cf80';
            for (var _b = 0, _c = interaction.keystrokes; _b < _c.length; _b++) {
                var a = _c[_b];
                var value = interaction.getValue(a);
                var size = (value * 5) + 3;
                ctx.fillStyle = 'rgba(0, 255, 0,' + value + ')';
                ctx.beginPath();
                ctx.arc(a[0], a[1], size, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.fill();
            }
            for (var _d = 0, _e = interaction.clicks; _d < _e.length; _d++) {
                var a = _e[_d];
                var value = interaction.getValue(a);
                var size = (value * 10) + 5;
                ctx.beginPath();
                ctx.arc(a[0], a[1], size, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.fillStyle = 'rgba(255, 0, 0,' + value + ')';
                ctx.fill();
            }
        };
        return InteractionDrawer;
    })();
    Carbon.InteractionDrawer = InteractionDrawer;
})(Carbon || (Carbon = {}));
