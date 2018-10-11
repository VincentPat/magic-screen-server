window.onload = function() {
    // var vConsole = new VConsole();
    var rand = function(rMi, rMa){return ~~((Math.random()*(rMa-rMi+1))+rMi);}
    var types = ['Normal', 'Nimble'];
    var type = types[rand(0, types.length - 1)];
    var roomId = mssdk.query.roomId;
    mssdk.on('socketReady', function() {
        mssdk.joinRoom(roomId);
        // 向上滑释放烟花
        $('#game').swipeUp(function(e) {
            e.preventDefault();
            e.stopPropagation();
            mssdk.sendMsg({
                event: 'firework',
                roomId: roomId,
                type: type
            });
        });
    });
    mssdk.initSocket();
};