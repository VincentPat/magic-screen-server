(function() {
    // 协助方法
    var rand = function(rMi, rMa){return ~~((Math.random()*(rMa-rMi+1))+rMi);}
    var hitTest = function(x1, y1, w1, h1, x2, y2, w2, h2){return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1);};
    window.requestAnimFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(a){window.setTimeout(a,1E3/60)}}();
    var getHSLA = function(h, s, l, a) {
        return 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')';
    };
    /*=============================================================================*/	
    /* 烟花时刻
    /*=============================================================================*/
    window.Fireworks = function(o) {
        /*=============================================================================*/	
        /* 自身
        /*=============================================================================*/
        var self = this;
        // 初始化
        self.init = function() {
            var options = o || {};
            self.dt = 1; // 前进量
            self.oldTime = Date.now(); // 当前帧时间
            // 画布设置
            self.canvas = document.createElement('canvas');
            self.canvas.onselectstart = function() {
                return false;
            };
            var cw = options.width || window.innerWidth;
            var ch = options.height || window.innerHeight;
            self.canvas.width = self.cw = cw;
            self.canvas.height = self.ch = ch;	
            self.ctx = self.canvas.getContext('2d');
            self.ctx.lineCap = 'round';
            self.ctx.lineJoin = 'round';
            var id = options.id || 'canvas-container';
            self.canvasContainer = document.getElementById(id);
            self.canvasContainer.appendChild(self.canvas);
            // 烟花参数
            self.currentType = 'Normal'; // 当前类型
            self.origin = {
                x: options.startX || self.cw / 2,
                y: options.startY || self.ch
            };
            self.fireworks = [];
            self.lineWidth = 1; // 烟花粒大小
            self.partCount = 30; // 粒子数量
            self.mx = self.cw / 2; // 爆炸目标位置X
            self.my = self.ch / 2; // 爆炸目标位置Y
            self.currentHue = 170; // 当前色调
            self.partSpeed = 5; // 粒子的速度
            self.partSpeedVariance = 10; // 粒子的速度方差，可以理解成烟花中每个粒子的速度偏差值
            self.partWind = 50; // 粒子周围风力，风力越大粒子飞行曲线越弯曲
            self.partFriction = 5; // 粒子摩擦力，用于控制烟花大小
            self.partGravity = 1; // 粒子重力
            self.hueMin = 0; // 色调最小值
            self.hueMax = 255; // 色调最大值
            self.fworkSpeed = 2; // 发射初速度
            self.fworkAccel = 4; // 发射加速度
            self.hueVariance = 30;    // 色调方差，可以理解成每一个烟花的色彩偏差值
            self.flickerDensity = 20; // 烟花的闪烁密度
            self.showShockwave = false; // 是否显示震荡
            self.showTarget = false; // 是否显示爆炸目标
            self.clearAlpha = 25; // 消失后透明度
            self.decay = 30; // 衰变速度

            self.setOptions('Normal');
            self.bindEvents();			
            self.canvasLoop();
        };
        // 设置参数
        self.setOptions = function(options) {
            // 参数覆盖
            if (typeof options === 'object') {
                Object.keys(options).forEach(function(key) {
                    self[key] = options[key];
                });
                self.currentType = 'Custom';
            } else if (typeof options === 'string'
                && options in self.preset) {
                Object.keys(self.preset[options]).forEach(function(key) {
                    self[key] = self.preset[options][key];
                });
                self.currentType === options;
            }
        };
        // 清空场景
        self.clear = function() {
            self.fireworks = [];
            self.ctx.clearRect(0, 0, self.cw, self.ch);
        };
        // 计算前进量
        self.updateDelta = function() {
            var newTime = Date.now();
            self.dt = (newTime - self.oldTime) / 16;
            self.dt = (self.dt > 5) ? 5 : self.dt;
            self.oldTime = newTime;

            // self.dt = 1;

            var fps = Math.round(self.dt * 60);
            self.ctx.font = '30px sans-serif';
            self.ctx.fillStyle = '#fff';
            self.ctx.fillText('FPS:' + fps, 0, 30);
            self.ctx.restore();
        };
        // 循环渲染
        self.canvasLoop = function() {
            requestAnimFrame(self.canvasLoop, self.canvas);
            // self.updateDelta();
            self.ctx.globalCompositeOperation = 'destination-out';
            self.ctx.fillStyle = 'rgba(0,0,0,'+self.clearAlpha/100+')';
            self.ctx.fillRect(0,0,self.cw,self.ch);
            self.ctx.globalCompositeOperation = 'lighter';
            self.updateFireworks();
            self.fireworks.forEach(function(firework) {
                firework.updateParticles();
            });
            self.drawFireworks();
            self.fireworks.forEach(function(firework) {
                firework.drawParticles();
            });			
        };
        // 绑定事件
        self.bindEvents = function() {
            // 窗口缩放
            window.addEventListener('resize', function() {
                clearTimeout(self.timeout);
                self.timeout = setTimeout(function() {
                    self.ctx.lineCap = 'round';
                    self.ctx.lineJoin = 'round';
                }, 100);
            });
            // 按下鼠标
            self.canvas.addEventListener('mousedown', function(e) {
                self.createCursorFireworks(e);
                self.canvas.addEventListener('mousemove', self.createCursorFireworks);
            });
            // 松开鼠标
            self.canvas.addEventListener('mouseup', function() {
                self.canvas.removeEventListener('mousemove', self.createCursorFireworks);
            });		
        };
        // 自动模式
        self.autoPlay = function(time) {
            var t = time || 100;
            var types = ['Normal', 'Fall', 'Bling', 'Long'];
            self.isAutoPlaying = true;
            self.autoFire(t);
        };
        // 自动点火
        self.autoFire = function(t) {
            self.createRandomFireworks(self.currentType);
            self.autoInterval = setTimeout(function() {
                self.autoFire(t)
            }, t);
        };
        // 停止自动
        self.stopAutoPlay = function() {
            self.isAutoPlaying = false;
            clearInterval(self.autoInterval);
            self.autoInterval = null;
        };
        // 暂停自动播放
        self.pauseAutoPlay = function() {
            clearInterval(self.autoInterval);
            self.autoInterval = null;
        };
        // 获取烟花参数
        self.getFireworkOptions = function() {
            var keys = [
                'fireworks',
                'lineWidth',
                'partCount',
                'mx',
                'my',
                'cw',
                'ch',
                'dt',
                'ctx',
                'currentHue',
                'hueMin',
                'hueMax',
                'hueVariance',
                'fworkSpeed',
                'fworkAccel',
                'partSpeed',
                'partSpeedVariance',
                'partWind',
                'partFriction',
                'partGravity',
                'flickerDensity',
                'showShockwave',
                'showTarget',
                'clearAlpha',
                'decay'
            ];
            var options = {};
            keys.forEach(function (key) {
                options[key] = self[key];
            });
            return options;
        };
        // 预设烟花参数
        self.preset = {
            // 普通
            Normal: {
                fworkSpeed: 4,
                fworkAccel: 0,
                partCount: 50,
                partSpeed: 5,
                partSpeedVariance: 10,
                partWind: 0,
                partFriction: 5,
                partGravity: 1,
                flickerDensity: 20,
                lineWidth: 1,
                range: {
                    x: [10, 90],
                    y: [2, 20]
                }
            },
            // 散落
            Fall: {
                fworkSpeed: 4,
                fworkAccel: 0,
                partCount: 150,
                partSpeed: 5,
                partSpeedVariance: 10,
                partWind: 10,
                partFriction: 12,
                partGravity: 4,
                flickerDensity: 30,
                hueMin: 0,
                hueMax: 360,
                hueVariance: 30,
                lineWidth: 1,
                decay: 20,
                range: {
                    x: [20, 80],
                    y: [20, 30]
                }
            },
            // 长久
            Long: {
                fworkSpeed: 10,
                fworkAccel: 0,
                partCount: 50,
                partSpeed: 6,
                partSpeedVariance: 2,
                partWind: 100,
                partFriction: 4,
                partGravity: 0,
                flickerDensity: 0,
                lineWidth: 4,
                decay: 14,
                range: {
                    x: [30, 70],
                    y: [30, 50]
                }
            },
            // 闪烁
            Bling: {
                fworkSpeed: 6,
                fworkAccel: 0,
                partCount: 120,
                partSpeed: 20,
                partSpeedVariance: 10,
                partWind: 100,
                partFriction: 50,
                partGravity: 0,
                flickerDensity: 20,
                lineWidth: 1,
                range: {
                    x: [40, 60],
                    y: [70, 90]
                }
            },
            Dream: {
                fworkSpeed: 4,
                fworkAccel: 0,
                partCount: 150,
                partSpeed: 4,
                partSpeedVariance: 2,
                partWind: 0,
                partFriction: 0,
                partGravity: 2,
                flickerDensity: 20,
                lineWidth: 4,
                decay: 20,
                range: {
                    x: [30, 70],
                    y: [30, 50]
                }
            }
        };

        /*=============================================================================*/	
        /* 烟花的操作
        /*=============================================================================*/
        // 创建
        self.createFireworks = function(targetX, targetY) {			
            self.fireworks.push(new Firework(self.origin.x, self.origin.y, targetX, targetY, self.getFireworkOptions()));
        };
        // 绘制
        self.drawFireworks = function() {
            self.fireworks.forEach(function(firework, index) {
                if (!firework.hit) firework.draw(index);
            });
        };
        // 渲染
        self.updateFireworks = function() {
            self.fireworks.forEach(function(firework, index) {
                if (!firework.hit) {
                    firework.update(index);
                } else if (firework.particles.length <= 0) {
                    self.fireworks.splice(index, 1);
                }
            });
        };
        // 在指针位置创建烟花
        self.createCursorFireworks = function(e) {
            self.mx = e.pageX - self.canvasContainer.offsetLeft;
            self.my = e.pageY - self.canvasContainer.offsetTop;
            self.currentHue = rand(self.hueMin, self.hueMax);
            self.createFireworks(self.mx, self.my);	
        };
        // 随机放烟花
        self.createRandomFireworks = function() {
            var range;
            if (self.currentType in self.preset) {
                var rangeSet = self.preset[self.currentType].range;
                range = {
                    x: rand(rangeSet.x[0], rangeSet.x[1]) / 100,
                    y: rand(rangeSet.y[0], rangeSet.y[1]) / 100
                };
            } else {
                range = {
                    x: rand(40, 60) / 100,
                    y: rand(10, 90) / 100
                };
            }
            var x = range.x * self.cw;
            var y = range.y * self.ch;
            self.mx = x - self.canvasContainer.offsetLeft;
            self.my = y - self.canvasContainer.offsetTop;
            self.currentHue = rand(self.hueMin, self.hueMax);
            self.createFireworks(self.mx, self.my);	
        };

        self.init();
    };

    /*=============================================================================*/	
    /* Particle Constructor
    /*=============================================================================*/
    var Particle = function(x, y, options) {
        this.x = x;
        this.y = y;
        this.options = options;
        this.coordLast = [
            {x: x, y: y},
            {x: x, y: y},
            {x: x, y: y}
        ]; // 坐标
        this.angle = rand(0, 360); // 角度
        var minSpeed = this.options.partSpeed - this.options.partSpeedVariance;
        minSpeed = minSpeed <= 0 ? 1 : minSpeed; // 最小速度
        var maxSpeed = this.options.partSpeed + this.options.partSpeedVariance; // 最大速度
        this.speed = rand(minSpeed, maxSpeed); // 当前速度
        this.friction = 1 - this.options.partFriction / 100; // 摩擦力
        this.gravity = this.options.partGravity / 2; // 重力
        var minHue = this.options.currentHue - this.options.hueVariance; // 最小色调
        var maxHue = this.options.currentHue + this.options.hueVariance; // 最大色调
        this.hue = rand(minHue, maxHue); // 当前色调
        options.hue = this.hue;
        this.brightness = rand(50, 80); // 亮度
        this.alpha = rand(40, 100) / 100; // 透明度
        var minDecay = this.options.decay - 10 < 0 ? 1 : this.options.decay - 10;
        var maxDecay = this.options.decay + 10 > 100 ? 100 : this.options.decay + 10;
        this.decay = rand(minDecay, maxDecay) / 1000; // 衰变
        this.wind = (rand(0, this.options.partWind) - (this.options.partWind / 2)) / 25; // 风力
        this.lineWidth = this.options.lineWidth; // 粒子大小
    };
    // 渲染
    Particle.prototype.update = function(index) {
        // 角度计算
        var radians = this.angle * Math.PI / 180;
        // 速度计算
        var vx = Math.cos(radians) * this.speed;
        var vy = Math.sin(radians) * this.speed + this.gravity;
        this.speed *= this.friction;
        // 位置变化
        this.coordLast[2].x = this.coordLast[1].x;
        this.coordLast[2].y = this.coordLast[1].y;
        this.coordLast[1].x = this.coordLast[0].x;
        this.coordLast[1].y = this.coordLast[0].y;
        this.coordLast[0].x = this.x;
        this.coordLast[0].y = this.y;
        this.x += vx * this.options.dt;
        this.y += vy * this.options.dt;
        // 下一周期系数变化
        this.angle += this.wind; // 根据风力转向
        this.alpha -= this.decay; // 衰变
        // 判断是否消失
        var cx = this.x - this.radius; // 当前粒子X位置
        var cy = this.y - this.radius; // 当前粒子Y位置
        var cw = this.radius * 2; // 当前粒子宽度
        var ch = this.radius * 2; // 当前粒子高度
        var isHit = hitTest(0, 0, this.options.cw, this.options.ch, cx, cy, cw, ch); // 是否已经出了屏幕边缘
        var isFade = this.alpha < .05; // 是否已经消失
        if (!isHit || isFade) {
            this.options.particles.splice(index, 1);	
        }
    };
    // 绘制
    Particle.prototype.draw = function() {
        // 绘制线条
        var coordRand = (rand(1, 3) - 1);
        this.options.ctx.beginPath();								
        this.options.ctx.moveTo(Math.round(this.coordLast[coordRand].x), Math.round(this.coordLast[coordRand].y));
        this.options.ctx.lineTo(Math.round(this.x), Math.round(this.y));
        this.options.ctx.closePath();				
        this.options.ctx.strokeStyle = getHSLA(this.hue, 100, this.brightness, this.alpha);
        this.options.ctx.stroke();				
        // 闪烁粒子
        if (self.flickerDensity > 0){
            var inverseDensity = 50 - this.options.flickerDensity;					
            if (rand(0, inverseDensity) === inverseDensity) {
                this.options.ctx.beginPath();
                var x = Math.round(this.x);
                var y = Math.round(this.y);
                var r = rand(this.lineWidth, this.lineWidth + 3) / 2;
                this.options.ctx.arc(x, y, r, 0, Math.PI*2, false);
                this.options.ctx.closePath();
                var randAlpha = rand(50, 100) / 100;
                this.options.ctx.fillStyle = getHSLA(this.hue, 100, this.brightness, randAlpha);
                this.options.ctx.fill();
            }	
        }
    };

    /*=============================================================================*/	
    /* Firework Constructor
    /*=============================================================================*/
    var Firework = function(startX, startY, targetX, targetY, options) {
        this.particles = [];
        this.x = startX; // 起始X位置
        this.y = startY; // 起始Y位置
        this.startX = startX;
        this.startY = startY;
        this.options = options;
        this.options.particles = this.particles;
        this.hitX = false; // 是否到达X位置
        this.hitY = false; // 是否到达Y位置
        this.hit = false; // 是否已爆炸
        this.coordLast = [
            {x: startX, y: startY},
            {x: startX, y: startY},
            {x: startX, y: startY}
        ]; // 坐标记录
        this.targetX = targetX; // 爆炸目标位置X
        this.targetY = targetY; // 爆炸目标位置Y
        this.speed = this.options.fworkSpeed; // 飞行速度
        this.angle = Math.atan2(targetY - startY, targetX - startX); // 飞行角度
        this.shockwaveAngle = Math.atan2(targetY - startY, targetX - startX) + (90 * (Math.PI / 180));
        this.acceleration = this.options.fworkAccel / 100; // 加速度
        this.hue = this.options.currentHue; // 色调
        this.brightness = rand(50, 80); // 亮度
        this.alpha = rand(50, 100) / 100; // 透明度
        this.lineWidth = this.options.lineWidth; // 粒子大小
        this.targetRadius = 1; // 目标半径
    };
    // 渲染
    Firework.prototype.update = function(index) {
        this.options.ctx.lineWidth = this.lineWidth;
        this.options.fIndex = index;
        // 位置变化
        vx = Math.cos(this.angle) * this.speed,
        vy = Math.sin(this.angle) * this.speed;
        this.speed *= 1 + this.acceleration;				
        this.coordLast[2].x = this.coordLast[1].x;
        this.coordLast[2].y = this.coordLast[1].y;
        this.coordLast[1].x = this.coordLast[0].x;
        this.coordLast[1].y = this.coordLast[0].y;
        this.coordLast[0].x = this.x;
        this.coordLast[0].y = this.y;
        // X位移
        if (this.startX >= this.targetX) {
            if (this.x + vx <= this.targetX) {
                this.x = this.targetX;
                this.hitX = true;
            } else {
                this.x += vx * this.options.dt;
            }
        } else {
            if (this.x + vx >= this.targetX) {
                this.x = this.targetX;
                this.hitX = true;
            } else {
                this.x += vx * this.options.dt;
            }
        }
        // Y位移
        if (this.startY >= this.targetY) {
            if (this.y + vy <= this.targetY) {
                this.y = this.targetY;
                this.hitY = true;
            } else {
                this.y += vy * this.options.dt;
            }
        } else {
            if (this.y + vy >= this.targetY) {
                this.y = this.targetY;
                this.hitY = true;
            } else {
                this.y += vy * this.options.dt;
            }
        }				
        // 是否爆炸
        if (this.hitX && this.hitY) {
            this.createParticles(this.targetX, this.targetY);
            this.hit = true;
        }
        // 是否显示爆炸目标
        if (this.options.showTarget) {
            if (this.targetRadius < 8) {
                this.targetRadius += .25 * this.options.dt;
            } else {
                this.targetRadius = 1 * this.options.dt;	
            }
        }
    };
    // 绘制
    Firework.prototype.draw = function() {
        this.options.ctx.lineWidth = this.lineWidth;
        // 绘制线条
        var coordRand = (rand(1, 3) - 1);					
        this.options.ctx.beginPath();							
        this.options.ctx.moveTo(Math.round(this.coordLast[coordRand].x), Math.round(this.coordLast[coordRand].y));
        this.options.ctx.lineTo(Math.round(this.x), Math.round(this.y));
        this.options.ctx.closePath();
        this.options.ctx.strokeStyle = getHSLA(this.hue, 100, this.brightness, this.alpha);
        this.options.ctx.stroke();	
        // 绘制目标
        if (this.options.showTarget) {
            this.options.ctx.save();
            this.options.ctx.beginPath();
            this.options.ctx.arc(Math.round(this.targetX), Math.round(this.targetY), this.targetRadius, 0, Math.PI*2, false)
            this.options.ctx.closePath();
            this.options.ctx.lineWidth = 1;
            this.options.ctx.stroke();
            this.options.ctx.restore();
        }
        // 绘制震荡效果
        if (this.options.showShockwave) {
            this.options.ctx.save();
            this.options.ctx.translate(Math.round(this.x), Math.round(this.y));
            this.options.ctx.rotate(this.shockwaveAngle);
            this.options.ctx.beginPath();
            this.options.ctx.arc(0, 0, 1 * (this.speed / 5), 0, Math.PI, true);
            var randAlpha = rand(25, 60) / 100;
            this.options.ctx.strokeStyle = getHSLA(this.hue, 100, this.brightness, randAlpha);
            this.options.ctx.lineWidth = this.lineWidth;
            this.options.ctx.stroke();
            this.options.ctx.restore();
        }								 
    };
    // 创建
    Firework.prototype.createParticles = function(x, y) {
        var countdown = this.options.partCount;
        while (countdown--) {
            this.particles.push(new Particle(x, y, this.options));
        }
    };
    // 绘制
    Firework.prototype.drawParticles = function() {
        this.particles.forEach(function(particle) {
            particle.draw();
        });
    };
    // 渲染
    Firework.prototype.updateParticles = function() {
        this.particles.forEach(function(particle, index) {
            particle.update(index);
        });
    };
})();