/**
 * SocketIO 管理器
 * @class SocketManager
 */
class SocketManager {
    constructor(io) {
        this.io = null;
        this.rooms = {};
        this.path = '/socket';
        this.init(io);
    }
    init(io) {
        // 定义接口路径
        this.io = io.of(this.path);
        // 连接成功事件
        this.io.on('connection', (socket) => {
            console.log(`连接成功：${socket.id}`);
            // 断开连接
            socket.on('disconnect', () => {
                console.log(`断开连接：${socket.id}`);
                const roomId = socket.currentRoom;
                if (socket.isRoomAdmin) { // 这个是房主
                    // 清空房间信息
                    delete(this.rooms[roomId]);
                    // 派发房间关闭事件
                    socket.to(roomId).emit('closeRoom');
                    console.log(`该房间已关闭：${roomId}`);
                } else {
                    this.rooms[roomId].count--;
                    console.log('当前房间人数:' + this.rooms[roomId].count);
                }
            });
            // 测试接口
            socket.on('test', (data) => {
                console.log('test');
                console.log(data);
            });
            // 创建房间
            socket.on('createRoom', (data, cb) => {
                // 房主ID
                const id = socket.id.split('#')[1];
                const roomId = data.roomId || id;
                socket.isRoomAdmin = true;
                // 记录房间信息
                this.rooms[roomId] = {
                    count: 0,
                    admin: socket
                };
                // 创建并加入房间
                socket.join(roomId, () => {
                    socket.currentRoom = roomId;
                    console.log(`创建房间成功：${roomId}`);
                    cb({ 
                        code: 0,
                        roomId
                    });
                });
            });
            // 进入房间
            socket.on('joinRoom', (data, cb) => {
                // 房间ID
                const roomId = data.roomId;
                const id = socket.id.split('#')[1];
                if (roomId in this.rooms) {
                    const roomAdmin = this.rooms[roomId].admin;
                    socket.join(roomId, () => {
                        socket.currentRoom = roomId;
                        console.log(`加入房间成功：${id}，房间ID：${roomId}`);
                        cb({ 
                            code: 0,
                            roomId
                        });
                        // 派发新用户通知给房主
                        roomAdmin.emit('newUser', { id });
                        // 房间人数加1
                        this.rooms[roomId].count++;
                        console.log('当前房间人数:' + this.rooms[roomId].count);
                    });
                } else {
                    cb({
                        code: 4000,
                        msg: `room ${roomId} is not exist.`
                    });
                }
            });
            // 发送信息给房主
            socket.on('msg', (data, cb) => {
                console.log(data);
                // 房间ID
                const roomId = data.roomId;
                if (roomId in this.rooms) {
                    const roomAdmin = this.rooms[roomId].admin;
                    const event = data.event;
                    if (typeof event === 'string') {
                        roomAdmin.emit(event, data);
                        cb({ 
                            code: 0
                        });
                    } else {
                        cb({
                            code: 4001,
                            msg: 'params error: event is necessary.'
                        });
                    }
                } else {
                    cb({
                        code: 4000,
                        msg: `room ${roomId} is not exist.`
                    });
                }
            });
            // 广播
            socket.on('broadcast', (data, cb) => {
                // 房间ID
                const roomId = data.roomId;
                if (roomId in this.rooms) {
                    const event = data.event;
                    if (typeof event === 'string') {
                        socket.to(roomId).emit(event, data);
                        cb({ 
                            code: 0
                        });
                    } else {
                        cb({
                            code: 4001,
                            msg: 'params error: event is necessary.'
                        });
                    }
                } else {
                    cb({
                        code: 4000,
                        msg: `room ${roomId} is not exist.`
                    });
                }
            });
        });
    }
}

module.exports = SocketManager;