window.onload = function() {
    window.fireworks = new Fireworks({
        startX: 100
    });
    // fireworks.setOptions('Dream');

    document.addEventListener('keydown', function(e) {
        if (e.keyCode === 32) {
            if (fireworks.isAutoPlaying) {
                fireworks.stopAutoPlay();
            } else {
                fireworks.autoPlay(50);
            }
        }
    });

    initVisibility(function() {
        console.log('暂停自动播放');
        if (fireworks.isAutoPlaying) fireworks.pauseAutoPlay();
    }, function() {
        console.log('继续自动播放');
        if (fireworks.isAutoPlaying) fireworks.autoPlay();
    });

    // this.initGUI(fireworks);
    var roomId = mssdk.query.roomId;
    if (roomId) {
        mssdk.on('socketReady', function() {
            mssdk.createRoom(roomId);
            mssdk.socket.on('firework', function(data) {
                console.log(data);
                var type = 'Normal';
                if (typeof data === 'object' 
                && typeof data.type === 'string') {
                    type = data.type;
                }
                fireworks.setOptions(type);
                fireworks.createRandomFireworks(type);
                console.log('放烟花，类型：' + type);
            });
        });
        mssdk.initSocket('admin');
    } else {
        console.warn('缺少参数：roomId');
    }
};

var initGUI = function(fworks) {
    /*=============================================================================*/	
    /* GUI
    /*=============================================================================*/	
    var guiPresets = {
        "preset": "Default",
        "remembered": {
            "Default": {
                "0": {
                "fworkSpeed": 2,
                "fworkAccel": 4,
                "showShockwave": false,
                "showTarget": true,
                "partCount": 30,
                "partSpeed": 5,
                "partSpeedVariance": 10,
                "partWind": 50,
                "partFriction": 5,
                "partGravity": 1,
                "flickerDensity": 20,
                "hueMin": 150,
                "hueMax": 200,
                "hueVariance": 30,
                "lineWidth": 1,
                "clearAlpha": 25
                }
            },
            "Normal": {
                "0": {
                "fworkSpeed": 2,
                "fworkAccel": 4,
                "showShockwave": false,
                "showTarget": true,
                "partCount": 30,
                "partSpeed": 5,
                "partSpeedVariance": 10,
                "partWind": 50,
                "partFriction": 5,
                "partGravity": 1,
                "flickerDensity": 20,
                "hueMin": 150,
                "hueMax": 200,
                "hueVariance": 30,
                "lineWidth": 1,
                "clearAlpha": 25
                }
            },
            "Anti Gravity": {
                "0": {
                "fworkSpeed": 4,
                "fworkAccel": 10,
                "showShockwave": true,
                "showTarget": false,
                "partCount": 150,
                "partSpeed": 5,
                "partSpeedVariance": 10,
                "partWind": 10,
                "partFriction": 10,
                "partGravity": -10,
                "flickerDensity": 30,
                "hueMin": 0,
                "hueMax": 360,
                "hueVariance": 30,
                "lineWidth": 1,
                "clearAlpha": 50
                }
            },
            "Battle Field": {
                "0": {
                "fworkSpeed": 10,
                "fworkAccel": 20,
                "showShockwave": true,
                "showTarget": true,
                "partCount": 200,
                "partSpeed": 30,
                "partSpeedVariance": 5,
                "partWind": 0,
                "partFriction": 5,
                "partGravity": 0,
                "flickerDensity": 0,
                "hueMin": 20,
                "hueMax": 30,
                "hueVariance": 10,
                "lineWidth": 1,
                "clearAlpha": 40
                }
            },
            "Mega Blast": {
                "0": {
                "fworkSpeed": 3,
                "fworkAccel": 3,
                "showShockwave": true,
                "showTarget": true,
                "partCount": 500,
                "partSpeed": 50,
                "partSpeedVariance": 5,
                "partWind": 0,
                "partFriction": 0,
                "partGravity": 0,
                "flickerDensity": 0,
                "hueMin": 0,
                "hueMax": 360,
                "hueVariance": 30,
                "lineWidth": 20,
                "clearAlpha": 20
                }
            },
            "Nimble": {
                "0": {
                "fworkSpeed": 10,
                "fworkAccel": 50,
                "showShockwave": false,
                "showTarget": false,
                "partCount": 120,
                "partSpeed": 10,
                "partSpeedVariance": 10,
                "partWind": 100,
                "partFriction": 50,
                "partGravity": 0,
                "flickerDensity": 20,
                "hueMin": 0,
                "hueMax": 360,
                "hueVariance": 30,
                "lineWidth": 1,
                "clearAlpha": 80
                }
            },
            "Slow Launch": {
                "0": {
                "fworkSpeed": 2,
                "fworkAccel": 2,
                "showShockwave": false,
                "showTarget": false,
                "partCount": 200,
                "partSpeed": 10,
                "partSpeedVariance": 0,
                "partWind": 100,
                "partFriction": 0,
                "partGravity": 2,
                "flickerDensity": 50,
                "hueMin": 0,
                "hueMax": 360,
                "hueVariance": 20,
                "lineWidth": 4,
                "clearAlpha": 10
                }
            },
            "Perma Trail": {
                "0": {
                "fworkSpeed": 4,
                "fworkAccel": 10,
                "showShockwave": false,
                "showTarget": false,
                "partCount": 150,
                "partSpeed": 10,
                "partSpeedVariance": 10,
                "partWind": 100,
                "partFriction": 3,
                "partGravity": 0,
                "flickerDensity": 0,
                "hueMin": 0,
                "hueMax": 360,
                "hueVariance": 20,
                "lineWidth": 1,
                "clearAlpha": 0
                }
            },
            "Default": {
                "0": {
                "fworkSpeed": 2,
                "fworkAccel": 4,
                "showShockwave": false,
                "showTarget": true,
                "partCount": 30,
                "partSpeed": 5,
                "partSpeedVariance": 10,
                "partWind": 50,
                "partFriction": 5,
                "partGravity": 1,
                "flickerDensity": 20,
                "hueMin": 150,
                "hueMax": 200,
                "hueVariance": 30,
                "lineWidth": 1,
                "clearAlpha": 25
                }
            },
            "Anti Gravity": {
                "0": {
                "fworkSpeed": 4,
                "fworkAccel": 10,
                "showShockwave": true,
                "showTarget": false,
                "partCount": 150,
                "partSpeed": 5,
                "partSpeedVariance": 10,
                "partWind": 10,
                "partFriction": 10,
                "partGravity": -10,
                "flickerDensity": 30,
                "hueMin": 0,
                "hueMax": 360,
                "hueVariance": 30,
                "lineWidth": 1,
                "clearAlpha": 50
                }
            },
            "Battle Field": {
                "0": {
                "fworkSpeed": 10,
                "fworkAccel": 20,
                "showShockwave": true,
                "showTarget": true,
                "partCount": 200,
                "partSpeed": 30,
                "partSpeedVariance": 5,
                "partWind": 0,
                "partFriction": 5,
                "partGravity": 0,
                "flickerDensity": 0,
                "hueMin": 20,
                "hueMax": 30,
                "hueVariance": 10,
                "lineWidth": 1,
                "clearAlpha": 40
                }
            },
            "Mega Blast": {
                "0": {
                "fworkSpeed": 3,
                "fworkAccel": 3,
                "showShockwave": true,
                "showTarget": true,
                "partCount": 500,
                "partSpeed": 50,
                "partSpeedVariance": 5,
                "partWind": 0,
                "partFriction": 0,
                "partGravity": 0,
                "flickerDensity": 0,
                "hueMin": 0,
                "hueMax": 360,
                "hueVariance": 30,
                "lineWidth": 20,
                "clearAlpha": 20
                }
            },
            "Nimble": {
                "0": {
                "fworkSpeed": 10,
                "fworkAccel": 50,
                "showShockwave": false,
                "showTarget": false,
                "partCount": 120,
                "partSpeed": 10,
                "partSpeedVariance": 10,
                "partWind": 100,
                "partFriction": 50,
                "partGravity": 0,
                "flickerDensity": 20,
                "hueMin": 0,
                "hueMax": 360,
                "hueVariance": 30,
                "lineWidth": 1,
                "clearAlpha": 80
                }
            },
            "Slow Launch": {
                "0": {
                "fworkSpeed": 2,
                "fworkAccel": 2,
                "showShockwave": false,
                "showTarget": false,
                "partCount": 200,
                "partSpeed": 10,
                "partSpeedVariance": 0,
                "partWind": 100,
                "partFriction": 0,
                "partGravity": 2,
                "flickerDensity": 50,
                "hueMin": 0,
                "hueMax": 360,
                "hueVariance": 20,
                "lineWidth": 4,
                "clearAlpha": 10
                }
            },
            "Perma Trail": {
                "0": {
                "fworkSpeed": 4,
                "fworkAccel": 10,
                "showShockwave": false,
                "showTarget": false,
                "partCount": 150,
                "partSpeed": 10,
                "partSpeedVariance": 10,
                "partWind": 100,
                "partFriction": 3,
                "partGravity": 0,
                "flickerDensity": 0,
                "hueMin": 0,
                "hueMax": 360,
                "hueVariance": 20,
                "lineWidth": 1,
                "clearAlpha": 0
                }
            }
        },
        "closed": true,
        "folders": {
            "Fireworks": {
                "preset": "Default",
                "closed": false,
                "folders": {}
            },
            "Particles": {
                "preset": "Default",
                "closed": true,
                "folders": {}
            },
            "Color": {
                "preset": "Default",
                "closed": true,
                "folders": {}
            },
            "Other": {
                "preset": "Default",
                "closed": true,
                "folders": {}
            }
        }
    };

    var gui = new dat.GUI({
        autoPlace: false,
        load: guiPresets,
        preset: 'Default'
    });
    var customContainer = document.getElementById('gui');
    customContainer.appendChild(gui.domElement);

    var guiFireworks = gui.addFolder('Fireworks');
    guiFireworks.add(fworks, 'fworkSpeed').min(1).max(10).step(1);
    guiFireworks.add(fworks, 'fworkAccel').min(0).max(50).step(1);
    guiFireworks.add(fworks, 'showShockwave');
    guiFireworks.add(fworks, 'showTarget');

    var guiParticles = gui.addFolder('Particles');
    guiParticles.add(fworks, 'partCount').min(0).max(500).step(1);	
    guiParticles.add(fworks, 'partSpeed').min(1).max(100).step(1);
    guiParticles.add(fworks, 'partSpeedVariance').min(0).max(50).step(1);
    guiParticles.add(fworks, 'partWind').min(0).max(100).step(1);
    guiParticles.add(fworks, 'partFriction').min(0).max(50).step(1);
    guiParticles.add(fworks, 'partGravity').min(-20).max(20).step(1);
    guiParticles.add(fworks, 'flickerDensity').min(0).max(50).step(1);

    var guiColor = gui.addFolder('Color');
    guiColor.add(fworks, 'hueMin').min(0).max(360).step(1);
    guiColor.add(fworks, 'hueMax').min(0).max(360).step(1);
    guiColor.add(fworks, 'hueVariance').min(0).max(180).step(1);

    var guiOther = gui.addFolder('Other');
    guiOther.add(fworks, 'lineWidth').min(1).max(20).step(1);
    guiOther.add(fworks, 'clearAlpha').min(0).max(100).step(1);
    guiOther.add(fworks, 'clear').name('Clear');

    gui.remember(fworks);
}

// 初始化页面可视回调
var initVisibility = function(hideCallback, resumeCallback) {
    // Set the name of the hidden property and the change event for visibility
    var hidden, visibilityChange; 
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }
    // If the page is hidden, pause the video;
    // if the page is shown, play the video
    function handleVisibilityChange() {
        if (document[hidden]) {
            if (typeof hideCallback === 'function') hideCallback();
        } else {
            if (typeof resumeCallback === 'function') resumeCallback();
        }
    }

    // Warn if the browser doesn't support addEventListener or the Page Visibility API
    if (typeof document.addEventListener === "undefined" || typeof document.hidden === "undefined") {
        console.log("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
    } else {
        // Handle page visibility change     
        document.addEventListener(visibilityChange, handleVisibilityChange, false);
    }
}